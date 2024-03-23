from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory database, to be replaced with a real database
items = []


@app.route("/")
def home():
    return "Hello, World!"


@app.route("/items", methods=["POST"])
def create_item():
    item = request.json
    items.append(item)
    return jsonify(item), 201


@app.route("/items", methods=["GET"])
def get_items():
    return jsonify(items)


@app.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    for item in items:
        if item["id"] == item_id:
            return jsonify(item)
    return jsonify({"error": "Item not found"}), 404


@app.route("/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    for item in items:
        if item["id"] == item_id:
            item.update(request.json)
            return jsonify(item)
    return jsonify({"error": "Item not found"}), 404


@app.route("/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    for item in items:
        if item["id"] == item_id:
            items.remove(item)
            return jsonify({"message": "Item deleted"})
    return jsonify({"error": "Item not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
