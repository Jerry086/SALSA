import pandas as pd
import numpy as np
from collections import defaultdict
import requests


# calculate precision@10
def cal_precisionK(query, neighbors):
    query_labels = set(query)
    relevant_cnt = 0
    for neigh in neighbors:
        neighbor_labels = set(neigh)
        if not query_labels.isdisjoint(neighbor_labels):
            relevant_cnt += 1
    return relevant_cnt / len(neighbors)


def query_server(video_id, k):
    url = "http://35.81.65.102/topk"
    params = {"video_id": video_id, "k": k}

    try:
        # Sending a GET request to the server
        response = requests.get(url, params=params)

        # Raise an exception if the response status code is not 200 (OK)
        response.raise_for_status()

        # Assuming the server returns a JSON response containing neighbors
        neighbors = response.json()

        return neighbors

    except requests.RequestException as e:
        print(f"An error occurred: {e}")
        return None


test_file = "../dataset/testing_samples_id_based_on_class_size.csv"
test_data = pd.read_csv(test_file)
test_data["root_classes"] = test_data["root_classes"].apply(eval)

precision = []

for idx, row in test_data.iterrows():
    query_id = row["video_id"]
    query_labels = row["root_classes"]
    neighbors = query_server(query_id, 10)
    neighbors_labels = [neigh["root_classes"] for neigh in neighbors]
    precision.append(cal_precisionK(query_labels, neighbors_labels))

print("Precision@10: ", np.mean(precision))
# Precision@10:  0.6898659517426274
