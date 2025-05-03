// text-to-speech.ts - Interface with image-upscaling.net API for advanced text-to-speech
import axios from 'axios';
// UUID v4 generator for client_id
import { v4 as uuidv4 } from 'uuid';

// Define available languages from the image-upscaling.net API
export const availableLanguages = [
  { code: 'en-US', name: 'American English' },
  { code: 'en-GB', name: 'British English' },
  { code: 'fr-FR', name: 'French' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'de-DE', name: 'German' },
  { code: 'zh-CN', name: 'Mandarin Chinese' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Brazilian Portuguese' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' }
];

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Define premium voice options from image-upscaling.net
export const premiumVoices: VoiceOption[] = [
  { id: 'af_bella', name: 'Bella', lang: 'en-US', gender: 'female' },
  { id: 'af_jheart', name: 'Heart', lang: 'en-US', gender: 'male' },
  { id: 'af_nicole', name: 'Nicole', lang: 'en-US', gender: 'female' },
  { id: 'af_sarah', name: 'Sarah', lang: 'en-US', gender: 'female' },
  { id: 'af_sky', name: 'Sky', lang: 'en-US', gender: 'female' },
  { id: 'am_adam', name: 'Adam', lang: 'en-US', gender: 'male' },
  { id: 'am_michael', name: 'Michael', lang: 'en-US', gender: 'male' },
  { id: 'bf_emma', name: 'Emma', lang: 'en-GB', gender: 'female' },
  { id: 'bf_isabella', name: 'Isabella', lang: 'en-GB', gender: 'female' },
  { id: 'bf_lily', name: 'Lily', lang: 'en-GB', gender: 'female' },
  { id: 'bm_george', name: 'George', lang: 'en-GB', gender: 'male' },
  { id: 'bm_lewis', name: 'Lewis', lang: 'en-GB', gender: 'male' },
  // French voices
  { id: 'fr_sophie', name: 'Sophie', lang: 'fr-FR', gender: 'female' },
  { id: 'fr_pierre', name: 'Pierre', lang: 'fr-FR', gender: 'male' },
  // Spanish voices
  { id: 'es_maria', name: 'Maria', lang: 'es-ES', gender: 'female' },
  { id: 'es_carlos', name: 'Carlos', lang: 'es-ES', gender: 'male' },
  // German voices
  { id: 'de_anna', name: 'Anna', lang: 'de-DE', gender: 'female' },
  { id: 'de_klaus', name: 'Klaus', lang: 'de-DE', gender: 'male' },
  // Mandarin voices
  { id: 'zh_lin', name: 'Lin', lang: 'zh-CN', gender: 'female' },
  { id: 'zh_chen', name: 'Chen', lang: 'zh-CN', gender: 'male' }
];

// Get API-based voices
export const getAvailableVoices = (language?: string): VoiceOption[] => {
  if (language) {
    // Filter voices by the selected language
    return premiumVoices.filter(voice => voice.lang === language);
  }
  return premiumVoices;
};

// Generate a 32-character client ID if not already created
const getClientId = (): string => {
  // Check if client ID is stored in localStorage
  let clientId = localStorage.getItem('tts_client_id');
  
  // If not found, generate a new one
  if (!clientId) {
    // Create a hex string that's 32 characters long
    clientId = uuidv4().replace(/-/g, '') + uuidv4().substring(0, 8);
    localStorage.setItem('tts_client_id', clientId);
  }
  
  return clientId;
};

