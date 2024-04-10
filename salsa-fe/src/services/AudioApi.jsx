const BASE_URL = "http://35.81.65.102";

export async function getAllAudios() {
  try {
    const response = await fetch(`${BASE_URL}/audios`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("get all audios error", err);
  }
}

export async function getSimilarAudios(videoId, k, date, radius) {
  try {
    const queryParams = new URLSearchParams({
      video_id: videoId,
      radius: radius,
      timestamp_after: date,
      k: k,
    }).toString();

    const response = await fetch(`${BASE_URL}/topk?${queryParams}`, {
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
