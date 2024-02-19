import torch
import librosa
from hear_mn import mn01_all_b_mel_avgs


audio_path = "/Users/sato/Documents/NEU/Courses/capstone/audio/wav/bird.WAV"
audio_waveform, sample_rate = librosa.load(audio_path, sr=32000, mono=True) 
audio = torch.tensor(audio_waveform).unsqueeze(0)

wrapper = mn01_all_b_mel_avgs.load_model()

embed, time_stamps = mn01_all_b_mel_avgs.get_timestamp_embeddings(audio, wrapper)
print(embed.shape)
embed = mn01_all_b_mel_avgs.get_scene_embeddings(audio, wrapper)
print(embed.shape)