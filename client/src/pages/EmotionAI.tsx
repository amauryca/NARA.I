import { useState, useRef, useEffect } from "react";
import { loadFaceApiModels, detectFace } from "@/lib/face-api";
import { startSpeechRecognition, stopSpeechRecognition } from "@/lib/speech-api";
import { generateResponseWithCrisisDetection, detectCrisisContent } from "@/lib/gemini-api";
import { speakText } from "@/lib/text-to-speech";
import { Settings } from "lucide-react";
import { AgeGroupSelector } from "@/components/AgeGroupSelector";
import { VoiceSelector } from "@/components/VoiceSelector";
import { AgeGroup } from "@shared/types/index";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import EmergencyResources from "@/components/EmergencyResources";

export default function EmotionAI() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready to begin. Click Start to activate the emotion AI.");
  const [response, setResponse] = useState("AI responses will appear here once you begin the session.");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(AgeGroup.ADULT);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('default');
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState<boolean>(true);
  const [crisisSeverity, setCrisisSeverity] = useState<'severe' | 'moderate' | null>(null);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  // Load face-api models on component mount
  useEffect(() => {
    const initFaceApi = async () => {
      try {
        setStatus("Loading AI models...");
        await loadFaceApiModels();
        setModelsLoaded(true);
        setStatus("AI models loaded successfully.");
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setStatus("Error loading AI models. Please try again.");
      }
    };

    initFaceApi();

    // Cleanup on component unmount
    return () => {
      stopEverything();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      streamRef.current = stream;
      return true;
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatus("Error accessing camera. Please check permissions.");
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const processEmotionData = async (faceData: any, speechText: string) => {
    setIsLoading(true);
    
    try {
      // Check for crisis content in the speech
      const detectedCrisis = detectCrisisContent(speechText);
      if (detectedCrisis) {
        setCrisisSeverity(detectedCrisis);
        setShowEmergencyResources(true);
      }

      // Create a prompt for Gemini API that includes the face and speech data
      const prompt = `
        As a therapeutic AI, analyze this data:
        
        Facial expression: ${faceData ? JSON.stringify(faceData) : 'No facial data available'}
        Speech content: "${speechText}"
        
        Provide a compassionate, supportive response that addresses the emotional state observed. 
        Keep the response conversational, warm and helpful. Don't mention the technical details of the analysis.

        If the speech indicates self-harm, suicide, or other concerning content, provide a supportive response that encourages the person to seek professional help.
      `;
      
      // Generate a response using Gemini API with age-appropriate context and crisis detection
      const geminiResponse = await generateResponseWithCrisisDetection(prompt, selectedAgeGroup);
      
      // Update the UI with the response
      setResponse(geminiResponse.response);
      
      // If crisis is detected in the API response but not in our local check
      if (geminiResponse.crisisSeverity && !detectedCrisis) {
        setCrisisSeverity(geminiResponse.crisisSeverity);
        setShowEmergencyResources(true);
      }
      
      // Speak the response using our custom text-to-speech functionality
      if (textToSpeechEnabled) {
        speakText(geminiResponse.response, selectedVoiceId);
      }
    } catch (error) {
      console.error("Error processing emotion data:", error);
      setResponse("I'm having trouble processing right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const startDetection = () => {
    if (!videoRef.current || !streamRef.current) return;
    
    // Start face detection interval
    detectionIntervalRef.current = window.setInterval(async () => {
      if (videoRef.current) {
        try {
          const faceData = await detectFace(videoRef.current);
          
          // Get the transcript from the speech recognition
          const transcript = recognitionRef.current?.transcript || "";
          
          // Only process if we have either face data or speech
          if ((faceData || transcript) && transcript.trim() !== "") {
            processEmotionData(faceData, transcript);
            
            // Reset the transcript after processing
            if (recognitionRef.current) {
              recognitionRef.current.transcript = "";
            }
          }
        } catch (error) {
          console.error("Error during face detection:", error);
        }
      }
    }, 5000); // Check every 5 seconds
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startEverything = async () => {
    setIsLoading(true);
    
    // Load models if not already loaded
    if (!modelsLoaded) {
      try {
        setStatus("Loading AI models...");
        await loadFaceApiModels();
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setStatus("Error loading AI models. Please try again.");
        setIsLoading(false);
        return;
      }
    }
    
    // Start camera
    const cameraStarted = await startCamera();
    if (!cameraStarted) {
      setIsLoading(false);
      return;
    }
    
    // Start speech recognition
    recognitionRef.current = startSpeechRecognition();
    if (!recognitionRef.current) {
      setStatus("Speech recognition not supported in this browser.");
      stopCamera();
      setIsLoading(false);
      return;
    }
    
    // Start face detection
    startDetection();
    
    // Update UI
    setIsRunning(true);
    setStatus("Emotion AI is running. Speak naturally.");
    setResponse("I'm listening and observing. As we talk, I'll provide insights based on your expressions and voice.");
    setIsLoading(false);
  };

  const stopEverything = () => {
    // Stop all processes
    stopDetection();
    stopCamera();
    
    if (recognitionRef.current) {
      stopSpeechRecognition(recognitionRef.current);
      recognitionRef.current = null;
    }
    
    // Update UI
    setIsRunning(false);
    setStatus("Emotion AI stopped. Click Start to begin again.");
  };
  
  // Function to handle closing the emergency resources panel
  const handleCloseEmergencyResources = () => {
    setShowEmergencyResources(false);
  };

  return (
    <section className="bg-[#E0F7FA] min-h-[90vh]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">Emotion Recognition AI</h1>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings size={18} />
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
        </div>
        
        <p className="text-lg max-w-3xl mb-6">
          Our AI will analyze your expressions and voice, responding with therapeutic insights.
        </p>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">AI Assistant Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AgeGroupSelector 
                onAgeGroupChange={setSelectedAgeGroup} 
                initialAgeGroup={selectedAgeGroup}
              />
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-3">Voice Settings</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="emotion-text-to-speech"
                      checked={textToSpeechEnabled}
                      onCheckedChange={setTextToSpeechEnabled}
                    />
                    <Label htmlFor="emotion-text-to-speech">Enable Text-to-Speech</Label>
                  </div>
                  
                  {textToSpeechEnabled && (
                    <VoiceSelector
                      onVoiceChange={setSelectedVoiceId}
                      initialVoiceId={selectedVoiceId}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 md:col-start-3">
            {/* Camera Feed */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="camera-placeholder w-full" id="video-container">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isRunning ? "" : "hidden"}`}
                  autoPlay
                  muted
                  playsInline
                ></video>
              </div>
            </div>
            
            {/* Controls */}
            <div className="bg-[#E8F5E9] rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                  <h3 className="font-semibold mb-1">Analysis Status</h3>
                  <p id="status-message" className="text-sm">{status}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={startEverything}
                    disabled={isRunning || isLoading}
                    className="bg-white hover:bg-opacity-90 px-6 py-2.5 rounded-full font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Loading..." : "Start"}
                  </button>
                  <button 
                    onClick={stopEverything}
                    disabled={!isRunning || isLoading}
                    className="bg-white bg-opacity-70 hover:bg-opacity-90 px-6 py-2.5 rounded-full font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
            
            {/* Response Area */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-3">AI Response</h3>
              <div className={`min-h-[100px] bg-gray-50 rounded-lg p-4 text-gray-700 ${isLoading ? 'animate-pulse' : ''}`}>
                {response}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            All processing is done in your browser. No video or audio is stored or transmitted.
          </p>
        </div>
      </div>
      
      {/* Emergency Resources */}
      <EmergencyResources 
        show={showEmergencyResources}
        onClose={handleCloseEmergencyResources}
        severity={crisisSeverity || 'moderate'}
      />
    </section>
  );
}
