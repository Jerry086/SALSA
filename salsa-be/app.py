from flask import Flask, request, jsonify
from pymongo import MongoClient

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


# @app.route("/items/<int:item_id>", methods=["GET"])
# def get_item(item_id):
#     for item in items:
#         if item["id"] == item_id:
#             return jsonify(item)
#     return jsonify({"error": "Item not found"}), 404


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
