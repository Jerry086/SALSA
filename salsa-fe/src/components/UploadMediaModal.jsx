import { useContext, useRef, useState } from "react";
import { styled } from "styled-components";
import Modal from "./Modal";
import { uploadAudio } from "../services/AudioApi";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import LabelSelection from "./LabelSelection";

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  width: 100%;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
`;

const FileClear = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
`;

const Button = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

const Select = styled(Input).attrs({ as: 'select' })``;

function UploadMediaModal({ setModalOpen }) {
  const [audioFile, setAudioFile] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [description, setDescription] = useState([]);
  const [labelOption, setLabelOption] = useState('select');
  const [selectedLabel, setSelectedLabel] = useState([]);
  const [date, setDate] = useState(null);
  const fileInputRef = useRef(null);
  const { addAudio } = useContext(TargetAudioContext);
  //   const [isDragOver, setIsDragOver] = useState(false);

  //   const handleUploadClick = () => {
  //     console.log("Uploading:", audioFile);
  //   };

  const handleDescriptionChange = (e) => {
    setDescription([e.target.value]);
  };

  const handleClear = () => {
    setAudioFile(null);
    fileInputRef.current.value = "";
  };

  const handleLabelSelection = (selectedList) => {
    setSelectedLabel(selectedList);
    console.log("Selected labels:", selectedList);
  };

  const handleLabelOptionChange = (e) => {
    setLabelOption(e.target.value);
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

  const handleUpload = async () => {
    if (audioFile) {
      console.log("Uploading:", audioFile.name, latitude, longitude, date);
      setAudioFile(null);
      fileInputRef.current.value = "";
      const newAudio = await uploadAudio(audioFile, latitude, longitude, date);
      addAudio(newAudio);
      setModalOpen(false);
    } else {
      alert("Please select an audio file to upload.");
    }
  };

  const uploadContent = (
    <UploadContainer>
      <InputField>
        <Label>Select Label Method:</Label>
        <Select name="labelOption" value={labelOption} onChange={handleLabelOptionChange}>
          <option value="select">Select from list</option>
          <option value="custom">Custom a label</option>
        </Select>
      </InputField>

      {labelOption === 'custom' ? (
        <InputField>
          <Label>Description:</Label>
          <Input
            type="text"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
          />
        </InputField>) : (
        <InputField>
          <LabelSelection onLabelSelect={handleLabelSelection}/>
        </InputField> ) 
      }

      <InputField>
        <Label>Select Media:</Label>
        <FileClear>
          <Input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            onChange={handleFileChange}
          />

          <Button onClick={handleClear} disabled={!audioFile}>
            clear
          </Button>
        </FileClear>
      </InputField>
      <InputField>
        <Label>Latitude:</Label>
        <Input
          type="number"
          name="latitude"
          step="any"
          value={latitude}
          onChange={handleLatitudeChange}
        />
      </InputField>

      <InputField>
        <Label>Longitude:</Label>
        <Input
          type="number"
          name="longitude"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
      </InputField>

      <InputField>
        <Label>Date:</Label>
        <Input
          type="date"
          name="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </InputField>

      <Button onClick={handleUpload}>Upload</Button>
    </UploadContainer>
  );

  return <Modal setModalOpen={setModalOpen} content={uploadContent} />;
}

export default UploadMediaModal;
