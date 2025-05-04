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

// Define voice options from image-upscaling.net (based on actual API voice IDs)
export const premiumVoices: VoiceOption[] = [
  // American English voices
  { id: 'en_us_001', name: 'Aria', lang: 'en-US', gender: 'female' },
  { id: 'en_us_002', name: 'Brandon', lang: 'en-US', gender: 'male' },
  { id: 'en_us_006', name: 'Harper', lang: 'en-US', gender: 'female' },
  { id: 'en_us_007', name: 'Mike', lang: 'en-US', gender: 'male' },
  { id: 'en_us_009', name: 'Joanna', lang: 'en-US', gender: 'female' },
  { id: 'en_us_010', name: 'Matthew', lang: 'en-US', gender: 'male' },
  { id: 'en_female_f08_salut_damour', name: 'Lily', lang: 'en-US', gender: 'female' },
  { id: 'en_male_m03_lobby', name: 'Thomas', lang: 'en-US', gender: 'male' },
  { id: 'en_female_f08_warmy_breeze', name: 'Emma', lang: 'en-US', gender: 'female' },
  { id: 'en_male_m03_sunshine_soon', name: 'William', lang: 'en-US', gender: 'male' },

  // British English voices
  { id: 'en_uk_001', name: 'Olivia', lang: 'en-GB', gender: 'female' },
  { id: 'en_uk_003', name: 'James', lang: 'en-GB', gender: 'male' },
  
  // Australian English voices
  { id: 'en_au_001', name: 'Charlotte', lang: 'en-GB', gender: 'female' },
  { id: 'en_au_002', name: 'Lucas', lang: 'en-GB', gender: 'male' },

  // French voices
  { id: 'fr_001', name: 'Sophie', lang: 'fr-FR', gender: 'female' },
  { id: 'fr_002', name: 'Louis', lang: 'fr-FR', gender: 'male' },
  
  // Spanish voices
  { id: 'es_002', name: 'Maria', lang: 'es-ES', gender: 'female' },
  { id: 'es_male_m_03', name: 'Carlos', lang: 'es-ES', gender: 'male' },
  
  // German voices
  { id: 'de_001', name: 'Anna', lang: 'de-DE', gender: 'female' },
  { id: 'de_002', name: 'Klaus', lang: 'de-DE', gender: 'male' },
  
  // Italian voices
  { id: 'it_male_m03_adventure', name: 'Marco', lang: 'it-IT', gender: 'male' },
  { id: 'it_female_f03_glorious', name: 'Giulia', lang: 'it-IT', gender: 'female' },
  
  // Japanese voices
  { id: 'jp_001', name: 'Hina', lang: 'ja-JP', gender: 'female' },
  { id: 'jp_006', name: 'Akira', lang: 'ja-JP', gender: 'male' },
  
  // Chinese voices
  { id: 'cn_female_shaoning', name: 'Mei', lang: 'zh-CN', gender: 'female' },
  { id: 'cn_male_xiaoming', name: 'Li', lang: 'zh-CN', gender: 'male' },
  
  // Korean voices
  { id: 'kr_002', name: 'Seoyeon', lang: 'ko-KR', gender: 'female' },
  { id: 'kr_004', name: 'Ji-Woo', lang: 'ko-KR', gender: 'male' },

  // Portuguese voices
  { id: 'br_001', name: 'Camila', lang: 'pt-BR', gender: 'female' },
  { id: 'br_003', name: 'Thiago', lang: 'pt-BR', gender: 'male' },
  
  // Polish voices
  { id: 'pl_male_m03_majestic', name: 'Piotr', lang: 'pl-PL', gender: 'male' },
  { id: 'pl_female_f03_vibrant', name: 'Ania', lang: 'pl-PL', gender: 'female' },
  
  // Turkish voices
  { id: 'tr_female_f03_melancholic', name: 'Zehra', lang: 'tr-TR', gender: 'female' },
  { id: 'tr_male_m03_brave', name: 'Mehmet', lang: 'tr-TR', gender: 'male' },
  
  // Russian voices
  { id: 'ru_008', name: 'Oksana', lang: 'ru-RU', gender: 'female' },
  { id: 'ru_006', name: 'Ivan', lang: 'ru-RU', gender: 'male' },
  
  // Dutch voices
  { id: 'nl_female_f03_tender', name: 'Lieke', lang: 'nl-NL', gender: 'female' },
  { id: 'nl_male_m03_modern', name: 'Luuk', lang: 'nl-NL', gender: 'male' },
  
  // Hindi voices
  { id: 'hi_female_f03_lovely', name: 'Priya', lang: 'hi-IN', gender: 'female' },
  { id: 'hi_male_m03_panoramic', name: 'Arjun', lang: 'hi-IN', gender: 'male' },
  
  // Arabic voices
  { id: 'ar_male_m03_balanced', name: 'Tarik', lang: 'ar-XA', gender: 'male' },
  { id: 'ar_female_f03_precise', name: 'Layla', lang: 'ar-XA', gender: 'female' }
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

// Use browser's built-in TTS as the primary method
const speakWithBrowserTTS = (
  text: string, 
  voiceId: string = 'default'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error('Browser text-to-speech not supported');
      reject(new Error('Browser text-to-speech not supported'));
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set up event handlers
    utterance.onend = () => {
      isSpeaking = false;
      resolve();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      isSpeaking = false;
      reject(new Error('Speech synthesis error'));
    };
    
    // Function to try speaking with a voice
    const trySpeak = (availableVoices: SpeechSynthesisVoice[]) => {
      // If a specific voice is requested, try to match it
      if (voiceId !== 'default') {
        // Get the premium voice with matching ID
        const selectedVoice = premiumVoices.find(v => v.id === voiceId);
        
        if (selectedVoice) {
          // Set up voice properties based on the selected voice
          let matched = false;
          
          // Get gender and language to help select a suitable browser voice
          const gender = selectedVoice.gender || '';
          const language = selectedVoice.lang;
          
          // Filter voices by exact language match
          let matchingVoices = availableVoices.filter(v => v.lang === language);
          
          // If no exact matches, try matching language family (e.g., 'en' instead of 'en-US')
          if (matchingVoices.length === 0) {
            const langPrefix = language.split('-')[0];
            matchingVoices = availableVoices.filter(v => v.lang.startsWith(langPrefix));
          }
          
          // If still no matches, use any available voice
          if (matchingVoices.length === 0) {
            matchingVoices = availableVoices;
          }
          
          // Choose a voice based on gender if possible
          let browserVoice: SpeechSynthesisVoice | undefined;
          
          if (gender === 'female') {
            // Try to find a female voice (often has 'female' in name or is not 'male')
            browserVoice = matchingVoices.find(v => 
              v.name.toLowerCase().includes('female') || 
              !v.name.toLowerCase().includes('male'));
          } else if (gender === 'male') {
            // Try to find a male voice
            browserVoice = matchingVoices.find(v => 
              v.name.toLowerCase().includes('male'));
          }
          
          // If we found a suitable voice, use it
          if (browserVoice) {
            utterance.voice = browserVoice;
            utterance.lang = browserVoice.lang;
            matched = true;
          }
          // If we didn't match by gender, use first available matching language
          else if (matchingVoices.length > 0) {
            utterance.voice = matchingVoices[0];
            utterance.lang = matchingVoices[0].lang;
            matched = true;
          }
          
          // Apply some pitch and rate adjustments based on gender for variety
          if (matched) {
            if (gender === 'female') {
              utterance.pitch = 1.1;  // Slightly higher pitch for female voices
              utterance.rate = 1.0;   // Normal rate
            } else if (gender === 'male') {
              utterance.pitch = 0.9;  // Slightly lower pitch for male voices
              utterance.rate = 0.95;  // Slightly slower rate
            }
          }
        }
      }
      
      // If we haven't set a voice yet, use default
      if (!utterance.voice && availableVoices.length > 0) {
        // Prefer English voices if available
        const englishVoice = availableVoices.find(v => 
          v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = englishVoice.lang;
        } else {
          // Use the first available voice
          utterance.voice = availableVoices[0];
          utterance.lang = availableVoices[0].lang;
        }
      }
      
      // Start speaking
      isSpeaking = true;
      synth.speak(utterance);
      console.log(`Speaking with browser voice: ${utterance.voice?.name || 'Default'} (${utterance.lang})`);
    };
    
    // Get available voices
    let voices = synth.getVoices();
    
    if (voices.length > 0) {
      trySpeak(voices);
    } else {
      // If voices aren't loaded yet, wait for them
      if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => {
          voices = synth.getVoices();
          trySpeak(voices);
        };
      } else {
        // If the browser doesn't support onvoiceschanged, just try with whatever is available
        trySpeak([]);
      }
    }
  });
};

