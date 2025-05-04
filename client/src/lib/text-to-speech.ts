// text-to-speech.ts - Interface with image-upscaling.net API for advanced text-to-speech
import axios from 'axios';
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

// Define common voice options
export const premiumVoices: VoiceOption[] = [
  // English voices (US)
  { id: 'en_us_001', name: 'Female 1', lang: 'en-US', gender: 'female' },
  { id: 'en_us_002', name: 'Male 1', lang: 'en-US', gender: 'male' },
  { id: 'en_us_006', name: 'Female 2', lang: 'en-US', gender: 'female' },
  { id: 'en_us_007', name: 'Male 2', lang: 'en-US', gender: 'male' },
  { id: 'en_us_009', name: 'Female 3', lang: 'en-US', gender: 'female' },
  { id: 'en_us_010', name: 'Male 3', lang: 'en-US', gender: 'male' },

  // English voices (UK)
  { id: 'en_uk_001', name: 'UK Female', lang: 'en-GB', gender: 'female' },
  { id: 'en_uk_003', name: 'UK Male', lang: 'en-GB', gender: 'male' },
  
  // French voices
  { id: 'fr_001', name: 'French Female', lang: 'fr-FR', gender: 'female' },
  { id: 'fr_002', name: 'French Male', lang: 'fr-FR', gender: 'male' },
  
  // Spanish voices
  { id: 'es_002', name: 'Spanish Female', lang: 'es-ES', gender: 'female' },
  { id: 'es_male_m03', name: 'Spanish Male', lang: 'es-ES', gender: 'male' },
  
  // German voices
  { id: 'de_001', name: 'German Female', lang: 'de-DE', gender: 'female' },
  { id: 'de_002', name: 'German Male', lang: 'de-DE', gender: 'male' },
  
  // Other common languages
  { id: 'jp_001', name: 'Japanese Female', lang: 'ja-JP', gender: 'female' },
  { id: 'jp_006', name: 'Japanese Male', lang: 'ja-JP', gender: 'male' },
  { id: 'ru_008', name: 'Russian Female', lang: 'ru-RU', gender: 'female' },
  { id: 'ru_006', name: 'Russian Male', lang: 'ru-RU', gender: 'male' },
  { id: 'cn_female_shaoning', name: 'Chinese Female', lang: 'zh-CN', gender: 'female' },
  { id: 'cn_male_xiaoming', name: 'Chinese Male', lang: 'zh-CN', gender: 'male' }
];

// Filter voices by language
export const getAvailableVoices = (language?: string): VoiceOption[] => {
  if (language) {
    return premiumVoices.filter(voice => voice.lang === language);
  }
  return premiumVoices;
};

// Generate client ID for the API (32-character hex string as required by API)
const getClientId = (): string => {
  let clientId = localStorage.getItem('tts_client_id');
  
  if (!clientId || clientId.length !== 32) {
    // Generate a new client ID that's exactly 32 hex characters
    const rawId = uuidv4().replace(/-/g, '');
    clientId = rawId + rawId.substring(0, 32 - rawId.length);
    localStorage.setItem('tts_client_id', clientId);
  }
  
  return clientId;
};

// Audio playback state management
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;

// Basic browser TTS fallback
const useBrowserTTS = (text: string, voiceId: string = 'default'): void => {
  if (!('speechSynthesis' in window)) {
    console.error('Browser text-to-speech not supported');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to match the voice with the browser's available voices
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  if (voices.length > 0) {
    // Find the selected premium voice to get its language
    const selectedVoice = premiumVoices.find(v => v.id === voiceId);
    
    if (selectedVoice) {
      // Try to find a matching browser voice with the same language
      const matchingVoice = voices.find(v => v.lang === selectedVoice.lang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
        utterance.lang = matchingVoice.lang;
      }
    }
  }
  
  // Set event handlers
  utterance.onend = () => {
    isSpeaking = false;
  };
  
  utterance.onerror = () => {
    isSpeaking = false;
  };
  
  // Start speaking
  isSpeaking = true;
  synth.speak(utterance);
};

// Use browser's built-in TTS directly
const useBrowserTTSWithVoice = async (
  text: string,
  voiceId: string = 'en_us_002', // Default voice 
  speed: number = 1.0
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error('Browser text-to-speech not supported');
      resolve(false);
      return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    
    // Set up event handlers
    utterance.onend = () => {
      isSpeaking = false;
      resolve(true);
    };
    
    utterance.onerror = () => {
      console.error('Speech synthesis error');
      isSpeaking = false;
      resolve(false);
    };
    
    // Get and filter available voices
    const allVoices = window.speechSynthesis.getVoices();
    
    if (allVoices.length === 0) {
      // If no voices available yet, wait for them to load
      if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => {
          const voices = window.speechSynthesis.getVoices();
          setVoiceForUtterance(utterance, voices, voiceId);
          startSpeaking(utterance);
        };
      } else {
        // No voices yet and no way to wait for them, use defaults
        startSpeaking(utterance);
      }
    } else {
      // Voices are already available
      setVoiceForUtterance(utterance, allVoices, voiceId);
      startSpeaking(utterance);
    }
  });
};

