# pip install -r requirements.txt
from flask import Flask, request, jsonify
from pymongo import MongoClient
from app_utils import euclidean_distance, haversine, FaissIndex
import numpy as np
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from vggish import VGGish
from dotenv import load_dotenv
import boto3
import os
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure the maximum upload size
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB limit

# # Define the path for saving uploaded files
# UPLOAD_FOLDER = "uploads"
# app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Load environment variables from .env file
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
# AWS_SESSION_TOKEN = os.getenv("AWS_SESSION_TOKEN")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
# Send a ping to confirm a successful connection
try:
    mongo_client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")
db = mongo_client[MONGO_DB]
audios_collection = db[MONGO_COLLECTION]

# Create a FAISS index
EMBEDDING_DIMENSION = 128
faiss_index = FaissIndex(dimension=EMBEDDING_DIMENSION, use_gpu=False)

documents = audios_collection.find({}, {"_id": 0, "embeddings": 1, "video_id": 1})
embeddings = [(doc["video_id"], doc["embeddings"]) for doc in documents]
video_ids, embeddings = zip(*embeddings)

embeddings_array = np.array(embeddings, dtype=np.float32)
faiss_index.add_embeddings(embeddings_array, video_ids)

# Load the VGGish model
model = VGGish()


@app.route("/")
def home():
    return "Hello, World!"


# get all audios metadata
@app.route("/audios", methods=["GET"])
def get_items():
    audios = list(audios_collection.find({}, {"_id": 0, "embeddings": 0}))
    return jsonify(audios)


# get specific audio metadata by video_id
@app.route("/audio/<string:video_id>", methods=["GET"])
def get_item(video_id):
    item = audios_collection.find_one(
        {"video_id": video_id}, {"_id": 0, "embeddings": 0}
    )
    if item:
        return jsonify(item)
    return jsonify({"error": "Item not found"}), 404