// Legacy fallback function (simplified) for compatibility
const fallbackSpeakText = (text: string, voiceId: string = 'default'): void => {
  speakWithBrowserTTS(text, voiceId)
    .catch(error => console.error('Error in fallback speech:', error));
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
  voiceId: string = 'en_us_002', // Default to Brandon voice
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

// Main text-to-speech function (now using browser TTS as primary method since API has network issues)
export const speakText = async (
  text: string, 
  voiceId: string = 'en_us_002', // Voice ID (will be used for selecting appropriate browser voice)
  speed: number = 1.0
): Promise<void> => {
  // Stop any currently playing audio
  stopSpeech();
  
  try {
    // Use browser's built-in TTS (our improved version)
    await speakWithBrowserTTS(text, voiceId);
    return;
  } catch (error) {
    console.warn('Browser TTS failed, attempting API fallback:', error);
    
    // If browser TTS fails for some reason, try the API as fallback
    // This is unlikely to work due to network errors, but we keep it just in case
    try {
      isSpeaking = true;
      
      // Submit text to TTS API
      const requestId = await submitTextToApi(text, voiceId, speed);
      
      if (!requestId) {
        throw new Error('Failed to submit TTS request');
      }
      
      // Check if we already have this audio in cache
      if (audioCache[requestId] && Date.now() - audioCache[requestId].timestamp < 86400000) {
        // Cache is less than 24 hours old, use it
        playAudio(audioCache[requestId].url);
        return;
      }
      
      // Poll for results with shorter timeout
      const audioUrl = await pollForTtsResults(requestId, 5); // Reduced attempts for faster fallback
      
      if (audioUrl) {
        playAudio(audioUrl);
      } else {
        throw new Error('Failed to get TTS audio URL');
      }
    } catch (apiError) {
      console.error('Both browser TTS and API TTS failed:', apiError);
      // If we somehow get here (both methods failed), try one more time with system defaults
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
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
      // Try to find a friendly, higher-pitched voice for children
      if (language === 'en-US') {
        return voices.find(v => v.name === 'Lily' || v.name === 'Harper') || voices[0];
      }
      // Otherwise return a female voice if available
      return voices.find(v => v.gender === 'female') || voices[0];
    
    case 'teen':
      // Try to find a younger-sounding voice for teens
      if (language === 'en-US') {
        return voices.find(v => v.name === 'Emma' || v.name === 'Thomas') || voices[0];
      }
      // Mix of voices for teens
      return voices[Math.floor(Math.random() * voices.length)];
    
    case 'young':
      // Try to find an energetic voice for young adults
      if (language === 'en-US') {
        return voices.find(v => v.name === 'Brandon' || v.name === 'Aria') || voices[0];
      }
      // Otherwise randomly choose a voice
      return voices[Math.floor(Math.random() * voices.length)];
    
    case 'adult':
      // Default neutral voice for adults
      if (language === 'en-US') {
        return voices.find(v => v.name === 'Matthew' || v.name === 'Joanna') || voices[0];
      }
      // Prefer male voices for adults if available
      return voices.find(v => v.gender === 'male') || voices[0];
    
    case 'senior':
      // Try to find a more mature voice for seniors
      if (language === 'en-GB') { // British accent for seniors
        return voices.find(v => v.name === 'James' || v.name === 'Olivia') || voices[0];
      }
      if (language === 'en-US') {
        return voices.find(v => v.name === 'William' || v.name === 'Joanna') || voices[0];
      }
      // Otherwise use first available voice
      return voices[0];
    
    default:
      // Fallback to first available voice
      return voices[0];
  }
};

// Check if speech is currently active
export const isSpeechActive = (): boolean => {
  return isSpeaking;
};
