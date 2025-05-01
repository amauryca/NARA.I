// face-api.ts - Interface with face-api.js library

// Import face-api directly from CDN in index.html

interface FaceDetectionResult {
  expressions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  };
  gender?: string;
  age?: number;
}

// Load face-api.js models
export const loadFaceApiModels = async (): Promise<void> => {
  try {
    // Make sure face-api is available
    if (!(window as any).faceapi) {
      throw new Error("face-api.js not loaded");
    }
    
    const faceapi = (window as any).faceapi;
    
    // Load models from the public folder
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log("All face-api.js models loaded successfully");
    return;
  } catch (error) {
    console.error("Error loading face-api.js models:", error);
    throw error;
  }
};

// Detect face and expressions from video element
export const detectFace = async (videoElement: HTMLVideoElement): Promise<FaceDetectionResult | null> => {
  try {
    if (!(window as any).faceapi) {
      throw new Error("face-api.js not loaded");
    }
    
    const faceapi = (window as any).faceapi;
    
    if (!videoElement || videoElement.paused || videoElement.ended) {
      return null;
    }
    
    // Detect all faces and get expressions
    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    
    // Return null if no faces detected
    if (!detections || detections.length === 0) {
      return null;
    }
    
    // Just use the first face detected
    const face = detections[0];
    
    // Return expression data
    return {
      expressions: face.expressions
    };
  } catch (error) {
    console.error("Error during face detection:", error);
    return null;
  }
};
