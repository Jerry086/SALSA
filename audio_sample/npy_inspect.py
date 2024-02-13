import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

npy_files_path = Path('.')

# Load and plot a single .npy file
def plot_npy_file(npy_file_path):
    if isinstance(npy_file_path, str):
        npy_file_path = Path(npy_file_path)

    # Load the Mel-spectrogram data from the .npy file
    mel_spec = np.load(npy_file_path)

    # Check the shape of the loaded Mel-spectrogram
    print(f"Shape of the Mel-spectrogram: {mel_spec.shape}")

    # Plot the Mel-spectrogram
    plt.figure(figsize=(10, 4))
    plt.imshow(mel_spec.T, aspect='auto', origin='lower')
    plt.title(f"Mel-spectrogram of {npy_file_path.name}")
    plt.colorbar(format='%+2.0f dB')
    plt.tight_layout()
    plt.show()

# Iterate over npy files in the current directory and plot them
# for npy_file in npy_files_path.glob('*.npy'):
#     plot_npy_file(npy_file)

plot_npy_file('1-aircraft1.npy')