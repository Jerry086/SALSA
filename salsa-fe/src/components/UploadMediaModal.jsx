import { useRef, useState } from "react";
import { styled } from "styled-components";
import Modal from "./Modal";
import { uploadAudio } from "../services/AudioApi";

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const InputField = styled.div`
  gap: 1rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

function UploadMediaModal({ setModalOpen }) {
  const [audioFile, setAudioFile] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [date, setDate] = useState(null);
  const fileInputRef = useRef(null);
  //   const [isDragOver, setIsDragOver] = useState(false);

  //   const handleUploadClick = () => {
  //     console.log("Uploading:", audioFile);
  //   };

  const handleClear = () => {
    setAudioFile(null);
    fileInputRef.current.value = "";
  };

  //   const handleDragOver = (event) => {
  //     event.preventDefault();
  //     setIsDragOver(true);
  //   };

  //   const handleDragLeave = (event) => {
  //     event.preventDefault();
  //     setIsDragOver(false);
  //   };

  //   const handleDrop = (event) => {
  //     event.preventDefault();
  //     setIsDragOver(false);
  //     handleFileChange(event);
  //   };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type.startsWith("audio/") || file.type.startsWith("video/"))
    ) {
      setAudioFile(file);
    } else {
      alert("Please select an audio file.");
    }
  };

  const handleLatitudeChange = (e) => {
    setLatitude(e.target.value);
  };

  const handleUpload = () => {
    if (audioFile) {
      console.log("Uploading:", audioFile.name, latitude, longitude, date);
      setAudioFile(null);
      fileInputRef.current.value = "";
      uploadAudio(audioFile, latitude, longitude, date);
    } else {
      alert("Please select an audio file to upload.");
    }
  };

  const uploadContent = (
    <UploadContainer>
      <InputField>
        <label>Select Media:</label>
        <input
          type="file"
          ref={fileInputRef}
          accept="audio/*"
          onChange={handleFileChange}
        />
        {audioFile && (
          <>
            <p>Selected File: {audioFile.name}</p>
            <button onClick={handleClear}>clear</button>
          </>
        )}
      </InputField>
      <InputField>
        <label>Latitude:</label>
        <input
          type="number"
          name="latitude"
          step="any"
          value={latitude}
          onChange={handleLatitudeChange}
        />
      </InputField>

      <InputField>
        <label>Longitude:</label>
        <input
          type="number"
          name="longitude"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
      </InputField>

      <InputField>
        <label>Date:</label>
        <input
          type="date"
          name="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </InputField>

      <button onClick={handleUpload}>Upload</button>
    </UploadContainer>
  );

  return <Modal setModalOpen={setModalOpen} content={uploadContent} />;
}

export default UploadMediaModal;
