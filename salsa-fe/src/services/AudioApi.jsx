const BASE_URL = "https://35.81.65.102";

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
  console.log(videoId, k, date, radius);
  try {
    const queryParams = new URLSearchParams({
      video_id: videoId,
      radius: radius,
      timestamp_after: date,
      k: k,
    }).toString();

    console.log(queryParams);
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

export async function uploadAudio(
  audioFile,
  latitude,
  longitude,
  time,
  labels
) {
  try {
    console.log(labels);

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("time", time);
    labels.forEach((label) => {
      formData.append("labels", label);
    });

    const response = await fetch(`${BASE_URL}/audio`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("upload audio error: ", err);
    return { success: false, message: err.message || "Error uploading audio" };
  }
}
