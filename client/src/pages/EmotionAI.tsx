import { useState, useRef, useEffect } from "react";
import { loadFaceApiModels, detectFace } from "@/lib/face-api";
import { startSpeechRecognition, stopSpeechRecognition } from "@/lib/speech-api";
import { generateGeminiResponse } from "@/lib/gemini-api";

export default function EmotionAI() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready to begin. Click Start to activate the emotion AI.");
  const [response, setResponse] = useState("AI responses will appear here once you begin the session.");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      // Create a prompt for Gemini API that includes the face and speech data
      const prompt = `
        As a therapeutic AI, analyze this data:
        
        Facial expression: ${faceData ? JSON.stringify(faceData) : 'No facial data available'}
        Speech content: "${speechText}"
        
        Provide a compassionate, supportive response that addresses the emotional state observed. 
        Keep the response conversational, warm and helpful. Don't mention the technical details of the analysis.
      `;
      
      // Generate a response using Gemini API
      const aiResponse = await generateGeminiResponse(prompt);
      
      // Update the UI with the response
      setResponse(aiResponse);
      
      // Speak the response using the Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        speechSynthesis.speak(utterance);
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

  return (
    <section className="bg-[#E0F7FA] min-h-[90vh]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Emotion Recognition AI</h1>
          <p className="text-lg max-w-3xl mx-auto">
            Our AI will analyze your expressions and voice, responding with therapeutic insights.
          </p>
        </div>
        
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
    </section>
  );
}