// Set appropriate voice for the utterance based on voiceId
const setVoiceForUtterance = (utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[], voiceId: string): void => {
  // Find matching premium voice to get language and gender
  const selectedPremiumVoice = premiumVoices.find(v => v.id === voiceId);
  
  if (selectedPremiumVoice) {
    const language = selectedPremiumVoice.lang;
    const gender = selectedPremiumVoice.gender;
    
    // Filter by exact language match first
    let matchingVoices = voices.filter(v => v.lang === language);
    
    // If no exact match, try broader language family
    if (matchingVoices.length === 0) {
      const langCode = language.split('-')[0];
      matchingVoices = voices.filter(v => v.lang.startsWith(langCode));
    }
    
    // If still no match, use any English voice or default
    if (matchingVoices.length === 0) {
      matchingVoices = voices.filter(v => v.lang.startsWith('en'));
    }
    
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    // Try to match by gender
    if (gender === 'female') {
      // Try to find female voice
      const femaleVoice = matchingVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        (!v.name.toLowerCase().includes('male') && 
         !v.name.toLowerCase().includes('man')));
         
      selectedVoice = femaleVoice || null;
    } else if (gender === 'male') {
      // Try to find male voice
      const maleVoice = matchingVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man'));
        
      selectedVoice = maleVoice || null;
    }
    
    // If we found a matching voice, use it
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } 
    // Otherwise use the first available from filtered list
    else if (matchingVoices.length > 0) {
      utterance.voice = matchingVoices[0];
      utterance.lang = matchingVoices[0].lang;
    }
    // Very last resort - use first available voice
    else if (voices.length > 0) {
      utterance.voice = voices[0];
    }
  }
};

// Start the speaking process
const startSpeaking = (utterance: SpeechSynthesisUtterance): void => {
  isSpeaking = true;
  window.speechSynthesis.speak(utterance);
};

// Play audio from URL
const playAudio = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    stopSpeech(); // Stop any current playback
    
    currentAudio = new Audio(url);
    
    // Set up audio event handlers
    currentAudio.onended = () => {
      isSpeaking = false;
      currentAudio = null;
      resolve();
    };
    
    currentAudio.onerror = (error) => {
      console.error('Error playing audio:', error);
      isSpeaking = false;
      currentAudio = null;
      reject(error);
    };
    
    // Start playback
    isSpeaking = true;
    currentAudio.play().catch(error => {
      console.error('Audio playback failed:', error);
      isSpeaking = false;
      currentAudio = null;
      reject(error);
    });
  });
};

// This is a stub since we've switched to browser-based TTS only
// It's kept here to maintain compatibility with existing code
const submitTTSRequest = async (): Promise<null> => {
  return null;
};

// This is a stub since we've switched to browser-based TTS only
// It's kept here to maintain compatibility with existing code
const checkTTSStatus = async (): Promise<any[]> => {
  return [];
};

// Stop any current speech playback
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

// Main TTS function - now using browser's built-in TTS
export const speakText = async (
  text: string,
  voiceId: string = 'en_us_002',
  speed: number = 1.0
): Promise<void> => {
  console.log(`Speaking text with voice ${voiceId}:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
  
  // Stop any current playback
  stopSpeech();
  
  try {
    // Use the browser's built-in TTS with our voice matching system
    const success = await useBrowserTTSWithVoice(text, voiceId, speed);
    
    if (!success) {
      // If the primary method failed, try the basic browser TTS as fallback
      console.warn('Enhanced browser TTS failed, trying basic fallback');
      useBrowserTTS(text, voiceId);
    }
  } catch (error) {
    console.error('TTS error:', error);
    // Last resort fallback
    useBrowserTTS(text, voiceId);
  }
};

// Get voice for the selected age group
export const getVoiceForAgeGroup = (ageGroup: string, language: string = 'en-US'): VoiceOption | null => {
  // Get voices for the specified language
  const voices = premiumVoices.filter(v => v.lang === language);
  
  // If no voices available for this language, return null
  if (voices.length === 0) return null;
  
  // Get gender-specific voices
  const femaleVoices = voices.filter(v => v.gender === 'female');
  const maleVoices = voices.filter(v => v.gender === 'male');
  
  // Select based on age group and availability
  switch (ageGroup) {
    case 'child':
      // Prefer female voices for children
      return femaleVoices[0] || voices[0];
      
    case 'teen':
      // Use female voice for teens
      return femaleVoices[0] || voices[0];
      
    case 'young':
      // Mix of male/female for young adults
      return voices[0];
      
    case 'adult':
      // Prefer male voices for adults
      return maleVoices[0] || voices[0];
      
    case 'senior':
      // Use male voice or British voice for seniors if available
      if (language === 'en-GB' && voices.length > 0) {
        return voices[0];
      }
      return maleVoices[0] || voices[0];
      
    default:
      // Default to first available voice
      return voices[0];
  }
};

// Check if speech is currently active
export const isSpeechActive = (): boolean => {
  return isSpeaking;
};
