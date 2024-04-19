import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import numpy as np
import pandas as pd
from collections import defaultdict
import json
import matplotlib.pyplot as plt


def send_request(url, params):
    """Send a single API request and return the time taken to complete."""
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.elapsed.total_seconds()


def test_api_throughput(url, params, num_requests, num_concurrent_requests):
    """Calculate the API throughput."""
    start_time = time.time()  # Record the start time of the test

    with ThreadPoolExecutor(max_workers=num_concurrent_requests) as executor:
        # Launch all requests and wait for them to complete
        future_to_request = {
            executor.submit(send_request, url, params): i for i in range(num_requests)
        }
        results = []

        for future in as_completed(future_to_request):
            try:
                response_time = future.result()
                results.append(response_time)
            except Exception as exc:
                print(f"Request generated an exception: {exc}")

    end_time = time.time()  # Record the end time of the test
    total_time = end_time - start_time
    throughput = num_requests / total_time  # Calculate throughput

    print(
        f"Throughput with {num_concurrent_requests} concurrent requests: {throughput:.2f} requests/s"
    )
    return throughput


url_index = "http://35.81.65.102/topk"
url_linear = "http://35.81.65.102/similarity"
params = {"video_id": "AuEPed8B0kw"}
num_requests = 100
num_concurrent_requests = 20

print("Testing Index API throughput:")
test_api_throughput(url_index, params, num_requests, num_concurrent_requests)
print("Testing Linear API throughput:")
test_api_throughput(url_linear, params, num_requests, num_concurrent_requests)

"""
Testing Index API throughput:
Throughput with 20 concurrent requests: 6.40 requests/s
Testing Linear API throughput:
Throughput with 20 concurrent requests: 1.81 requests/s
"""
