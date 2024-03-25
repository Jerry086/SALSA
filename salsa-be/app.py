# pip install flask, pymongo, faiss-cpu, numpy
from flask import Flask, request, jsonify
from pymongo import MongoClient
from app_utils import euclidean_distance, FaissIndex
import numpy as np

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
    audios = list(
        audios_collection.find(
            {},
            {
                "_id": 0,
                "video_id": 1,
                "start_time_seconds": 1,
                "end_time_seconds": 1,
                "labels": 1,
            },
        )
    )
    return jsonify(audios)


# get specific audio metadata by video_id
@app.route("/audio/<string:video_id>", methods=["GET"])
def get_item(video_id):
    item = audios_collection.find_one(
        {"video_id": video_id},
        {
            "_id": 0,
            "video_id": 1,
            "start_time_seconds": 1,
            "end_time_seconds": 1,
            "labels": 1,
        },
    )
    if item:
        return jsonify(item)
    return jsonify({"error": "Item not found"}), 404


# get top similarity percent of audios by video_id
@app.route("/similarity/<string:video_id>/<int:similarity_percent>", methods=["GET"])
def get_similar_items(video_id, similarity_percent):
    target_item = audios_collection.find_one(
        {"video_id": video_id}, {"_id": 0, "embeddings": 1}
    )
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
    top_n = int(len(distances) * (similarity_percent / 100.0))
    top_similar_items = distances[:top_n]

    return jsonify(top_similar_items)


@app.route("/topk/<string:video_id>/<int:k>", methods=["GET"])
def get_topK_items(video_id, k):

    target_item = audios_collection.find_one(
        {"video_id": video_id}, {"_id": 0, "embeddings": 1}
    )
    if not target_item:
        return jsonify({"error": "Video ID not found"}), 404

    target_embedding = np.array(target_item["embeddings"], dtype=np.float32)

    # default k = 10 if not provided
    k = k if k else 10

    # Query the FAISS index
    distances, video_ids = faiss_index.search(target_embedding, k)

    # Construct and return the response
    results = []
    for i in range(len(video_ids)):
        results.append({"video_id": video_ids[i], "distance": float(distances[i])})
    return jsonify(results)


# @app.route("/items", methods=["POST"])
# def create_item():
#     item = request.json
#     items.append(item)
#     return jsonify(item), 201


# @app.route("/items/<int:item_id>", methods=["PUT"])
# def update_item(item_id):
#     for item in items:
#         if item["id"] == item_id:
#             item.update(request.json)
#             return jsonify(item)
#     return jsonify({"error": "Item not found"}), 404


# @app.route("/items/<int:item_id>", methods=["DELETE"])
# def delete_item(item_id):
#     for item in items:
#         if item["id"] == item_id:
#             items.remove(item)
#             return jsonify({"message": "Item deleted"})
#     return jsonify({"error": "Item not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
