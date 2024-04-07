import styled from "styled-components";

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  width: 80%;
  max-width: 800px;
  max-height: 80%;
  overflow: hidden;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px 0px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
  font-size: 24px;
  color: #555;
`;

function Modal({ setModalOpen, content }) {
  return (
    <StyledModal>
      <ModalContent>
        <CloseButton onClick={() => setModalOpen(false)}>&times;</CloseButton>
        {content}
      </ModalContent>
    </StyledModal>
  );
}

export default Modal;
