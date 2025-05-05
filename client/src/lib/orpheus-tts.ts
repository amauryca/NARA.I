// orpheus-tts.ts - Implements text-to-speech using Orpheus TTS API
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define available languages
export const availableLanguages = [
  { code: 'en-US', name: 'American English' },
  { code: 'en-GB', name: 'British English' },
  { code: 'fr-FR', name: 'French' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'de-DE', name: 'German' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ja-JP', name: 'Japanese' }
];

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Define voice options based on Orpheus TTS
export const orpheusVoices: VoiceOption[] = [
  // English - US voices
  { id: 'tara', name: 'Tara (American)', lang: 'en-US', gender: 'female' },
  { id: 'leah', name: 'Leah (American)', lang: 'en-US', gender: 'female' },
  { id: 'jess', name: 'Jess (American)', lang: 'en-US', gender: 'female' },
  { id: 'zoe', name: 'Zoe (American)', lang: 'en-US', gender: 'female' },
  { id: 'mia', name: 'Mia (American)', lang: 'en-US', gender: 'female' },
  { id: 'leo', name: 'Leo (American)', lang: 'en-US', gender: 'male' },
  { id: 'dan', name: 'Dan (American)', lang: 'en-US', gender: 'male' },
  { id: 'zac', name: 'Zac (American)', lang: 'en-US', gender: 'male' },
  
  // English - UK voices
  { id: 'emma', name: 'Emma (British)', lang: 'en-GB', gender: 'female' },
  { id: 'bella', name: 'Bella (British)', lang: 'en-GB', gender: 'female' },
  { id: 'noah', name: 'Noah (British)', lang: 'en-GB', gender: 'male' },
  { id: 'oliver', name: 'Oliver (British)', lang: 'en-GB', gender: 'male' },
  
  // Multilingual voices with approximate mappings
  // French
  { id: 'marie', name: 'Marie (French)', lang: 'fr-FR', gender: 'female' },
  { id: 'pierre', name: 'Pierre (French)', lang: 'fr-FR', gender: 'male' },
  
  // Spanish
  { id: 'sofia', name: 'Sofia (Spanish)', lang: 'es-ES', gender: 'female' },
  { id: 'diego', name: 'Diego (Spanish)', lang: 'es-ES', gender: 'male' },
  
  // German
  { id: 'hannah', name: 'Hannah (German)', lang: 'de-DE', gender: 'female' },
  { id: 'lukas', name: 'Lukas (German)', lang: 'de-DE', gender: 'male' },
  
  // Chinese
  { id: 'mei', name: 'Mei (Chinese)', lang: 'zh-CN', gender: 'female' },
  { id: 'li', name: 'Li (Chinese)', lang: 'zh-CN', gender: 'male' },
  
  // Japanese
  { id: 'yui', name: 'Yui (Japanese)', lang: 'ja-JP', gender: 'female' },
  { id: 'hiro', name: 'Hiro (Japanese)', lang: 'ja-JP', gender: 'male' }
];

// Audio playback state management
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;

// Filter voices by language
export const getAvailableVoices = (language?: string): VoiceOption[] => {
  if (language) {
    return orpheusVoices.filter(voice => voice.lang === language);
  }
  return orpheusVoices;
};

// Generate client ID for sessions
const getClientId = (): string => {
  let clientId = localStorage.getItem('orpheus_client_id');
  
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem('orpheus_client_id', clientId);
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

// Main TTS function - generates speech using Orpheus TTS via our API
export const speakText = async (
  text: string,
  voiceId: string = 'tara',
  speed: number = 1.0
): Promise<void> => {
  console.log(`Speaking text with Orpheus voice ${voiceId}:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
  
  // Stop any current playback
  stopSpeech();
  
  if (text.trim().length === 0) {
    console.warn('Empty text provided, nothing to speak');
    return;
  }
  
  try {
    // Submit request to the Orpheus TTS API
    const response = await axios.post('/api/orpheus/generate', {
      text,
      voice: voiceId,
      speed,
      client_id: getClientId()
    });
    
    if (response.data && response.data.success && response.data.audioUrl) {
      console.log('Orpheus TTS generated successfully with URL:', response.data.audioUrl);
      // Play the audio
      await playAudio(response.data.audioUrl);
    } else {
      console.error('Failed to generate speech with Orpheus TTS:', response.data);
    }
  } catch (error) {
    console.error('Orpheus TTS process failed:', error);
  }
};

// Get voice for the selected age group
export const getVoiceForAgeGroup = (ageGroup: string, language: string = 'en-US'): VoiceOption | null => {
  // Get voices for the specified language
  const voices = orpheusVoices.filter(v => v.lang === language);
  
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
        const childVoice = orpheusVoices.find(v => v.id === 'zoe');
        if (childVoice) return childVoice;
        return femaleVoices[0] || voices[0];
      } else if (language === 'en-GB') {
        const childVoice = orpheusVoices.find(v => v.id === 'bella');
        if (childVoice) return childVoice;
        return femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'teen':
      // For teens, use more relatable voices
      if (language === 'en-US') {
        const teenVoice = orpheusVoices.find(v => v.id === 'jess' || v.id === 'zac');
        if (teenVoice) return teenVoice;
        return femaleVoices[0] || voices[0];
      } else if (language === 'en-GB') {
        return femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'young':
      // Young adult voices
      if (language === 'en-US') {
        const youngVoice = orpheusVoices.find(v => v.id === 'leo' || v.id === 'mia');
        if (youngVoice) return youngVoice;
        return voices[0];
      } else if (language === 'en-GB') {
        return voices[0];
      }
      return voices[0];
      
    case 'adult':
      // Professional adult voices
      if (language === 'en-US') {
        const adultVoice = orpheusVoices.find(v => v.id === 'dan');
        if (adultVoice) return adultVoice;
        return maleVoices[0] || voices[0];
      } else if (language === 'en-GB') {
        const adultVoice = orpheusVoices.find(v => v.id === 'noah');
        if (adultVoice) return adultVoice;
        return maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    case 'senior':
      // Senior-appropriate voices
      if (language === 'en-GB') {
        const seniorVoice = orpheusVoices.find(v => v.id === 'oliver');
        if (seniorVoice) return seniorVoice;
        return maleVoices[0] || voices[0];
      } else if (language === 'en-US') {
        const seniorVoice = orpheusVoices.find(v => v.id === 'dan');
        if (seniorVoice) return seniorVoice;
        return maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    default:
      // Default to a neutral voice
      if (language === 'en-US') {
        const defaultVoice = orpheusVoices.find(v => v.id === 'tara');
        if (defaultVoice) return defaultVoice;
      }
      return voices[0];
  }
};