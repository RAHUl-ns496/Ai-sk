from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import base64
import cv2
import os

# ============ APP SETUP ============
app = FastAPI()

# Allow React / Flutter / others
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ MODEL PATH ============
MODEL_PATH = "backend/ai_model/final_skin_model_B2_90plus.keras"

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"❌ Model not found at {MODEL_PATH}")

model = load_model(MODEL_PATH)

# ============ CLASS LABELS ============
CLASS_NAMES = [
    "Melanoma",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Dermatofibroma",
    "Vascular Lesion",
    "Actinic Keratosis",
    "Nevus"
]

# ============ IMAGE PROCESSING ============
def preprocess_image(img: Image.Image):
    img = img.resize((224, 224))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# ============ HEATMAP (GRADCAM) ============
def generate_heatmap(img_array):
    last_conv_layer = None

    for layer in model.layers[::-1]:
        if "conv" in layer.name:
            last_conv_layer = layer
            break

    if last_conv_layer is None:
        return None

    grad_model = tf.keras.models.Model(
        [model.inputs], 
        [last_conv_layer.output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = np.maximum(heatmap, 0) / np.max(heatmap)
    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap)

    return heatmap

# ============ API ROUTES ============

@app.get("/")
def home():
    return {"status": "✅ Skin Lesion API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...), patient_name: str = Form(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    img_array = preprocess_image(img)
    preds = model.predict(img_array)[0]

    class_index = np.argmax(preds)
    confidence = float(preds[class_index])

    # --- HEATMAP ---
    heatmap = generate_heatmap(img_array)

    heat_b64 = None
    if heatmap is not None:
        heatmap_img = Image.fromarray(heatmap).convert("RGB")
        buffered = io.BytesIO()
        heatmap_img.save(buffered, format="PNG")
        heat_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "patient_name": patient_name,
        "class": CLASS_NAMES[class_index],
        "confidence": round(confidence * 100, 2),
        "heatmap_base64": heat_b64
    }
