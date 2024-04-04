# pip install -r requirements.txt
from flask import Flask, request, jsonify
from pymongo import MongoClient
from app_utils import euclidean_distance, haversine, FaissIndex
import numpy as np
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from vggish import VGGish
import os
import uuid

app = Flask(__name__)

# Configure the maximum upload size
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB limit

# Define the path for saving uploaded files
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

uri = "mongodb+srv://test:12345@cluster0.hjn5ftw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
# Send a ping to confirm a successful connection
try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
db = client["SALSA"]
audios_collection = db["audios"]

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
@app.route("/similarity", methods=["GET"])
def get_similar_items():
    video_id = request.args.get("video_id", default=None, type=str)
    # in kilometers
    radius = request.args.get("radius", default=float("inf"), type=float)
    year_after = request.args.get("year_after", default=-1, type=int)
    similarity = request.args.get("similarity", default=0.999, type=float)

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

        # Filter out items before the specified "year_after"
        item_time = datetime.strptime(item["time"], "%Y-%m-%d %H:%M")
        if item_time.year < year_after:
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
    year_after = request.args.get("year_after", default=-1, type=int)
    k = request.args.get("k", default=10, type=int)

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
        item["distance"] = float(distance)

        # Filter out items before the specified "year_after"
        item_time = datetime.strptime(item["time"], "%Y-%m-%d %H:%M")
        if item_time.year < year_after:
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

    # Check if any of the metadata fields are missing
    if not all([longitude, latitude, time]):
        return (
            jsonify({"error": "Missing required data: longitude, latitude, or time"}),
            400,
        )

    if file and file.filename.endswith(".wav"):
        filename = secure_filename(file.filename)
        # Generate a unique video ID
        video_id = str(uuid.uuid4())
        # Get the embeddings of the uploaded file
        embeddings = model.get_embedding(file)
        # Add the embeddings to the FAISS index
        faiss_index.add_embeddings(embeddings.reshape(1, -1), [video_id])
        # Save the metadata and embeddings to the database
        new_item = {
            "video_id": video_id,
            "filename": filename,
            "longitude": float(longitude),
            "latitude": float(latitude),
            "time": time,
            "source": "cloud",
            "embeddings": embeddings.tolist(),
        }
        audios_collection.insert_one(new_item)

        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        new_item.pop("embeddings")
        new_item.pop("_id")
        return jsonify(new_item), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400


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
