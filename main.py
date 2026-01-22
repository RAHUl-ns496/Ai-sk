import os
import io
import json
import base64
import logging
from datetime import datetime

# Force non-interactive matplotlib backend to avoid Tkinter errors on server
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Conv2D
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from PIL import Image
import cv2
import pandas as pd
from sklearn.metrics import confusion_matrix, roc_curve, auc
from sklearn.preprocessing import label_binarize

# ---------- CONFIG ----------
# Running from root 'skin' directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Adjusted paths to point to backend/ai_model/
MODEL_PATH = os.path.join(BASE_DIR, "backend", "ai_model", "final_skin_model_B2_90plus.keras")
CLASS_JSON = os.path.join(BASE_DIR, "backend", "ai_model", "class_names.json")
# Assuming dataset/test is in the root or check if it needs adjustment
TEST_DIR = os.path.join(BASE_DIR, "dataset", "test")

BATCH_SIZE = 32

# ---------- LOGGING ----------
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("skin-api")

# ---------- APP ----------
app = FastAPI(title="Skin Lesion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- LOAD CLASS NAMES ----------
if not os.path.exists(CLASS_JSON):
    log.warning(f"class_names.json not found at {CLASS_JSON}; falling back to default names.")
    CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
else:
    with open(CLASS_JSON, "r") as f:
        CLASS_NAMES = json.load(f)
    # ensure they are simple lower-case codes
    CLASS_NAMES = [str(c).strip().lower() for c in CLASS_NAMES]

log.info("Class names loaded: %s", CLASS_NAMES)

# ---------- LOAD MODEL ----------
if not os.path.exists(MODEL_PATH):
    log.error("Model file not found at: %s", MODEL_PATH)
    # Don't raise error immediately to allow server to start, but predict will fail
    # raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    model = None
else:
    log.info("Loading model (this may take a while)...")
    try:
        model = load_model(MODEL_PATH)
        log.info("Model loaded successfully")
    except Exception as e:
        log.error(f"Failed to load model: {e}")
        model = None

# determine model input size (height, width)
IMG_SIZE = 260 # default fallback
if model:
    try:
        # model.input_shape may be like (None, H, W, 3) or [(None,H,W,3)]
        shape = model.input_shape
        if isinstance(shape, list):
            shape = shape[0]
        _, H, W, C = shape
        IMG_SIZE = int(H)
        log.info("Detected model input size: %dx%d", IMG_SIZE, IMG_SIZE)
    except Exception:
        log.warning("Could not auto-detect model input size; using fallback %d", IMG_SIZE)

# ---------- FIND LAST CONV LAYER FOR GRADCAM ----------
LAST_CONV_LAYER = None
if model:
    for layer in reversed(model.layers):
        # check for Conv2D by class OR 4D output shape
        try:
            if isinstance(layer, Conv2D) or (hasattr(layer, "output_shape") and len(layer.output_shape) == 4):
                LAST_CONV_LAYER = layer.name
                break
        except Exception:
            continue

    if LAST_CONV_LAYER is None:
        log.warning("Could not find a convolutional layer for Grad-CAM; heatmaps will be blank.")
    else:
        log.info("Using last conv layer for Grad-CAM: %s", LAST_CONV_LAYER)


# ---------- MONGO (optional) ----------
try:
    client = MongoClient("mongodb://127.0.0.1:27017", serverSelectionTimeoutMS=2000)
    # Check connection
    # _ = client.server_info() 
    # Calling server_info might block if mongo is down, so we trust lazy connect or set timeout
    db = client["skin_lesion_db"]
    collection = db["predictions"]
    log.info("MongoDB connected (lazy)")
except Exception as e:
    collection = None
    log.warning("MongoDB not connected: %s", e)


# ---------- DISEASE INFO (map short codes) ----------
DISEASE_INFO = {
    "mel": {
        "name": "Melanoma",
        "description": "A serious form of skin cancer that develops in the melanocytes. It is the most dangerous type of skin cancer and is highly metastatic if not caught early.",
        "recommendation": "Immediate dermatologist consultation and excisional biopsy is urgently recommended. Utilize the ABCDE criteria for self-assessment.",
        "characteristics": "Often presents as an asymmetrical lesion with irregular borders, varying color (black, brown, red, white, or blue), a large diameter (usually >6mm), and evolving size/shape.",
        "severity": 5,
        "common_treatment": "Surgical excision, sentinel lymph node biopsy, immunotherapy (e.g., PD-1 inhibitors), targeted therapy, or chemotherapy.",
        "risk_factors": "Family history of melanoma, excessive UV exposure (sun/tanning beds), fair skin, presence of many moles (especially atypical ones), and history of severe sunburns."
    },
    "bcc": {
        "name": "Basal Cell Carcinoma",
        "description": "The most common skin cancer, arising from the basal cells of the epidermis. It is slow growing and rarely spreads (metastasizes).",
        "recommendation": "Clinical removal and regular skin monitoring required. Treatment options include Mohs surgery, excision, or curettage and electrodessication.",
        "characteristics": "Appears as a pearly or translucent bump, often with rolled borders and fine blood vessels (telangiectasias) visible on the surface. May look like a persistent sore that heals and returns.",
        "severity": 3,
        "common_treatment": "Mohs surgery (micrographic surgery), standard surgical excision, curettage and electrodessication, or cryosurgery.",
        "risk_factors": "Chronic sun exposure, advanced age, fair skin, previous BCC diagnosis, and radiation therapy history."
    },
    "bkl": {
        "name": "Benign Keratosis-like Lesions (Seborrheic Keratosis)",
        "description": "Non-cancerous skin lesions that may look warty, scaly, or 'stuck on.' They are very common, especially after middle age.",
        "recommendation": "No immediate action required unless irritated or causing cosmetic concern. Observe for sudden changes.",
        "characteristics": "Waxy, scaly, and slightly raised appearance, often brown or black. Can feel greasy. They look like they could be peeled off the skin.",
        "severity": 1,
        "common_treatment": "Usually none. Removal may involve cryotherapy, curettage, or laser if cosmetically desired or irritated.",
        "risk_factors": "Genetics, age (older individuals), and frequent sun exposure (though not directly caused by sun)."
    },
    "df": {
        "name": "Dermatofibroma",
        "description": "A benign, firm skin growth, typically small, often appearing on the lower legs after minor skin injury or insect bite.",
        "recommendation": "No treatment required unless painful, itchy, or the diagnosis is uncertain. They are harmless.",
        "characteristics": "Firm, raised bump, ranging in color from pink to brown. Key identifying feature: dimpling sign (lesion pulls inward when squeezed).",
        "severity": 1,
        "common_treatment": "Usually none. Excision may be performed, but can leave a small scar.",
        "risk_factors": "Minor trauma to the skin, insect bites, and more common in women."
    },
    "nv": {
        "name": "Nevus (Common Mole)",
        "description": "A common, non-cancerous skin growth (mole), usually uniform in color and shape, formed by clusters of melanocytes.",
        "recommendation": "Observe for changes using the 'Ugly Duckling' rule. Consult a dermatologist immediately if any suspicious changes (ABCDE) occur.",
        "characteristics": "Symmetrical shape, regular borders, uniform light to dark brown color, typically smaller than 6mm in diameter. Stable over time.",
        "severity": 1,
        "common_treatment": "Usually none. Surgical removal if cosmetically undesirable or if a biopsy is required due to suspected atypia.",
        "risk_factors": "Genetics, sun exposure, and high total number of moles."
    },
    "vasc": {
        "name": "Vascular Lesion (Angioma, Hemangioma)",
        "description": "Lesions caused by abnormalities or proliferation of blood vessels. They are usually benign, such as cherry angiomas or spider angiomas.",
        "recommendation": "Usually harmless; monitor for changes. Treatment is generally for cosmetic reasons only.",
        "characteristics": "Appears red, purple, or blue due to blood content. May be flat (macule) or slightly raised (papule). Cherry angiomas are bright red, dome-shaped papules.",
        "severity": 1,
        "common_treatment": "Laser therapy, electrocautery, or cryotherapy, typically for cosmetic removal.",
        "risk_factors": "Genetics, aging (cherry angiomas increase with age), and pregnancy/hormonal changes."
    },
    "akiec": {
        "name": "Actinic Keratosis (Solar Keratosis)",
        "description": "Pre-cancerous skin lesion caused by long-term cumulative sun exposure. It is considered squamous cell carcinoma in situ (early-stage cancer confined to the outermost layer).",
        "recommendation": "Consult a dermatologist; immediate treatment is often recommended to prevent progression to invasive squamous cell carcinoma.",
        "characteristics": "Rough, scaly, crusty patches, ranging in color from skin-toned to reddish-brown. Often felt more easily than seen, feeling like sandpaper.",
        "severity": 4,
        "common_treatment": "Cryotherapy (freezing), topical chemotherapy (e.g., 5-fluorouracil), photodynamic therapy (PDT), or chemical peels.",
        "risk_factors": "Excessive cumulative sun exposure, fair skin, immunosuppression, and older age."
    }
}
# ===================== DOCTORS DATABASE =====================

DOCTORS = {
    "Melanoma": [
        {
            "name": "Dr. Rajesh Kumar",
            "specialist": "Dermato-Oncologist",
            "hospital": "Apollo Cancer Center",
            "city": "Delhi",
            "contact": "+91-9876543210"
        },
        {
            "name": "Dr. Aditi Sharma",
            "specialist": "Skin Oncology",
            "hospital": "AIIMS",
            "city": "Delhi",
            "contact": "+91-9123456789"
        },
        {
            "name": "Dr. Sameer Khan",
            "specialist": "Surgical Oncologist",
            "hospital": "Tata Memorial Hospital",
            "city": "Mumbai",
            "contact": "+91-9820101010"
        }
    ],

    "Basal Cell Carcinoma": [
        {
            "name": "Dr. Neha Varma",
            "specialist": "Dermatologist",
            "hospital": "Fortis",
            "city": "Mumbai",
            "contact": "+91-9898989898"
        },
        {
            "name": "Dr. Vikram Das",
            "specialist": "Mohs Surgeon",
            "hospital": "Medanta",
            "city": "Gurugram",
            "contact": "+91-8811223344"
        },
        {
            "name": "Dr. Sanjana Reddy",
            "specialist": "Dermatologist",
            "hospital": "Continental Hospitals",
            "city": "Hyderabad",
            "contact": "+91-7700112233"
        }
    ],

    "Nevus": [
        {
            "name": "Dr. Sunil Patel",
            "specialist": "Dermatologist",
            "hospital": "Civil Hospital",
            "city": "Ahmedabad",
            "contact": "+91-9000012345"
        },
        {
            "name": "Dr. Maya Singhania",
            "specialist": "Cosmetic Dermatologist",
            "hospital": "Breach Candy Hospital",
            "city": "Mumbai",
            "contact": "+91-9821556677"
        }
    ],

    "Benign Keratosis-like Lesions": [
        {
            "name": "Dr. Rakesh Malhotra",
            "specialist": "Dermatologist",
            "hospital": "Max Healthcare",
            "city": "Delhi",
            "contact": "+91-9009988776"
        },
        {
            "name": "Dr. Lakshmi Murthy",
            "specialist": "General Dermatologist",
            "hospital": "Aster CMI",
            "city": "Bangalore",
            "contact": "+91-8054321098"
        }
    ],

    "Vascular Lesion": [
        {
            "name": "Dr. Pooja Iyer",
            "specialist": "Plastic Surgeon",
            "hospital": "Manipal Hospital",
            "city": "Bangalore",
            "contact": "+91-8887776665"
        },
        {
            "name": "Dr. Siddharth Rao",
            "specialist": "Vascular Surgeon",
            "hospital": "Apollo Hospitals",
            "city": "Chennai",
            "contact": "+91-9940101010"
        }
    ],

    "Actinic Keratosis": [
        {
            "name": "Dr. Kunal Mehta",
            "specialist": "Dermatologist",
            "hospital": "Jaslok Hospital",
            "city": "Mumbai",
            "contact": "+91-7999887766"
        },
        {
            "name": "Dr. Anita Nair",
            "specialist": "Dermatologist",
            "hospital": "KIMS Hospital",
            "city": "Kochi",
            "contact": "+91-9556677889"
        }
    ],

    "Dermatofibroma": [
        {
            "name": "Dr. Suman Rao",
            "specialist": "Dermatologist",
            "hospital": "Care Hospital",
            "city": "Hyderabad",
            "contact": "+91-9445566778"
        },
        {
            "name": "Dr. Aman Deep",
            "specialist": "General Practitioner",
            "hospital": "City Clinic",
            "city": "Chandigarh",
            "contact": "+91-9776655443"
        }
    ]
}


# ---------- HELPERS ----------
def preprocess_image(file_bytes: bytes):
    """Return (model_input_array, pil_image_resized)"""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img).astype(np.float32)
    # use preprocess_input for EfficientNet
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr, img


