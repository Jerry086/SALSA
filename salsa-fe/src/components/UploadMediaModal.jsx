import { useRef, useState } from "react";
import { styled } from "styled-components";
import Modal from "./Modal";

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

  const handleUpload = () => {
    if (audioFile) {
      console.log("Uploading:", audioFile.name);
      setAudioFile(null);
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
      <button onClick={handleUpload}>Upload</button>
    </UploadContainer>
  );

  return <Modal setModalOpen={setModalOpen} content={uploadContent} />;
}

export default UploadMediaModal;
