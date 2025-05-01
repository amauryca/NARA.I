// speech-api.ts - Interface with Web Speech API

interface SpeechRecognitionInterface {
  transcript: string;
  recognitionInstance: any;
  isListening: boolean;
}

// Start speech recognition
export const startSpeechRecognition = (): SpeechRecognitionInterface | null => {
  // Check if speech recognition is supported
  if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
    console.error("Speech recognition not supported in this browser");
    return null;
  }
  
  // Create speech recognition instance
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Configure recognition
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  // Create interface object
  const speechInterface: SpeechRecognitionInterface = {
    transcript: "",
    recognitionInstance: recognition,
    isListening: false
  };
  
  // Set up event handlers
  recognition.onresult = (event: any) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    
    // Append to existing transcript
    speechInterface.transcript += " " + transcript;
  };
  
  recognition.onend = () => {
    // Restart if still listening
    if (speechInterface.isListening) {
      recognition.start();
    }
  };
  
  recognition.onerror = (event: any) => {
    console.error("Speech recognition error:", event.error);
    
    // Restart on some errors
    if (event.error !== 'no-speech' && speechInterface.isListening) {
      recognition.start();
    }
  };
  
  // Start recognition
  try {
    recognition.start();
    speechInterface.isListening = true;
    console.log("Speech recognition started");
  } catch (error) {
    console.error("Error starting speech recognition:", error);
    return null;
  }
  
  return speechInterface;
};

// Stop speech recognition
export const stopSpeechRecognition = (speechInterface: SpeechRecognitionInterface): void => {
  if (!speechInterface || !speechInterface.recognitionInstance) return;
  
  speechInterface.isListening = false;
  
  try {
    speechInterface.recognitionInstance.stop();
    console.log("Speech recognition stopped");
  } catch (error) {
    console.error("Error stopping speech recognition:", error);
  }
};