def make_gradcam(img_array: np.ndarray):
    """Return heatmap (H x W) normalized 0..1 or None if not available"""
    if LAST_CONV_LAYER is None:
        return None

    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(LAST_CONV_LAYER).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, preds = grad_model(img_array)
        pred_index = tf.argmax(preds[0])
        loss = preds[:, pred_index]

    grads = tape.gradient(loss, conv_outputs)
    if grads is None:
        return None

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap).numpy()
    heatmap = np.maximum(heatmap, 0)
    if np.max(heatmap) == 0:
        return heatmap
    heatmap = heatmap / (np.max(heatmap) + 1e-9)
    return heatmap


def overlay_heatmap(pil_image: Image.Image, heatmap: np.ndarray):
    if heatmap is None:
        return np.array(pil_image)
    hm = cv2.resize(heatmap, (pil_image.width, pil_image.height))
    hm = np.uint8(255 * hm)
    hm = cv2.applyColorMap(hm, cv2.COLORMAP_JET)
    orig = np.array(pil_image)
    # ensure orig is in uint8
    if orig.dtype != np.uint8:
        orig = (255 * (orig / orig.max())).astype(np.uint8)
    result = cv2.addWeighted(orig, 0.6, hm, 0.4, 0)
    return result


# ---------- ROUTES ----------
@app.get("/")
def root():
    return {"status": "✅ Skin Lesion API is running"}


