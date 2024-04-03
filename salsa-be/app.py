# pip install -r requirements.txt
from flask import Flask, request, jsonify
from pymongo import MongoClient
from app_utils import euclidean_distance, FaissIndex
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)

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
    time_delta = request.args.get("time_delta", default=float("inf"), type=float)
    longitude_delta = request.args.get(
        "longitude_delta", default=float("inf"), type=float
    )
    latitude_delta = request.args.get(
        "latitude_delta", default=float("inf"), type=float
    )
    similarity = request.args.get("similarity", default=0.999, type=float)

    target_item = audios_collection.find_one({"video_id": video_id}, {"_id": 0})
    if not target_item:
        return jsonify({"error": "Video ID not found"}), 404

    target_embedding = target_item["embeddings"]
    target_time = datetime.strptime(target_item["time"], "%Y-%m-%d %H:%M")

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
    for distance in distances:
        item = audios_collection.find_one(
            {"video_id": distance[0]}, {"_id": 0, "embeddings": 0}
        )
        item_time = datetime.strptime(item["time"], "%Y-%m-%d %H:%M")
        time_diff = abs((item_time - target_time).total_seconds())
        if (
            time_diff > time_delta
            or abs(item["longitude"] - target_item["longitude"]) > longitude_delta
            or abs(item["latitude"] - target_item["latitude"]) > latitude_delta
        ):
            continue
        results.append(item)
        if len(results) == top_n:
            break

    return jsonify(results)


@app.route("/topk", methods=["GET"])
def get_topK_items():
    video_id = request.args.get("video_id", default=None, type=str)
    time_delta = request.args.get("time_delta", default=float("inf"), type=float)
    longitude_delta = request.args.get(
        "longitude_delta", default=float("inf"), type=float
    )
    latitude_delta = request.args.get(
        "latitude_delta", default=float("inf"), type=float
    )
    k = request.args.get("k", default=10, type=int)

    target_item = audios_collection.find_one({"video_id": video_id}, {"_id": 0})
    if not target_item:
        return jsonify({"error": "Video ID not found"}), 404

    target_embedding = np.array(target_item["embeddings"], dtype=np.float32)
    target_time = datetime.strptime(target_item["time"], "%Y-%m-%d %H:%M")

    # Query the FAISS index
    distances, video_ids = faiss_index.search(target_embedding, 1000)

    # Construct and return the response
    results = []
    for i in range(len(video_ids)):
        item = audios_collection.find_one(
            {"video_id": video_ids[i]},
            {
                "_id": 0,
                "embeddings": 0,
            },
        )
        item_time = datetime.strptime(item["time"], "%Y-%m-%d %H:%M")
        time_diff = abs((item_time - target_time).total_seconds())
        if (
            time_diff > time_delta
            or abs(item["longitude"] - target_item["longitude"]) > longitude_delta
            or abs(item["latitude"] - target_item["latitude"]) > latitude_delta
        ):
            continue
        results.append(item)
        if len(results) == k:
            break
    return jsonify(results)


# @app.route("/items", methods=["POST"])
# def create_item():
#     item = request.json
#     items.append(item)
#     return jsonify(item), 201


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
