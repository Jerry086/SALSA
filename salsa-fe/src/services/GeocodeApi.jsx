export const geocodeAddress = async (address) => {
  const geocodeApiUrl = `https://geocode.search.hereapi.com/v1/geocode`;
  const apiKey = "0va964OiReq0cQakaslJaoqrldVXzZGpoYfCw9v3fq0";
  const response = await fetch(
    `${geocodeApiUrl}?q=${encodeURIComponent(address)}&apiKey=${apiKey}`
  );
  const data = await response.json();

  if (data.items.length > 0) {
    const { lat, lng } = data.items[0].position;
    return { lat, lng };
  } else {
    return null;
  }
};
