// orpheus-tts.ts - Implements text-to-speech using Orpheus TTS API
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define available languages based on Orpheus TTS supported languages
export const availableLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'hi-IN', name: 'Hindi' }
];

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Define voice options based on Orpheus TTS documentation
export const orpheusVoices: VoiceOption[] = [
  // English - US voices (in order of conversational realism)
  { id: 'tara', name: 'Tara', lang: 'en-US', gender: 'female' },
  { id: 'leah', name: 'Leah', lang: 'en-US', gender: 'female' },
  { id: 'jess', name: 'Jess', lang: 'en-US', gender: 'female' },
  { id: 'leo', name: 'Leo', lang: 'en-US', gender: 'male' },
  { id: 'dan', name: 'Dan', lang: 'en-US', gender: 'male' },
  { id: 'mia', name: 'Mia', lang: 'en-US', gender: 'female' },
  { id: 'zac', name: 'Zac', lang: 'en-US', gender: 'male' },
  { id: 'zoe', name: 'Zoe', lang: 'en-US', gender: 'female' },
  
  // French voices (from documentation)
  { id: 'pierre', name: 'Pierre', lang: 'fr-FR', gender: 'male' },
  { id: 'amelie', name: 'Amelie', lang: 'fr-FR', gender: 'female' },
  { id: 'marie', name: 'Marie', lang: 'fr-FR', gender: 'female' },
  
  // German voices
  { id: 'jana', name: 'Jana', lang: 'de-DE', gender: 'female' },
  { id: 'thomas', name: 'Thomas', lang: 'de-DE', gender: 'male' },
  { id: 'max', name: 'Max', lang: 'de-DE', gender: 'male' },
  
  // Korean voices
  { id: '유나', name: '유나 (Yuna)', lang: 'ko-KR', gender: 'female' },
  { id: '준서', name: '준서 (Junseo)', lang: 'ko-KR', gender: 'male' },
  
  // Hindi voices
  { id: 'ऋतिका', name: 'ऋतिका (Ritika)', lang: 'hi-IN', gender: 'female' },
  
  // Mandarin voices
  { id: '长乐', name: '长乐 (Chang Le)', lang: 'zh-CN', gender: 'female' },
  { id: '白芷', name: '白芷 (Bai Zhi)', lang: 'zh-CN', gender: 'female' },
  
  // Spanish voices
  { id: 'javi', name: 'Javi', lang: 'es-ES', gender: 'male' },
  { id: 'sergio', name: 'Sergio', lang: 'es-ES', gender: 'male' },
  { id: 'maria', name: 'Maria', lang: 'es-ES', gender: 'female' },
  
  // Italian voices
  { id: 'pietro', name: 'Pietro', lang: 'it-IT', gender: 'male' },
  { id: 'giulia', name: 'Giulia', lang: 'it-IT', gender: 'female' },
  { id: 'carlo', name: 'Carlo', lang: 'it-IT', gender: 'male' }
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

// Define available emotive tags by language
type EmotiveTagsType = { [key: string]: string[] };

export const emotiveTags: EmotiveTagsType = {
  'en-US': ['laugh', 'chuckle', 'sigh', 'cough', 'sniffle', 'groan', 'yawn', 'gasp'],
  'fr-FR': ['chuckle', 'cough', 'gasp', 'groan', 'laugh', 'sigh', 'sniffle', 'whimper', 'yawn'],
  'de-DE': ['chuckle', 'cough', 'gasp', 'groan', 'laugh', 'sigh', 'sniffle', 'yawn'],
  'ko-KR': ['한숨', '헐', '헛기침', '훌쩍', '하품', '낄낄', '신음', '작은 웃음', '기침', '으르렁'],
  'zh-CN': ['嬉笑', '轻笑', '呻吟', '大笑', '咳嗽', '抽鼻子', '咳'],
  'es-ES': ['groan', 'chuckle', 'gasp', 'resoplido', 'laugh', 'yawn', 'cough'],
  'it-IT': ['sigh', 'laugh', 'cough', 'sniffle', 'groan', 'yawn', 'gemito', 'gasp'],
  'hi-IN': [] // No specific tags listed yet
};

// Helper to add emotional flavor to text where appropriate
const addEmotiveTagsToText = (text: string, language: string = 'en-US'): string => {
  // Get available tags for this language
  const languageKey = language as keyof typeof emotiveTags;
  const availableTags = emotiveTags[languageKey] || emotiveTags['en-US'];
  
  // For now, we'll just detect simple patterns that might benefit from emotive tags
  // A more sophisticated implementation could use AI to decide when to add emotional markers
  let enhancedText = text;
  
  // Only add tags if we have suitable content and language support
  if (availableTags && availableTags.length > 0) {
    // Look for patterns that might benefit from emotional enhancement
    const tags = Array.from(availableTags);
    
    if (/\bhaha\b|\bhehe\b|\blol\b|\bfunny\b|\bjoke\b|\blaugh\b/i.test(text) && tags.includes('laugh')) {
      enhancedText = `<laugh> ${enhancedText}`;
    }
    if (/\bsigh\b|\btired\b|\bexhausted\b|\bweary\b/i.test(text) && tags.includes('sigh')) {
      enhancedText = `<sigh> ${enhancedText}`;
    }
    if (/\bchuckle\b|\bamusing\b|\bsmile\b/i.test(text) && tags.includes('chuckle')) {
      enhancedText = `<chuckle> ${enhancedText}`;
    }
  }
  
  return enhancedText;
};

// Main TTS function - generates speech using Orpheus TTS via our API
export const speakText = async (
  text: string,
  voiceId: string = 'tara',
  speed: number = 1.0,
  addEmotiveTags: boolean = true
): Promise<void> => {
  console.log(`Speaking text with Orpheus voice ${voiceId}:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
  
  // Stop any current playback
  stopSpeech();
  
  if (text.trim().length === 0) {
    console.warn('Empty text provided, nothing to speak');
    return;
  }
  
  try {
    // Find the voice's language
    const voice = orpheusVoices.find(v => v.id === voiceId);
    const language = voice?.lang || 'en-US';
    
    // Add emotive tags if requested
    let processedText = text;
    if (addEmotiveTags) {
      processedText = addEmotiveTagsToText(text, language);
    }
    
    // Submit request to the Orpheus TTS API
    const response = await axios.post('/api/orpheus/generate', {
      text: processedText,
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