@app.get("/config/disease-info")
def get_disease_config():
    """Returns the full dictionary of disease information."""
    return DISEASE_INFO

# 3. DOCTORS ENDPOINT: Expose doctors for a specific full disease name
@app.get("/doctors/{disease_name}")
def get_doctors_by_class(disease_name: str):
    """Returns a list of doctors for the given disease name."""
    # Look up using the FULL name (e.g., "Melanoma")
    return {"doctors": DOCTORS.get(disease_name, [])}


@app.post("/predict")
async def predict(file: UploadFile = File(...), patient_name: str = Form("")):
    """Accepts multipart/form-data: file + patient_name"""
    if model is None:
         return {"error": "Model not loaded. Please check server logs."}

    try:
        content = await file.read()
        x, pil_img = preprocess_image(content)

        preds = model.predict(x)
        preds = np.asarray(preds)
        if preds.ndim == 1:
            preds = preds[np.newaxis, :]
        preds0 = preds[0]
        idx = int(np.argmax(preds0))

        # safe class code lookup (fallback to idx)
        try:
            class_code = CLASS_NAMES[idx]
        except Exception:
            class_code = f"class_{idx}"

        confidence = float(preds0[idx] * 100)

        info = DISEASE_INFO.get(class_code, {
            "name": class_code,
            "description": "Not enough data available.",
            "recommendation": "Consult a dermatologist."
        })

        # Grad-CAM
        heatmap = make_gradcam(x)
        overlay = overlay_heatmap(pil_img, heatmap)

        _, buf = cv2.imencode(".jpg", overlay)
        heat_b64 = base64.b64encode(buf.tobytes()).decode("utf-8")

        # Save to DB (non blocking for UI)
        if collection is not None:
            try:
                collection.insert_one({
                    "patient_name": patient_name,
                    "prediction": info["name"],
                    "confidence": round(confidence, 2),
                    "time": str(datetime.now())
                })
            except Exception as e:
                log.warning("Failed to write to MongoDB: %s", e)

        return {
        "patient_name": patient_name,
        "class": info["name"], # Returns FULL NAME (e.g., "Melanoma")
        "confidence": round(confidence, 2),
        "description": info["description"],
        "recommendation": info["recommendation"],
        "heatmap_base64": heat_b64
    }

    except Exception as e:
        log.exception("Prediction failed")
        return {"error": str(e)}


