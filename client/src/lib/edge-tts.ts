// Edge TTS implementation for NARA.I
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Define available languages
export const availableLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' }
];

// Define available voices for Edge TTS
export const edgeVoices: VoiceOption[] = [
  // English (US) voices
  { id: 'en-US-AriaNeural', name: 'Aria', lang: 'en-US', gender: 'female' },
  { id: 'en-US-GuyNeural', name: 'Guy', lang: 'en-US', gender: 'male' },
  { id: 'en-US-JennyNeural', name: 'Jenny', lang: 'en-US', gender: 'female' },
  { id: 'en-US-SaraNeural', name: 'Sara', lang: 'en-US', gender: 'female' },
  { id: 'en-US-DavisNeural', name: 'Davis', lang: 'en-US', gender: 'male' },
  { id: 'en-US-AmberNeural', name: 'Amber (Child)', lang: 'en-US', gender: 'female' },
  { id: 'en-US-AndrewNeural', name: 'Andrew', lang: 'en-US', gender: 'male' },
  { id: 'en-US-BrianNeural', name: 'Brian', lang: 'en-US', gender: 'male' },
  
  // English (UK) voices
  { id: 'en-GB-LibbyNeural', name: 'Libby', lang: 'en-GB', gender: 'female' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', lang: 'en-GB', gender: 'male' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', lang: 'en-GB', gender: 'female' },
  
  // Spanish voices
  { id: 'es-ES-ElviraNeural', name: 'Elvira', lang: 'es-ES', gender: 'female' },
  { id: 'es-ES-AlvaroNeural', name: 'Alvaro', lang: 'es-ES', gender: 'male' },
  
  // French voices
  { id: 'fr-FR-DeniseNeural', name: 'Denise', lang: 'fr-FR', gender: 'female' },
  { id: 'fr-FR-HenriNeural', name: 'Henri', lang: 'fr-FR', gender: 'male' },
  
  // German voices
  { id: 'de-DE-KatjaNeural', name: 'Katja', lang: 'de-DE', gender: 'female' },
  { id: 'de-DE-ConradNeural', name: 'Conrad', lang: 'de-DE', gender: 'male' },
  
  // Italian voices
  { id: 'it-IT-ElsaNeural', name: 'Elsa', lang: 'it-IT', gender: 'female' },
  { id: 'it-IT-DiegoNeural', name: 'Diego', lang: 'it-IT', gender: 'male' },
  
  // Japanese voices
  { id: 'ja-JP-NanamiNeural', name: 'Nanami', lang: 'ja-JP', gender: 'female' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita', lang: 'ja-JP', gender: 'male' },
  
  // Korean voices
  { id: 'ko-KR-SunHiNeural', name: 'SunHi', lang: 'ko-KR', gender: 'female' },
  { id: 'ko-KR-InJoonNeural', name: 'InJoon', lang: 'ko-KR', gender: 'male' },
  
  // Portuguese (Brazil) voices
  { id: 'pt-BR-FranciscaNeural', name: 'Francisca', lang: 'pt-BR', gender: 'female' },
  { id: 'pt-BR-AntonioNeural', name: 'Antonio', lang: 'pt-BR', gender: 'male' },
  
  // Chinese (Simplified) voices
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', lang: 'zh-CN', gender: 'female' },
  { id: 'zh-CN-YunjianNeural', name: 'Yunjian', lang: 'zh-CN', gender: 'male' }
];

// Define the API URL for the Edge TTS endpoint
const EDGE_TTS_API_URL = import.meta.env.VITE_EDGE_TTS_API_URL || '/api/edge-tts';

// Audio playback state management
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;

// Filter voices by language
export const getAvailableVoices = (language?: string): VoiceOption[] => {
  if (language) {
    return edgeVoices.filter(voice => voice.lang === language);
  }
  return edgeVoices;
};

// Generate client ID for sessions
const getClientId = (): string => {
  let clientId = localStorage.getItem('edge_tts_client_id');
  
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem('edge_tts_client_id', clientId);
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

// Function to test a voice with a sample text
export const testVoice = async (voiceId: string): Promise<void> => {
  const testText = "Hello, this is a test of the voice synthesis system. How does my voice sound?";
  return speakText(testText, voiceId);
};

// Main function to generate speech using Edge TTS
export const speakText = async (
  text: string,
  voiceId: string = 'en-US-AriaNeural',
  speed: number = 1.0
): Promise<void> => {
  try {
    console.log(`Generating speech with Edge TTS voice ${voiceId} for text:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
    
    // Make request to Edge TTS API
    const response = await axios.post(`${EDGE_TTS_API_URL}/generate`, {
      text,
      voice: voiceId,
      speed,
      client_id: getClientId()
    });
    
    if (response.data && response.data.audio_url) {
      console.log('Edge TTS generated audio successfully');
      await playAudio(response.data.audio_url);
    } else {
      console.error('Failed to generate speech with Edge TTS:', response.data);
    }
  } catch (error) {
    console.error('Edge TTS process failed:', error);
  }
};

// Get voice for the selected age group - mapping age groups to appropriate voices
export const getVoiceForAgeGroup = (ageGroup: string, language: string = 'en-US'): VoiceOption | null => {
  // Get voices for the specified language
  const voices = edgeVoices.filter(v => v.lang === language);
  
  // If no voices available for this language, return null
  if (voices.length === 0) return null;
  
  // Get gender-specific voices
  const femaleVoices = voices.filter(v => v.gender === 'female');
  const maleVoices = voices.filter(v => v.gender === 'male');
  
  // Select based on age group and availability
  switch (ageGroup) {
    case 'child':
      // For children, prefer voices that sound youthful
      if (language === 'en-US') {
        const childVoice = edgeVoices.find(v => v.id === 'en-US-AmberNeural');
        if (childVoice) return childVoice;
        return femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'teen':
      // For teens, use more relatable voices
      if (language === 'en-US') {
        const teenVoice = edgeVoices.find(v => v.id === 'en-US-JennyNeural');
        if (teenVoice) return teenVoice;
        return femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'young':
      // Young adult voices
      if (language === 'en-US') {
        const youngVoice = edgeVoices.find(v => v.id === 'en-US-AndrewNeural');
        if (youngVoice) return youngVoice;
        return voices[0];
      }
      return voices[0];
      
    case 'adult':
      // Professional adult voices
      if (language === 'en-US') {
        const adultVoice = edgeVoices.find(v => v.id === 'en-US-GuyNeural');
        if (adultVoice) return adultVoice;
        return maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    case 'senior':
      // Senior-appropriate voices
      if (language === 'en-GB') {
        const seniorVoice = edgeVoices.find(v => v.id === 'en-GB-RyanNeural');
        if (seniorVoice) return seniorVoice;
        return maleVoices[0] || voices[0];
      } else if (language === 'en-US') {
        const seniorVoice = edgeVoices.find(v => v.id === 'en-US-BrianNeural');
        if (seniorVoice) return seniorVoice;
        return maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    default:
      // Default to a neutral voice
      if (language === 'en-US') {
        const defaultVoice = edgeVoices.find(v => v.id === 'en-US-AriaNeural');
        if (defaultVoice) return defaultVoice;
      }
      return voices[0];
  }
};