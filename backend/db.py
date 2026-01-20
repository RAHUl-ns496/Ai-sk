from pymongo import MongoClient

client = MongoClient("mongodb://127.0.0.1:27017")

db = client["skin_lesion_db"]
collection = db["predictions"]

collection.insert_one({
    "user": "admin",
    "model": "EfficientNetB0",
    "result": "Local MongoDB connected"
})

print("✅ MongoDB is working locally and connected to your project")

