import librosa
import numpy as np
import sys
import torch

sys.path.insert(0, '/Users/sato/Documents/NEU/Courses/capstone/code/EfficientAT')

from models.mn.model import get_model as get_mn

model = get_mn(pretrained_name="mn10_as")

audio_path = "/Users/sato/Documents/NEU/Courses/capstone/audio/wav/bird.WAV"
y, sr = librosa.load(audio_path, sr=None)
S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
log_S = librosa.power_to_db(S, ref=np.max)

# Convert log_S to a PyTorch tensor and add required dimensions
# Add batch and channel dimensions
log_S_tensor = torch.tensor(log_S).unsqueeze(0).unsqueeze(0)  

# Ensure the tensor is of the correct type, e.g., float32
log_S_tensor = log_S_tensor.float()

# Pass the tensor to the model
embeddings = model(log_S_tensor)

print("embeddings", embeddings)

