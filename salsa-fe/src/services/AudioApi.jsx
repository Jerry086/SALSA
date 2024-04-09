const BASE_URL = "http://127.0.0.1:5000";

export async function getAllAudios() {
  try {
    const response = await fetch(`${BASE_URL}/audios`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("get all audios error", err);
  }
}

export async function getSimilarAudios(
  videoId,
  radius,
  year_after,
  similarity
) {
  try {
    const queryParams = new URLSearchParams({
      video_id: videoId,
      radius: radius,
      year_after: year_after,
      similarity: similarity,
    }).toString();

    const response = await fetch(`${BASE_URL}/similarity?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("get similar audios error", err);
  }
}

export async function uploadAudio(audioFile, longitude, latitude, time) {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("time", time);

    const response = await fetch(`${BASE_URL}/audio`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log("upload audio error: ", err);
  }
}
