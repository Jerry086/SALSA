import { useContext, useRef, useState } from "react";
import { styled } from "styled-components";
import Modal from "./Modal";
import { uploadAudio } from "../services/AudioApi";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import LabelSelection from "./LabelSelection";
import { geocodeAddress } from "../services/GeocodeApi";

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

const OneLine = styled.div`
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

const ErrorMsg = styled.p`
  color: red;
`;
const RequiredAsterisk = styled.span`
  color: red;
`;

const Select = styled(Input).attrs({ as: "select" })``;

function UploadMediaModal({ setModalOpen }) {
  const [audioFile, setAudioFile] = useState(null);
  const [description, setDescription] = useState([]);
  const [labelOption, setLabelOption] = useState("select");
  const [selectedLabel, setSelectedLabel] = useState([]);
  const [date, setDate] = useState(null);
  const fileInputRef = useRef(null);
  const { addAudio } = useContext(TargetAudioContext);
  const [address, setAddress] = useState([]);
  const [audioError, setAudioError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [error, setError] = useState("");

  const handleDescriptionChange = (e) => {
    setDescription([e.target.value]);
    setError("");
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
    setError("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type.startsWith("audio/") || file.type.startsWith("video/"))
    ) {
      setAudioFile(file);
      setAudioError("");
    } else {
      alert("Please select an audio file.");
    }
  };

  const handleUpload = async () => {
    if (!(selectedLabel || description) || !address || !date) {
      setError("Please fill out all fields");
      return;
    }
    const coords = await geocodeAddress(address);
    if (!coords) {
      setAddressError("No valid coordinates found. Please check the address");
      return;
    } else {
      setAddressError("");
    }
    if (audioFile) {
      setAudioError("");
      const labels = description.length === 0 ? selectedLabel : description;
      console.log(
        "Uploading:",
        audioFile.name,
        coords.lat,
        coords.lng,
        date,
        description,
        selectedLabel,
        labels
      );
      const newAudio = await uploadAudio(
        audioFile,
        coords.lat,
        coords.lng,
        date,
        labels
      );
      console.log(newAudio);
      if (newAudio.success === false) {
        setAudioError("Something went wrong. Your audio might be too large");
      } else {
        setAudioFile(null);
        fileInputRef.current.value = "";
        addAudio(newAudio);
        setModalOpen(false);
      }
    } else {
      setAudioError("Please select an audio file to upload.");
    }
  };

  const uploadContent = (
    <UploadContainer>
      <InputField>
        <Label>
          <RequiredAsterisk>*</RequiredAsterisk> Select Label Method:
        </Label>
        <Select
          name="labelOption"
          value={labelOption}
          onChange={handleLabelOptionChange}
        >
          <option value="select">Select from list</option>
          <option value="custom">Custom a label</option>
        </Select>
      </InputField>

      {labelOption === "custom" ? (
        <InputField>
          <Label>
            <RequiredAsterisk>*</RequiredAsterisk> Description:
          </Label>
          <Input
            type="text"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
          />
        </InputField>
      ) : (
        <InputField>
          <LabelSelection onLabelSelect={handleLabelSelection} />
        </InputField>
      )}

      <InputField>
        <Label>
          <RequiredAsterisk>*</RequiredAsterisk> Select Media:
        </Label>
        <OneLine>
          <Input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            onChange={handleFileChange}
          />

          <Button onClick={handleClear} disabled={!audioFile}>
            clear
          </Button>
        </OneLine>
        {audioError && <ErrorMsg>{audioError}</ErrorMsg>}
      </InputField>
      <InputField>
        <Label>
          <RequiredAsterisk>*</RequiredAsterisk> Address:
        </Label>

        <Input
          type="text"
          name="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError("");
          }}
        />
        {/* <Button onClick={onFindGeo}>Get Location</Button> */}
        {addressError && <ErrorMsg>{addressError}</ErrorMsg>}
      </InputField>
      <InputField>
        <Label>
          <RequiredAsterisk>*</RequiredAsterisk> Date:
        </Label>
        <Input
          type="date"
          name="Date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setError("");
          }}
        />
      </InputField>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <Button onClick={handleUpload}>Upload</Button>
    </UploadContainer>
  );

  return <Modal setModalOpen={setModalOpen} content={uploadContent} />;
}

export default UploadMediaModal;
