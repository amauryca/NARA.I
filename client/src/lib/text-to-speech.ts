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
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ar-XA', name: 'Arabic' }
];

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Define voice options from image-upscaling.net
export const premiumVoices: VoiceOption[] = [
  // American English
  { id: 'af_bella', name: 'Bella', lang: 'en-US', gender: 'female' },
  { id: 'af_jheart', name: 'Heart', lang: 'en-US', gender: 'male' },
  { id: 'af_nicole', name: 'Nicole', lang: 'en-US', gender: 'female' },
  { id: 'af_sarah', name: 'Sarah', lang: 'en-US', gender: 'female' },
  { id: 'af_sky', name: 'Sky', lang: 'en-US', gender: 'female' },
  { id: 'am_adam', name: 'Adam', lang: 'en-US', gender: 'male' },
  { id: 'am_michael', name: 'Michael', lang: 'en-US', gender: 'male' },
  { id: 'am_ryan', name: 'Ryan', lang: 'en-US', gender: 'male' },
  { id: 'am_jack', name: 'Jack', lang: 'en-US', gender: 'male' },
  { id: 'af_amy', name: 'Amy', lang: 'en-US', gender: 'female' },

  // British English
  { id: 'bf_emma', name: 'Emma', lang: 'en-GB', gender: 'female' },
  { id: 'bf_isabella', name: 'Isabella', lang: 'en-GB', gender: 'female' },
  { id: 'bf_lily', name: 'Lily', lang: 'en-GB', gender: 'female' },
  { id: 'bm_george', name: 'George', lang: 'en-GB', gender: 'male' },
  { id: 'bm_lewis', name: 'Lewis', lang: 'en-GB', gender: 'male' },
  { id: 'bm_noah', name: 'Noah', lang: 'en-GB', gender: 'male' },
  
  // French voices
  { id: 'fr_sophie', name: 'Sophie', lang: 'fr-FR', gender: 'female' },
  { id: 'fr_pierre', name: 'Pierre', lang: 'fr-FR', gender: 'male' },
  { id: 'fr_elise', name: 'Elise', lang: 'fr-FR', gender: 'female' },
  { id: 'fr_lucas', name: 'Lucas', lang: 'fr-FR', gender: 'male' },
  
  // Spanish voices
  { id: 'es_maria', name: 'Maria', lang: 'es-ES', gender: 'female' },
  { id: 'es_carlos', name: 'Carlos', lang: 'es-ES', gender: 'male' },
  { id: 'es_sofia', name: 'Sofia', lang: 'es-ES', gender: 'female' },
  { id: 'es_diego', name: 'Diego', lang: 'es-ES', gender: 'male' },
  
  // German voices
  { id: 'de_anna', name: 'Anna', lang: 'de-DE', gender: 'female' },
  { id: 'de_klaus', name: 'Klaus', lang: 'de-DE', gender: 'male' },
  { id: 'de_hannah', name: 'Hannah', lang: 'de-DE', gender: 'female' },
  { id: 'de_max', name: 'Max', lang: 'de-DE', gender: 'male' },
  
  // Italian voices
  { id: 'it_giulia', name: 'Giulia', lang: 'it-IT', gender: 'female' },
  { id: 'it_marco', name: 'Marco', lang: 'it-IT', gender: 'male' },
  
  // Portuguese voices
  { id: 'pt_beatriz', name: 'Beatriz', lang: 'pt-BR', gender: 'female' },
  { id: 'pt_rafael', name: 'Rafael', lang: 'pt-BR', gender: 'male' },
  
  // Polish voices
  { id: 'pl_zofia', name: 'Zofia', lang: 'pl-PL', gender: 'female' },
  { id: 'pl_kacper', name: 'Kacper', lang: 'pl-PL', gender: 'male' },
  
  // Turkish voices
  { id: 'tr_zeynep', name: 'Zeynep', lang: 'tr-TR', gender: 'female' },
  { id: 'tr_yusuf', name: 'Yusuf', lang: 'tr-TR', gender: 'male' },
  
  // Russian voices
  { id: 'ru_alisa', name: 'Alisa', lang: 'ru-RU', gender: 'female' },
  { id: 'ru_ivan', name: 'Ivan', lang: 'ru-RU', gender: 'male' },
  
  // Dutch voices
  { id: 'nl_lieke', name: 'Lieke', lang: 'nl-NL', gender: 'female' },
  { id: 'nl_daan', name: 'Daan', lang: 'nl-NL', gender: 'male' },
  
  // Japanese voices
  { id: 'ja_akira', name: 'Akira', lang: 'ja-JP', gender: 'male' },
  { id: 'ja_yui', name: 'Yui', lang: 'ja-JP', gender: 'female' },
  
  // Chinese voices
  { id: 'zh_lin', name: 'Lin', lang: 'zh-CN', gender: 'female' },
  { id: 'zh_chen', name: 'Chen', lang: 'zh-CN', gender: 'male' },
  
  // Korean voices
  { id: 'ko_minho', name: 'Minho', lang: 'ko-KR', gender: 'male' },
  { id: 'ko_jiwoo', name: 'Jiwoo', lang: 'ko-KR', gender: 'female' },
  
  // Hindi voices
  { id: 'hi_aarav', name: 'Aarav', lang: 'hi-IN', gender: 'male' },
  { id: 'hi_diya', name: 'Diya', lang: 'hi-IN', gender: 'female' },
  
  // Arabic voices
  { id: 'ar_amir', name: 'Amir', lang: 'ar-XA', gender: 'male' },
  { id: 'ar_layla', name: 'Layla', lang: 'ar-XA', gender: 'female' }
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
      },
      timeout: 3000 // 3 second timeout
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
  
  // Make sure voices are available - in some browsers we need to wait
  let voices = synth.getVoices();
  if (voices.length === 0) {
    // Set a flag to try again once voices are loaded
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        // Try again when voices are available
        fallbackSpeakText(text, voiceId);
      };
      return;
    }
  }
  
  // If a specific voice is requested, try to use it from browser voices
  if (voiceId !== 'default') {
    // Try to match by language
    const selectedVoice = premiumVoices.find(v => v.id === voiceId);
    
    if (selectedVoice) {
      const matchingVoice = voices.find(v => v.lang.startsWith(selectedVoice.lang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
        utterance.lang = matchingVoice.lang;
      } else {
        // If no matching voice, try to find any voice in the requested language
        const anyMatchingVoice = voices.find(v => v.lang.includes(selectedVoice.lang.split('-')[0]));
        if (anyMatchingVoice) {
          utterance.voice = anyMatchingVoice;
          utterance.lang = anyMatchingVoice.lang;
        } else {
          // Default to a common voice if available
          const defaultVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
          if (defaultVoice) {
            utterance.voice = defaultVoice;
            utterance.lang = defaultVoice.lang;
          }
        }
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
    
    // Set a timeout for the request
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
        },
        timeout: 5000 // 5 second timeout
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.id;
    }
    
    return null;
  } catch (error) {
    console.error('Error submitting text to TTS API:', error);
    // If there's an error, immediately use the fallback
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
    // Set a timeout to ensure we fall back to browser TTS if the API is taking too long
    const apiTimeout = setTimeout(() => {
      console.log('TTS API request timed out, using fallback');
      fallbackSpeakText(text, voiceId);
    }, 3000); // 3 second timeout
    
    // Submit text to TTS API
    const requestId = await submitTextToApi(text, voiceId, speed);
    
    // Clear the timeout since we got a response
    clearTimeout(apiTimeout);
    
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
