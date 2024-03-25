import numpy as np
import faiss


def euclidean_distance(vec1, vec2):
    """Compute the Euclidean distance between two vectors."""
    return np.linalg.norm(np.array(vec1) - np.array(vec2))


class FaissIndex:
    def __init__(self, dimension, use_gpu=False):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        if use_gpu:
            self.index = faiss.index_cpu_to_gpu(
                faiss.StandardGpuResources(), 0, self.index
            )
        self.id_to_video_id = []

    def add_embeddings(self, embeddings, video_ids):
        """Add embeddings to the index and store corresponding video_ids."""
        assert len(embeddings) == len(
            video_ids
        ), "The number of embeddings and video_ids must match"
        if embeddings.dtype != np.float32:
            embeddings = embeddings.astype(np.float32)
        self.index.add(embeddings)
        self.id_to_video_id.extend(video_ids)  # Store video_ids mapping

    def search(self, query_embedding, k):
        """Search the index for the k most similar embeddings."""
        D, I = self.index.search(np.array([query_embedding], dtype=np.float32), k)
        video_ids = [self.id_to_video_id[i] for i in I[0]]  # Map indices to video_ids
        return D[0], video_ids
