import Papa from "papaparse";

export async function readCSVFile(filePath) {
  const response = await fetch(filePath);
  const reader = response.body.getReader();
  const result = await reader.read();
  const decoder = new TextDecoder("utf-8");
  const csv = decoder.decode(result.value);
  const res = Papa.parse(csv, { header: true }).data;
  return res;
}
