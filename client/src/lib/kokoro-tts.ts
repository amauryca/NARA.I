// kokoro-tts.ts - Integration with Kokoro TTS model via the FastAPI wrapper
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define the available languages supported by Kokoro TTS
export const availableLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'British English' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'it-IT', name: 'Italian' }
];

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Kokoro voices configuration
export const kokoroVoices: VoiceOption[] = [
  // English - US voices
  { id: 'dan', name: 'Dan (American)', lang: 'en-US', gender: 'male' },
  { id: 'leo', name: 'Leo (American)', lang: 'en-US', gender: 'male' },
  { id: 'zac', name: 'Zac (American)', lang: 'en-US', gender: 'male' },
  { id: 'tara', name: 'Tara (American)', lang: 'en-US', gender: 'female' },
  { id: 'jess', name: 'Jess (American)', lang: 'en-US', gender: 'female' },
  { id: 'leah', name: 'Leah (American)', lang: 'en-US', gender: 'female' },
  { id: 'mia', name: 'Mia (American)', lang: 'en-US', gender: 'female' },
  { id: 'zoe', name: 'Zoe (American)', lang: 'en-US', gender: 'female' },
  
  // UK voices
  { id: 'george', name: 'George (British)', lang: 'en-GB', gender: 'male' },
  { id: 'emma', name: 'Emma (British)', lang: 'en-GB', gender: 'female' },
  
  // French voices
  { id: 'pierre', name: 'Pierre (French)', lang: 'fr-FR', gender: 'male' },
  { id: 'amelie', name: 'Amelie (French)', lang: 'fr-FR', gender: 'female' },
  { id: 'marie', name: 'Marie (French)', lang: 'fr-FR', gender: 'female' },
  
  // Spanish voices
  { id: 'javi', name: 'Javi (Spanish)', lang: 'es-ES', gender: 'male' },
  { id: 'sergio', name: 'Sergio (Spanish)', lang: 'es-ES', gender: 'male' },
  { id: 'maria', name: 'Maria (Spanish)', lang: 'es-ES', gender: 'female' },
  
  // German voices
  { id: 'thomas', name: 'Thomas (German)', lang: 'de-DE', gender: 'male' },
  { id: 'max', name: 'Max (German)', lang: 'de-DE', gender: 'male' },
  { id: 'jana', name: 'Jana (German)', lang: 'de-DE', gender: 'female' },
  
  // Italian voices
  { id: 'pietro', name: 'Pietro (Italian)', lang: 'it-IT', gender: 'male' },
  { id: 'carlo', name: 'Carlo (Italian)', lang: 'it-IT', gender: 'male' },
  { id: 'giulia', name: 'Giulia (Italian)', lang: 'it-IT', gender: 'female' }
];

// Define the Kokoro TTS API URL - this should be the FastAPI endpoint
const KOKORO_API_URL = import.meta.env.VITE_KOKORO_API_URL || '/api/tts';

// Audio playback state management
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;

// Filter voices by language
export const getAvailableVoices = (language?: string): VoiceOption[] => {
  if (language) {
    return kokoroVoices.filter(voice => voice.lang === language);
  }
  return kokoroVoices;
};

// Generate client ID for sessions
const getClientId = (): string => {
  let clientId = localStorage.getItem('kokoro_client_id');
  
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem('kokoro_client_id', clientId);
  }
  
  return clientId;
};

// Stop any current speech playback
export const stopSpeech = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  isSpeaking = false;
};

// Check if speech is currently active
export const isSpeechActive = (): boolean => {
  return isSpeaking;
};

// Play audio from URL
const playAudio = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Stop any current playback
    stopSpeech();
    
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

// Main function to generate speech using Kokoro TTS
export const speakText = async (
  text: string,
  voiceId: string = 'tara',
  speed: number = 1.0
): Promise<void> => {
  try {
    console.log(`Generating speech with Kokoro TTS voice ${voiceId} for text:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
    
    // Make request to Kokoro TTS API
    const response = await axios.post(`${KOKORO_API_URL}/generate`, {
      text,
      voice: voiceId,
      speed,
      client_id: getClientId()
    });
    
    if (response.data && response.data.audio_url) {
      console.log('Kokoro TTS generated audio successfully');
      await playAudio(response.data.audio_url);
    } else {
      console.error('Failed to generate speech with Kokoro TTS:', response.data);
    }
  } catch (error) {
    console.error('Kokoro TTS process failed:', error);
  }
};

// Get voice for the selected age group - mapping age groups to appropriate voices
export const getVoiceForAgeGroup = (ageGroup: string, language: string = 'en-US'): VoiceOption | null => {
  // Get voices for the specified language
  const voices = kokoroVoices.filter(v => v.lang === language);
  
  // If no voices available for this language, return null
  if (voices.length === 0) return null;
  
  // Get gender-specific voices
  const femaleVoices = voices.filter(v => v.gender === 'female');
  const maleVoices = voices.filter(v => v.gender === 'male');
  
  // Select based on age group and availability
  switch (ageGroup) {
    case 'child':
      // For children, prefer female voices with friendly tones
      if (language === 'en-US') {
        const childVoice = kokoroVoices.find(v => v.id === 'zoe');
        if (childVoice) return childVoice;
        return femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'teen':
      // For teens, use more relatable voices
      if (language === 'en-US') {
        const teenVoice = kokoroVoices.find(v => v.id === 'jess' || v.id === 'zac');
        if (teenVoice) return teenVoice;
        return femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'young':
      // Young adult voices
      if (language === 'en-US') {
        const youngVoice = kokoroVoices.find(v => v.id === 'leo' || v.id === 'mia');
        if (youngVoice) return youngVoice;
        return voices[0];
      }
      return voices[0];
      
    case 'adult':
      // Professional adult voices
      if (language === 'en-US') {
        const adultVoice = kokoroVoices.find(v => v.id === 'dan');
        if (adultVoice) return adultVoice;
        return maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    case 'senior':
      // Senior-appropriate voices
      if (language === 'en-GB') {
        const seniorVoice = kokoroVoices.find(v => v.id === 'george');
        if (seniorVoice) return seniorVoice;
        return maleVoices[0] || voices[0];
      } else if (language === 'en-US') {
        const seniorVoice = kokoroVoices.find(v => v.id === 'dan');
        if (seniorVoice) return seniorVoice;
        return maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    default:
      // Default to a neutral voice
      if (language === 'en-US') {
        const defaultVoice = kokoroVoices.find(v => v.id === 'tara');
        if (defaultVoice) return defaultVoice;
      }
      return voices[0];
  }
};
