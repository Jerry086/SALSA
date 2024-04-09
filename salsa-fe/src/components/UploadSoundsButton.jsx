import { useState } from "react";
import styled from "styled-components";
import UploadMediaModal from "./UploadMediaModal";

const StyledUploadButton = styled.button`
  background-color: #98c099;
  width: 100%;
  height: 2rem;
  border-radius: 7px;
  cursor: pointer;
  border: none;
  color: white;

  &:hover {
    background-color: #356eaa;
  }
`;

function UploadSoundsButton() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  function handleClick() {
    setIsUploadModalOpen(true);
  }

  return (
    <>
      <StyledUploadButton onClick={handleClick}>
        Upload and find similar sounds
      </StyledUploadButton>
      {isUploadModalOpen && (
        <UploadMediaModal setModalOpen={setIsUploadModalOpen} />
      )}
    </>
  );
}

export default UploadSoundsButton;
