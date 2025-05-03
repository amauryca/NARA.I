// text-to-speech.ts - Interface with image-upscaling.net API for advanced text-to-speech
import axios from 'axios';

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

// Base64 audio player for API responses
const playAudioFromBase64 = (base64Data: string) => {
  const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
  audio.play().catch(err => {
    console.error('Error playing audio:', err);
  });
  return audio;
};

// Global variables to track current audio playback
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;

// Get text-to-speech from API
export const speakText = async (
  text: string, 
  voiceId: string = 'af_bella',
  speed: number = 1.0,
  apiKey?: string
): Promise<void> => {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  isSpeaking = true;
  
  try {
    // Use the image-upscaling.net API endpoint for text-to-speech
    const apiUrl = 'https://api.image-upscaling.net/v1/text-to-speech';
    
    const response = await axios.post(
      apiUrl, 
      {
        text,
        voice: voiceId,
        speed
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        responseType: 'json'
      }
    );
    
    if (response.data && response.data.audio) {
      currentAudio = playAudioFromBase64(response.data.audio);
      
      // Handle audio completion
      currentAudio.onended = () => {
        isSpeaking = false;
        currentAudio = null;
      };
    } else {
      console.error('Invalid API response:', response.data);
      // Fall back to browser's built-in TTS
      fallbackSpeakText(text, voiceId);
    }
  } catch (error) {
    console.error('Error using text-to-speech API:', error);
    // Fall back to browser's built-in TTS
    fallbackSpeakText(text, voiceId);
  }
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