# get top similarity percent of audios by video_id
# this request handler is used for testing purposes
@app.route("/similarity", methods=["GET"])
def get_similar_items():
    video_id = request.args.get("video_id", default=None, type=str)
    radius = request.args.get("radius", default=float("inf"), type=float)
    timestamp_after = request.args.get("timestamp_after", default="", type=str)
    similarity = request.args.get("similarity", default=0.999, type=float)

    timestamp_after_date = None
    if timestamp_after:
        try:
            timestamp_after_date = datetime.strptime(timestamp_after, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use yyyy-mm-dd"}), 400

    target_item = audios_collection.find_one({"video_id": video_id}, {"_id": 0})
    if not target_item:
        return jsonify({"error": "Video ID not found"}), 404

    target_embedding = target_item["embeddings"]

    all_items = audios_collection.find({}, {"_id": 0, "video_id": 1, "embeddings": 1})
    distances = []

    for item in all_items:
        distance = euclidean_distance(target_embedding, item["embeddings"])
        distances.append((item["video_id"], distance))

    # Sort items by distance
    distances.sort(key=lambda x: x[1])

    # Select the top similarity percent
    top_n = int(len(distances) * (1 - similarity))

    results = []
    for video_id, distance in distances:
        item = audios_collection.find_one(
            {"video_id": video_id}, {"_id": 0, "embeddings": 0}
        )
        if not item:
            continue
        item["distance"] = distance

        # Filter out items before the specified "year_after"
        item_time = datetime.strptime(item["time"], "%Y-%m-%d %H:%M")
        if timestamp_after_date and item_time.date() < timestamp_after_date.date():
            continue

        # Filter out items outside the specified radius
        geo_distance = haversine(
            target_item["longitude"],
            target_item["latitude"],
            item["longitude"],
            item["latitude"],
        )
        if geo_distance > radius:
            continue

        results.append(item)
        if len(results) == top_n:
            break

    return jsonify(results)


@app.route("/topk", methods=["GET"])
def get_topK_items():
    video_id = request.args.get("video_id", default=None, type=str)
    # in kilometers
    radius = request.args.get("radius", default=float("inf"), type=float)
    timestamp_after = request.args.get("timestamp_after", default="", type=str)
    k = request.args.get("k", default=10, type=int)

    timestamp_after_date = None
    if timestamp_after:
        try:
            timestamp_after_date = datetime.strptime(timestamp_after, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use yyyy-mm-dd"}), 400

    target_item = audios_collection.find_one({"video_id": video_id}, {"_id": 0})
    if not target_item:
        return jsonify({"error": "Video ID not found"}), 404

    target_embedding = np.array(target_item["embeddings"], dtype=np.float32)

    # Query the FAISS index
    distances, video_ids = faiss_index.search(target_embedding, 1000)

    # Construct and return the response
    results = []
    for distance, video_id in zip(distances, video_ids):
        item = audios_collection.find_one(
            {"video_id": video_id}, {"_id": 0, "embeddings": 0}
        )
        if not item:
            continue

        item["distance"] = float(distance)

        # Filter out items before the specified "year_after"
        item_time = datetime.strptime(item["time"], "%Y-%m-%d %H:%M")
        if timestamp_after_date and item_time.date() < timestamp_after_date.date():
            continue

        # Filter out items outside the specified radius
        geo_distance = haversine(
            target_item["longitude"],
            target_item["latitude"],
            item["longitude"],
            item["latitude"],
        )
        if geo_distance > radius:
            continue

        results.append(item)
        if len(results) == k:
            break
    return jsonify(results)


@app.route("/audio", methods=["POST"])
def upload_file():
    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]

    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Retrieve and validate additional data from form
    longitude = request.form.get("longitude")
    latitude = request.form.get("latitude")
    time = request.form.get("time")
    labels = request.form.get("labels")
    labels = [label.strip() for label in labels.split(",")]

    # Check if any of the metadata fields are missing
    if not all([longitude, latitude, time]):
        return (
            jsonify({"error": "Missing required data: longitude, latitude, or time"}),
            400,
        )

    try:
        filename = secure_filename(file.filename)
        # Generate a unique video ID
        video_id = str(uuid.uuid4())
        # Append the video ID to the filename to ensure uniqueness
        filename = f"{video_id}_{filename}"
        # Get the embeddings of the uploaded file
        embeddings = model.get_embedding(file)
        # Add the embeddings to the FAISS index
        faiss_index.add_embeddings(embeddings.reshape(1, -1), [video_id])

        # file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        # Upload the file to S3
        file.seek(0)  # Reset the file pointer
        s3_client.upload_fileobj(file, AWS_BUCKET_NAME, filename)
        file_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{filename}"

        # Save the metadata and embeddings to the database
        new_item = {
            "video_id": video_id,
            "filename": filename,
            "longitude": float(longitude),
            "latitude": float(latitude),
            "time": time,
            "labels": labels,
            "source": "cloud",
            "url": file_url,
            "embeddings": embeddings.tolist(),
        }
        audios_collection.insert_one(new_item)

        new_item.pop("embeddings")
        new_item.pop("_id")
        return jsonify(new_item), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/audio/<string:video_id>", methods=["PUT"])
def update_item(video_id):
    item = audios_collection.find_one(
        {"video_id": video_id}, {"_id": 0, "embeddings": 0}
    )
    if not item:
        return jsonify({"error": "Video ID not found"}), 404

    update_data = request.json
    if not update_data:
        return jsonify({"error": "No data provided to update the audio sample"}), 400

    result = audios_collection.update_one({"video_id": video_id}, {"$set": update_data})

    if result.matched_count == 0:
        return jsonify({"error": "Audio sample not found"}), 404
    elif result.modified_count == 0:
        return jsonify({"message": "No changes made to the audio sample"}), 200
    else:
        return jsonify({"message": "Audio sample updated successfully"}), 200


@app.route("/audio/<string:video_id>", methods=["DELETE"])
def delete_item(video_id):
    result = audios_collection.delete_one({"_id": video_id})
    if result.deleted_count:
        return jsonify({"message": "Audio sample deleted successfully"}), 200
    else:
        return jsonify({"error": "Item not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
