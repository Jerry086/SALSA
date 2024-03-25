import numpy as np


def euclidean_distance(vec1, vec2):
    """Compute the Euclidean distance between two vectors."""
    return np.linalg.norm(np.array(vec1) - np.array(vec2))
