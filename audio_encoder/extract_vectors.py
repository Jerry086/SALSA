# import torch
# import numpy as np
# from pathlib import Path
# from audio_encoder.encoder import Cola

# def load_model(checkpoint_path):
#     model = Cola.load_from_checkpoint(checkpoint_path)
#     model.eval()
#     return model

# def extract_vector(model, npy_file):
#     mel_spec = np.load(npy_file)
#     mel_spec_tensor = torch.tensor(mel_spec, dtype=torch.float).unsqueeze(0)  # Add batch dimension
#     with torch.no_grad():
#         vector = model(mel_spec_tensor)  # Get the feature vector
#     return vector.squeeze(0).numpy()  # Convert to numpy array and remove batch dimension

# def process_directory(model, directory_path):
#     path = Path(directory_path)
#     vectors = {}
#     for npy_file in path.glob('*.npy'):
#         vector = extract_vector(model, npy_file)
#         vectors[npy_file.stem] = vector  # Use file stem (name without extension) as key
#         print(f"Processed {npy_file.name}")
#     return vectors

# if __name__ == "__main__":
#     checkpoint_path = './models/encoder-epoch=00-valid_acc=0.67.ckpt'
#     npy_files_directory = './audio_sample'

#     cola_model = load_model(checkpoint_path)
#     extracted_vectors = process_directory(cola_model, npy_files_directory)
#     print(extracted_vectors)

#     # Optionally, save the extracted vectors to a file
#     # with open('extracted_vectors.npy', 'wb') as f:
#     #     np.save(f, extracted_vectors)