@app.get("/history")
def get_history():
    if collection is None:
        return []
    try:
        recs = list(collection.find({}, {"_id": 0}).sort("time", -1))
        return recs
    except Exception as e:
        log.warning("History read failed: %s", e)
        return []
# ===================== DOCTOR API =====================

@app.get("/doctors/{disease_name}")
def get_doctors(disease_name: str):

    doctors = DOCTORS.get(disease_name, [])

    if not doctors:
        return {"message": "No doctor available for this disease", "doctors": []}

    return {"doctors": doctors}


@app.get("/evaluation")
def evaluate_model():
    if model is None:
        return {"error": "Model not loaded"}

    if not os.path.exists(TEST_DIR):
        return {"error": f"Test directory not found at {TEST_DIR}"}

    try:
        test_gen = ImageDataGenerator(preprocessing_function=preprocess_input)
        test_data = test_gen.flow_from_directory(
            TEST_DIR,
            target_size=(IMG_SIZE, IMG_SIZE),
            batch_size=BATCH_SIZE,
            class_mode="categorical",
            shuffle=False
        )
    except Exception as e:
         return {"error": f"Failed to load test data: {e}"}

    try:
        loss, acc = model.evaluate(test_data, verbose=0)
        preds = model.predict(test_data, verbose=0)
        y_pred = np.argmax(preds, axis=1)
        y_true = test_data.classes

        # Confusion matrix image
        cm = confusion_matrix(y_true, y_pred)
        fig, ax = plt.subplots(figsize=(6, 6))
        ax.imshow(cm, cmap="Blues")
        ax.set_xticks(np.arange(len(CLASS_NAMES)))
        ax.set_yticks(np.arange(len(CLASS_NAMES)))
        ax.set_xticklabels(CLASS_NAMES, rotation=45)
        ax.set_yticklabels(CLASS_NAMES)
        for i in range(len(CLASS_NAMES)):
            for j in range(len(CLASS_NAMES)):
                ax.text(j, i, int(cm[i, j]), ha="center", va="center", color="white")
        buf = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format="png")
        buf.seek(0)
        cm_img = base64.b64encode(buf.read()).decode("utf-8")
        plt.close(fig)

        # ROC
        try:
            y_true_bin = label_binarize(y_true, classes=np.arange(len(CLASS_NAMES)))
            fig2, ax2 = plt.subplots(figsize=(6, 6))
            for i in range(len(CLASS_NAMES)):
                fpr, tpr, _ = roc_curve(y_true_bin[:, i], preds[:, i])
                roc_auc = auc(fpr, tpr)
                ax2.plot(fpr, tpr, label=f"{CLASS_NAMES[i]} ({roc_auc:.2f})")
            ax2.plot([0, 1], [0, 1], "k--")
            ax2.legend()
            buf2 = io.BytesIO()
            plt.tight_layout()
            plt.savefig(buf2, format="png")
            buf2.seek(0)
            roc_img = base64.b64encode(buf2.read()).decode("utf-8")
            plt.close(fig2)
        except Exception as e:
            log.warning("ROC generation failed: %s", e)
            roc_img = ""

        return {
            "accuracy": round(float(acc) * 100, 2),
            "loss": round(float(loss), 4),
            "confusion_matrix": cm_img,
            "roc_curve": roc_img
        }
    except Exception as e:
        log.error(f"Evaluation failed: {e}")
        return {"error": str(e)}


