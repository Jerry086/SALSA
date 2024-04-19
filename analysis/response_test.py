import time
import concurrent.futures
import requests
import numpy as np
import pandas as pd
from collections import defaultdict
import json
import matplotlib.pyplot as plt

url = "http://35.81.65.102"


def query_server(url, params):
    start = time.time()

    try:
        # Sending a GET request to the server
        response = requests.get(url, params=params)

        # Raise an exception if the response status code is not 200 (OK)
        response.raise_for_status()

        # Assuming the server returns a JSON response containing neighbors
        neighbors = response.json()

        return time.time() - start

    except requests.RequestException as e:
        print(f"An error occurred: {e}")
        return time.time() - start


def query_index(video_id, radius=None, timestamp_after=None, k=10):
    query_url = f"{url}/topk"
    params = {"video_id": video_id, "k": k}
    if radius:
        params["radius"] = radius
    if timestamp_after:
        params["timestamp_after"] = timestamp_after
    return query_server(query_url, params)


def query_baseline(video_id, radius=None, timestamp_after=None, similarity=0.9995):
    query_url = f"{url}/similarity"
    params = {"video_id": video_id, "similarity": similarity}
    if radius:
        params["radius"] = radius
    if timestamp_after:
        params["timestamp_after"] = timestamp_after
    return query_server(query_url, params)


test_df = pd.read_csv("../dataset/test_samples_id_for_response_time_and_throughput.csv")
test_df["root_classes"] = test_df["root_classes"].apply(eval)
test_df = test_df.sample(n=100, random_state=42)

# distance filter, 5000 km
radius = 5000
# date filter, 2010-01-01
date_after = "2010-01-01"

response_avg = {"index": {}, "linear": {}}

# query the server without any filter
response_no_filter = defaultdict(list)

for _, row in test_df.iterrows():
    index_response = query_index(row["video_id"])
    linear_response = query_baseline(row["video_id"])
    response_no_filter["index"].append(index_response)
    response_no_filter["linear"].append(linear_response)

response_avg["index"]["direct"] = np.mean(response_no_filter["index"])
response_avg["linear"]["direct"] = np.mean(response_no_filter["linear"])
print("average response time without filter - index:", response_avg["index"]["direct"])
print(
    "average response time without filter - linear:", response_avg["linear"]["direct"]
)

# query the server with spatial filter
response_spatial = defaultdict(list)

for _, row in test_df.iterrows():
    index_response = query_index(row["video_id"], radius=radius)
    linear_response = query_baseline(row["video_id"], radius=radius)
    response_spatial["index"].append(index_response)
    response_spatial["linear"].append(linear_response)

response_avg["index"]["spatial"] = np.mean(response_spatial["index"])
response_avg["linear"]["spatial"] = np.mean(response_spatial["linear"])
print(
    "average response time with spatial filter - index:",
    response_avg["index"]["spatial"],
)
print(
    "average response time with spatial filter - linear:",
    response_avg["linear"]["spatial"],
)

# query the server with temporal filter
response_temporal = defaultdict(list)

for _, row in test_df.iterrows():
    index_response = query_index(row["video_id"], timestamp_after=date_after)
    linear_response = query_baseline(row["video_id"], timestamp_after=date_after)
    response_temporal["index"].append(index_response)
    response_temporal["linear"].append(linear_response)

response_avg["index"]["temporal"] = np.mean(response_temporal["index"])
response_avg["linear"]["temporal"] = np.mean(response_temporal["linear"])
print(
    "average response time with temporal filter - index:",
    response_avg["index"]["temporal"],
)
print(
    "average response time with temporal filter - linear:",
    response_avg["linear"]["temporal"],
)

# query the server with spatiotemporal filter
response_spatiotemporal = defaultdict(list)

for _, row in test_df.iterrows():
    index_response = query_index(
        row["video_id"], radius=radius, timestamp_after=date_after
    )
    linear_response = query_baseline(
        row["video_id"], radius=radius, timestamp_after=date_after
    )
    response_spatiotemporal["index"].append(index_response)
    response_spatiotemporal["linear"].append(linear_response)

response_avg["index"]["spatiotemporal"] = np.mean(response_spatiotemporal["index"])
response_avg["linear"]["spatiotemporal"] = np.mean(response_spatiotemporal["linear"])
print(
    "average response time with spatiotemporal filter - index:",
    response_avg["index"]["spatiotemporal"],
)
print(
    "average response time with spatiotemporal filter - linear:",
    response_avg["linear"]["spatiotemporal"],
)

# plot the results
query_categories = ["direct", "spatial", "temporal", "spatiotemporal"]
index_response = [
    round(response_avg["index"][category], 2) for category in query_categories
]
linear_response = [
    round(response_avg["linear"][category], 2) for category in query_categories
]

x = np.arange(len(query_categories))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
rects1 = ax.bar(x - width / 2, index_response, width, label="Index", color="lightblue")
rects2 = ax.bar(x + width / 2, linear_response, width, label="Linear", color="salmon")


# Adding text labels above the bars
def add_labels(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(
            "{}".format(height),
            xy=(rect.get_x() + rect.get_width() / 2, height),
            xytext=(0, 3),  # 3 points vertical offset
            textcoords="offset points",
            ha="center",
            va="bottom",
        )


add_labels(rects1)
add_labels(rects2)

ax.set_ylabel("Average Response Time (s)")
ax.set_title("Average Response Times by Query Type and Method")
ax.set_xticks(x)
ax.set_xticklabels(query_categories)
ax.legend()

plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("response.png")
plt.show()

# save the results to a JSON file
response_avg["direct_data"] = response_no_filter
response_avg["spatial_data"] = response_spatial
response_avg["temporal_data"] = response_temporal
response_avg["spatiotemporal_data"] = response_spatiotemporal

json_file_path = "response_test.json"

with open(json_file_path, "w") as json_file:
    json.dump(response_avg, json_file)
