import { SimilarAudioProvider } from "./contexts/SimilarAudioContext";
import { TargetAudioProvider } from "./contexts/TargetAudioContext";
import AppLayout from "./pages/AppLayout";
import TopQueryBar from "./components/TopQueryBar";

function App() {
  return (
    <>
      <TopQueryBar />
      <TargetAudioProvider>
        <SimilarAudioProvider>
          <AppLayout />
        </SimilarAudioProvider>
      </TargetAudioProvider>
    </>
  );
}

export default App;
