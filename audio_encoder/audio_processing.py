import random

import librosa
import numpy as np

# Number of Mel Bands
n_mels = 64


def pre_process_audio_mel_t(audio, sample_rate):
    mel_spec = librosa.feature.melspectrogram(y=audio, sr=sample_rate, n_mels=n_mels)
    mel_db = (librosa.power_to_db(mel_spec, ref=np.max) + 40) / 40

    return mel_db.T


def load_audio_file(file_path, duration=10):
    try:
        data, sample_rate = librosa.core.load(file_path, sr=None)  # Load with original sample rate
        input_length = sample_rate * duration
    except ZeroDivisionError:
        return []

    if len(data) > input_length:

        max_offset = len(data) - input_length

        offset = np.random.randint(max_offset)

        data = data[offset : (input_length + offset)]

    else:
        if input_length > len(data):
            max_offset = input_length - len(data)

            offset = np.random.randint(max_offset)
        else:
            offset = 0

        data = np.pad(data, (offset, input_length - len(data) - offset), "constant")

    data = pre_process_audio_mel_t(data, sample_rate)
    return data

# crop_size determines the size of the segment extracted from the Mel-spectrogram during data augmentation.
def random_crop(data, crop_size=128):
    start = int(random.random() * (data.shape[0] - crop_size))
    return data[start : (start + crop_size), :]


def random_mask(data, rate_start=0.1, rate_seq=0.2):
    new_data = data.copy()
    mean = new_data.mean()
    prev_zero = False
    for i in range(new_data.shape[0]):
        if random.random() < rate_start or (
            prev_zero and random.random() < rate_seq
        ):
            prev_zero = True
            new_data[i, :] = mean
        else:
            prev_zero = False

    return new_data


def random_multiply(data):
    new_data = data.copy()
    return new_data * (0.9 + random.random() / 5.)


def save(path):
    data = load_audio_file(path, duration=10)  # Process for 10 seconds
    output_path = path.with_suffix('.npy')
    np.save(output_path, data)
    return True


if __name__ == "__main__":
    from tqdm import tqdm
    from glob import glob
    from multiprocessing import Pool
    import argparse
    from pathlib import Path
    import matplotlib.pyplot as plt

    parser = argparse.ArgumentParser()
    parser.add_argument("--wav_path", required=True)
    args = parser.parse_args()

    base_path = Path(args.wav_path)

    files = sorted(list(base_path.glob("*.wav"))) 

    print(f"Found {len(files)} files")

    p = Pool(8)
    list(tqdm(p.imap(save, files), total=len(files)))