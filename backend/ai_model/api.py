from fastapi import FastAPI, File, UploadFile
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import io
import json

app = FastAPI()

MODEL_PATH = r"C:\Users\rahul\Documents\ai\AI skin lession\ai_model\final_skin_model_B2_90plus.keras"
CLASS_JSON = r"C:\Users\rahul\Documents\ai\AI skin lession\ai_model\class_names.json"

with open(CLASS_JSON) as f:
    CLASS_NAMES = json.load(f)

model = load_model(MODEL_PATH)


def preprocess_image(image):
    image = image.resize((260, 260))
    arr = np.array(image).astype(np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr


@app.get("/")
def home():
    return {"status": "Skin API Running ✅"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    img = preprocess_image(image)

    preds = model.predict(img)[0]
    idx = int(np.argmax(preds))

    result = {
        "class": CLASS_NAMES[idx],
        "confidence": float(preds[idx]) * 100
    }

    return result