@app.get("/model-status")
def model_status():
    return {
        "status": "loaded" if model is not None else "not_loaded",
        "model_name": getattr(model, "ai_model", "final_skin_model_90plus.keras")
    }


@app.get("/dashboard")
def dashboard():
    """
    Fetches prediction records from the database, calculates key statistics,
    and generates three base64-encoded charts for the dashboard visualization.
    """
    if collection is None:
        # Return fallback data if DB is down, to avoid crashing frontend
        return {
                "total_cases": 0,
                "total_diseases": 0,
                "max_confidence": 0,
                "disease_pie_chart": "",
                "confidence_histogram": "",
                "disease_bar_graph": ""
            }

    try:
        # 1. Fetch data from the connected database
        # Find all records, excluding the MongoDB _id field
        records = list(collection.find({}, {"_id": 0})) 

        if not records:
            # Return zeroed stats if no records are found
            return {
                "total_cases": 0,
                "total_diseases": 0,
                "max_confidence": 0,
                "disease_pie_chart": "",
                "confidence_histogram": "",
                "disease_bar_graph": ""
            }

        df = pd.DataFrame(records)
        # Ensure confidence is treated as a float for calculations/plotting
        df['confidence'] = df['confidence'].astype(float) 
        
        # Helper function to generate and encode plot images
        def generate_plot(fig):
            """Saves matplotlib figure to a base64 string and closes the figure."""
            # Use 'png' format and bbox_inches='tight' for clean output
            buf = io.BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format="png", bbox_inches='tight')
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode("utf-8")
            plt.close(fig)
            return img_base64

        # ----------------------------------------------------
        # 1. Disease Distribution (Pie Chart) 
        # ----------------------------------------------------
        fig_pie, ax_pie = plt.subplots(figsize=(6, 6))
        
        # Check if there's enough data for a pie chart (more than one category)
        if df["prediction"].nunique() > 1:
            ax_pie.pie(
                df["prediction"].value_counts(), 
                labels=df["prediction"].value_counts().index, 
                autopct='%1.1f%%', 
                startangle=90, 
                wedgeprops={'edgecolor': 'white'}
            )
        else:
            # Handle case where only one disease exists (Pie chart fails)
            ax_pie.text(0.5, 0.5, "Insufficient data for Pie Chart", ha='center', va='center')

        ax_pie.set_title("Disease Prediction Distribution", fontsize=14, fontweight='bold')
        disease_pie_chart = generate_plot(fig_pie)

        # ----------------------------------------------------
        # 2. Case Confidence (Histogram)
        # ----------------------------------------------------
        fig_hist, ax_hist = plt.subplots(figsize=(7, 4))
        ax_hist.hist(df['confidence'], bins=10, edgecolor='black', color='#3b82f6')
        ax_hist.set_title("Distribution of Model Confidence", fontsize=14, fontweight='bold')
        ax_hist.set_xlabel("Confidence (%)")
        ax_hist.set_ylabel("Number of Cases")
        confidence_histogram = generate_plot(fig_hist)

        # ----------------------------------------------------
        # 3. Disease Counts (Bar Graph)
        # ----------------------------------------------------
        fig_bar, ax_bar = plt.subplots(figsize=(7, 4))
        df["prediction"].value_counts().plot(kind="bar", ax=ax_bar, color='#10b981')
        ax_bar.set_title("Total Cases by Predicted Disease", fontsize=14, fontweight='bold')
        ax_bar.set_xlabel("Predicted Disease")
        ax_bar.set_ylabel("Count")
        plt.xticks(rotation=30, ha='right') 
        disease_bar_graph = generate_plot(fig_bar)

        # 4. Compile and Return Data
        return {
            "total_cases": int(len(df)),
            "total_diseases": int(df["prediction"].nunique()),
            "max_confidence": float(df["confidence"].max()),
            "disease_pie_chart": disease_pie_chart,
            "confidence_histogram": confidence_histogram,
            "disease_bar_graph": disease_bar_graph,
        }
    except Exception as e:
        # If logging is configured: log.exception("Dashboard generation failed")
        print(f"Error during dashboard generation: {e}") 
        return {}

if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to allow access from other devices on the network (like the mobile app)
    uvicorn.run(app, host="0.0.0.0", port=8000)
