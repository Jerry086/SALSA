import { SimilarAudioProvider } from "./contexts/SimilarAudioContext";
import { TargetAudioProvider } from "./contexts/TargetAudioContext";
import AppLayout from "./pages/AppLayout";

function App() {
  return (
    <TargetAudioProvider>
      <SimilarAudioProvider>
        <AppLayout />
      </SimilarAudioProvider>
    </TargetAudioProvider>
  );
}

export default App;