// TTS API status checker
const checkAudioStatus = async (clientId: string): Promise<any> => {
  try {
    // Submit API request
    const apiEndpoint = 'https://image-upscaling.net/api/tts/status';
    
    const response = await axios.get(apiEndpoint, {
      params: { client_id: clientId },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return [];
  } catch (error) {
    console.error('Error checking TTS status:', error);
    return [];
  }
};

// Fallback to browser's built-in TTS when API is not working
const fallbackSpeakText = (
  text: string, 
  voiceId: string = 'default'
): void => {
  if (!('speechSynthesis' in window)) {
    console.error('Fallback text-to-speech not supported in this browser');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // If a specific voice is requested, try to use it from browser voices
  if (voiceId !== 'default') {
    const voices = synth.getVoices();
    // Try to match by language
    const selectedVoice = premiumVoices.find(v => v.id === voiceId);
    
    if (selectedVoice) {
      const matchingVoice = voices.find(v => v.lang.startsWith(selectedVoice.lang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
        utterance.lang = matchingVoice.lang;
      }
    }
  }
  
  // Start speaking
  synth.speak(utterance);
};

// Cache to store audio URLs
type AudioCache = {
  [key: string]: {
    url: string;
    timestamp: number;
  };
};

const audioCache: AudioCache = {};

// Global variables to track current audio playback
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;
let statusCheckInterval: number | null = null;

// Submit text to TTS API
const submitTextToApi = async (
  text: string, 
  voiceId: string = 'am_adam',
  speed: number = 1.0
): Promise<string | null> => {
  try {
    const clientId = getClientId();
    const apiEndpoint = 'https://image-upscaling.net/api/tts/submit';
    
    // Submit API request
    const response = await axios.post(
      apiEndpoint, 
      {
        client_id: clientId,
        text: text,
        voice: voiceId,
        speed: speed
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.id;
    }
    
    return null;
  } catch (error) {
    console.error('Error submitting text to TTS API:', error);
    return null;
  }
};

// Poll for TTS results
const pollForTtsResults = (requestId: string, maxAttempts = 20): Promise<string | null> => {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkStatus = async () => {
      const clientId = getClientId();
      const results = await checkAudioStatus(clientId);
      
      // Find our request
      const ourRequest = results.find((r: any) => r.id === requestId);
      
      if (ourRequest && ourRequest.output_url) {
        // Cache the result
        audioCache[requestId] = {
          url: ourRequest.output_url,
          timestamp: Date.now()
        };
        resolve(ourRequest.output_url);
        return;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        resolve(null);
        return;
      }
      
      // Check again in 1 second
      setTimeout(checkStatus, 1000);
    };
    
    checkStatus();
  });
};

// Get text-to-speech from API
export const speakText = async (
  text: string, 
  voiceId: string = 'am_adam',
  speed: number = 1.0
): Promise<void> => {
  // Stop any currently playing audio
  stopSpeech();
  
  isSpeaking = true;
  
  try {
    // Submit text to TTS API
    const requestId = await submitTextToApi(text, voiceId, speed);
    
    if (!requestId) {
      console.error('Failed to submit TTS request');
      fallbackSpeakText(text, voiceId);
      return;
    }
    
    // Check if we already have this audio in cache
    if (audioCache[requestId] && Date.now() - audioCache[requestId].timestamp < 86400000) {
      // Cache is less than 24 hours old, use it
      playAudio(audioCache[requestId].url);
      return;
    }
    
    // Poll for results
    const audioUrl = await pollForTtsResults(requestId);
    
    if (audioUrl) {
      playAudio(audioUrl);
    } else {
      console.error('Failed to get TTS audio URL');
      fallbackSpeakText(text, voiceId);
    }
  } catch (error) {
    console.error('Error using text-to-speech API:', error);
    // Fall back to browser's built-in TTS
    fallbackSpeakText(text, voiceId);
  }
};

// Play audio from URL
const playAudio = (url: string): void => {
  currentAudio = new Audio(url);
  
  currentAudio.onended = () => {
    isSpeaking = false;
    currentAudio = null;
  };
  
  currentAudio.onerror = () => {
    console.error('Error playing audio from URL');
    isSpeaking = false;
    currentAudio = null;
  };
  
  currentAudio.play().catch(err => {
    console.error('Error playing audio:', err);
    isSpeaking = false;
    currentAudio = null;
  });
};

// Stop current speech
export const stopSpeech = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  isSpeaking = false;
};

// Get voice options suitable for different age groups
export const getVoiceForAgeGroup = (ageGroup: string, language: string = 'en-US'): VoiceOption | null => {
  // Filter voices by language
  const voices = premiumVoices.filter(voice => voice.lang === language);
  
  // No voices available for this language
  if (voices.length === 0) return null;
  
  // Return a different voice based on age group if possible
  switch (ageGroup) {
    case 'child':
      // Try to find a friendly, higher-pitched voice
      return voices.find(v => v.name === 'Bella' || v.name === 'Sarah') || voices[0];
    
    case 'teen':
      // Try to find a younger-sounding voice
      return voices.find(v => v.name === 'Sky' || v.name === 'Nicole') || voices[0];
    
    case 'young':
      // Try to find an energetic voice
      return voices.find(v => v.name === 'Adam' || v.name === 'Emma') || voices[0];
    
    case 'adult':
      // Default neutral voice
      return voices.find(v => v.name === 'Heart' || v.name === 'Michael') || voices[0];
    
    case 'senior':
      // Try to find a more mature voice
      return voices.find(v => v.name === 'George' || v.name === 'Lewis') || voices[0];
    
    default:
      // Fallback to first available voice
      return voices[0];
  }
};

// Check if speech is currently active
export const isSpeechActive = (): boolean => {
  return isSpeaking;
};
