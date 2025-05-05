// Web Speech API implementation for TTS
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

// Voice state management
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeaking = false;

// Get available voices
export const getAvailableVoices = (language?: string): VoiceOption[] => {
  // Check if Web Speech API is supported
  if (!window.speechSynthesis) {
    console.error('Web Speech API not supported in this browser');
    return [];
  }

  // Get all available voices
  const synth = window.speechSynthesis;
  const voicesList = synth.getVoices();
  
  // Convert to our VoiceOption format
  const voices: VoiceOption[] = voicesList.map(voice => ({
    id: `${voice.voiceURI}`,
    name: voice.name,
    lang: voice.lang,
    gender: voice.name.includes('Female') || voice.name.toLowerCase().includes('female') ? 'female' : 'male'
  }));
  
  // Filter by language if specified
  if (language) {
    return voices.filter(voice => voice.lang.startsWith(language));
  }
  
  return voices;
};

// Handle voices not being immediately available
export const initVoices = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    
    // If voices are already loaded
    if (synth.getVoices().length > 0) {
      resolve(true);
      return;
    }
    
    // Wait for voices to be loaded
    synth.onvoiceschanged = () => {
      resolve(true);
    };
    
    // Fallback in case voices don't load
    setTimeout(() => {
      if (synth.getVoices().length === 0) {
        console.warn('No voices loaded within timeout period');
        resolve(false);
      }
    }, 1000);
  });
};

// Stop any current speech
export const stopSpeech = (): void => {
  if (currentUtterance) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
  
  isSpeaking = false;
};

// Check if speech is active
export const isSpeechActive = (): boolean => {
  return isSpeaking;
};

// Test a specific voice
export const testVoice = async (voiceId: string): Promise<void> => {
  const testText = "Hello, this is a test of the voice synthesis system. How does my voice sound?";
  return speakText(testText, voiceId);
};

// Main function to speak text
export const speakText = async (
  text: string,
  voiceId: string = '',
  rate: number = 1.0
): Promise<void> => {
  try {
    // Check if Web Speech API is available
    if (!window.speechSynthesis) {
      console.error('Web Speech API not supported in this browser');
      return;
    }
    
    // Stop any current speech
    stopSpeech();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find the requested voice
    if (voiceId) {
      const selectedVoice = voices.find(voice => `${voice.voiceURI}` === voiceId);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn(`Voice ${voiceId} not found. Using default voice.`);
      }
    }
    
    // Set up events
    utterance.onstart = () => {
      isSpeaking = true;
    };
    
    utterance.onend = () => {
      isSpeaking = false;
      currentUtterance = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      isSpeaking = false;
      currentUtterance = null;
    };
    
    // Start speaking
    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    
  } catch (error) {
    console.error('Error in speakText:', error);
    isSpeaking = false;
    currentUtterance = null;
  }
};

// Get appropriate voice for age group
export const getVoiceForAgeGroup = (ageGroup: string, language: string = 'en-US'): VoiceOption | null => {
  // Get voices for the specified language
  const voices = getAvailableVoices(language);
  
  // If no voices available for this language, return null
  if (voices.length === 0) return null;
  
  // Get gender-specific voices
  const femaleVoices = voices.filter(v => v.gender === 'female');
  const maleVoices = voices.filter(v => v.gender === 'male');
  
  // If we don't have gender-specific voices, just return the first voice
  if (femaleVoices.length === 0 && maleVoices.length === 0) {
    return voices[0];
  }
  
  // Select voice based on age group
  switch (ageGroup) {
    case 'child':
      return femaleVoices[0] || voices[0]; // Female voice for children
      
    case 'teen':
      return femaleVoices[0] || voices[0]; // Female voice for teens
      
    case 'young':
      const youngVoices = [...femaleVoices, ...maleVoices];
      // Find a voice that sounds younger if possible
      return youngVoices[0] || voices[0];
      
    case 'adult':
      return maleVoices[0] || voices[0]; // Male voice for adults
      
    case 'senior':
      return maleVoices[0] || voices[0]; // Male voice for seniors
      
    default:
      // Default to a neutral voice
      return voices[0];
  }
};

// Initialize voices when the module loads
if (typeof window !== 'undefined') {
  initVoices().then(success => {
    if (success) {
      console.log('TTS voices initialized successfully');
    } else {
      console.warn('Failed to initialize TTS voices');
    }
  });
}
