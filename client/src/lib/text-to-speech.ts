// text-to-speech.ts - Interface with image-upscaling.net API for advanced text-to-speech
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define available languages from the image-upscaling.net API
export const availableLanguages = [
  { code: 'en-US', name: 'American English' },
  { code: 'en-GB', name: 'British English' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Mandarin Chinese' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Brazilian Portuguese' }
];

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Define voice options based on image-upscaling.net TTS API
export const premiumVoices: VoiceOption[] = [
  // American voices (am_)
  { id: 'am_adam', name: 'Adam (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_echo', name: 'Echo (American)', lang: 'en-US', gender: 'female' },
  { id: 'am_eric', name: 'Eric (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_fenrir', name: 'Fenrir (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_liam', name: 'Liam (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_michael', name: 'Michael (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_onyx', name: 'Onyx (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_puck', name: 'Puck (American)', lang: 'en-US', gender: 'male' },
  { id: 'am_santa', name: 'Santa (American)', lang: 'en-US', gender: 'male' },
  
  // British voices (bf_ for female, bm_ for male)
  { id: 'bf_emma', name: 'Emma (British)', lang: 'en-GB', gender: 'female' },
  { id: 'bf_isabella', name: 'Isabella (British)', lang: 'en-GB', gender: 'female' },
  { id: 'bf_lily', name: 'Lily (British)', lang: 'en-GB', gender: 'female' },
  { id: 'bm_george', name: 'George (British)', lang: 'en-GB', gender: 'male' },
  { id: 'bm_lewis', name: 'Lewis (British)', lang: 'en-GB', gender: 'male' },
  
  // American female voices (af_)
  { id: 'af_alloy', name: 'Alloy (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_aoede', name: 'Aoede (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_bella', name: 'Bella (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_heart', name: 'Heart (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_jessica', name: 'Jessica (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_kore', name: 'Kore (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_nicole', name: 'Nicole (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_nova', name: 'Nova (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_river', name: 'River (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_sarah', name: 'Sarah (American)', lang: 'en-US', gender: 'female' },
  { id: 'af_sky', name: 'Sky (American)', lang: 'en-US', gender: 'female' }
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

// These functions are now implemented below

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

// Submit TTS request to the API based on the Python package docs
const submitTTSRequest = async (
  text: string,
  voiceId: string = 'af_heart', // Default voice
  speed: number = 1.0
): Promise<string | null> => {
  try {
    const clientId = getClientId();
    
    console.log(`Submitting TTS request with voice ${voiceId} for text:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
    
    // Use our server proxy endpoint to submit TTS request
    const response = await axios.post('/api/tts/submit', {
      client_id: clientId,
      text,
      voice: voiceId,
      speed
    });
    
    if (response.data && response.data.success) {
      console.log('TTS request submitted successfully:', response.data);
      return response.data.id; // Return request ID for status checking
    } else {
      console.error('API error in TTS submission:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Failed to submit TTS request:', error);
    return null;
  }
};

// Check status of TTS request and retrieve audio URL
const checkTTSStatus = async (clientId: string): Promise<any[]> => {
  try {
    // Use our server proxy endpoint to check status
    const response = await axios.get(`/api/tts/status`, {
      params: { client_id: clientId }
    });
    
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return [];
  } catch (error) {
    console.error('Failed to check TTS status:', error);
    return [];
  }
};

// Poll for TTS results until available
const pollForResults = async (requestId: string, maxAttempts = 12): Promise<string | null> => {
  const clientId = getClientId();
  let attempts = 0;
  
  // Recursive polling function
  const poll = async (): Promise<string | null> => {
    if (attempts >= maxAttempts) {
      console.warn(`Max polling attempts (${maxAttempts}) reached for TTS request ${requestId}`);
      return null;
    }
    
    attempts++;
    
    try {
      // Get current status of all requests
      const results = await checkTTSStatus(clientId);
      
      // Find our specific request
      const ourRequest = results.find((r: any) => r.id === requestId);
      
      if (ourRequest && ourRequest.output_url) {
        console.log(`TTS audio URL found on attempt ${attempts}:`, ourRequest.output_url);
        return ourRequest.output_url;
      }
      
      console.log(`TTS still processing, attempt ${attempts}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      return poll(); // Recursive call
    } catch (error) {
      console.error('Error during TTS polling:', error);
      return null;
    }
  };
  
  return poll();
};

// Main TTS function - tries the API first, falls back to browser TTS if needed
export const speakText = async (
  text: string,
  voiceId: string = 'af_heart',
  speed: number = 1.0
): Promise<void> => {
  console.log(`Speaking text with voice ${voiceId}:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
  
  // Stop any current playback
  stopSpeech();
  
  try {
    // Try the API first
    const requestId = await submitTTSRequest(text, voiceId, speed);
    
    if (!requestId) {
      console.warn('Failed to get TTS request ID, falling back to browser TTS');
      await useBrowserTTSWithVoice(text, voiceId, speed);
      return;
    }
    
    // Poll for results
    const audioUrl = await pollForResults(requestId);
    
    if (!audioUrl) {
      console.warn('Failed to get TTS audio URL, falling back to browser TTS');
      await useBrowserTTSWithVoice(text, voiceId, speed);
      return;
    }
    
    // Play the audio
    await playAudio(audioUrl);
  } catch (error) {
    console.error('TTS process failed:', error);
    
    // Fall back to browser TTS
    if (isSpeaking) { // Only if we haven't already stopped speech
      await useBrowserTTSWithVoice(text, voiceId, speed);
    }
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
  
  // Find specific voices by ID (for better matching)
  const americanFemaleVoices = voices.filter(v => v.id.startsWith('af_'));
  const americanMaleVoices = voices.filter(v => v.id.startsWith('am_'));
  const britishFemaleVoices = voices.filter(v => v.id.startsWith('bf_'));
  const britishMaleVoices = voices.filter(v => v.id.startsWith('bm_'));
  
  // Select based on age group and availability
  switch (ageGroup) {
    case 'child':
      // Specific child-friendly voices
      if (language === 'en-US') {
        const childVoice = premiumVoices.find(v => v.id === 'af_nova' || v.id === 'af_sky');
        if (childVoice) return childVoice;
        return americanFemaleVoices[0] || femaleVoices[0] || voices[0];
      } else if (language === 'en-GB') {
        return britishFemaleVoices[0] || femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'teen':
      // Teen-friendly voices
      if (language === 'en-US') {
        const teenVoice = premiumVoices.find(v => v.id === 'af_river' || v.id === 'af_nicole');
        if (teenVoice) return teenVoice;
        return americanFemaleVoices[0] || femaleVoices[0] || voices[0];
      } else if (language === 'en-GB') {
        return britishFemaleVoices[0] || femaleVoices[0] || voices[0];
      }
      return femaleVoices[0] || voices[0];
      
    case 'young':
      // Young adult voices
      if (language === 'en-US') {
        const youngVoice = premiumVoices.find(v => v.id === 'am_liam' || v.id === 'af_jessica');
        if (youngVoice) return youngVoice;
        return voices[0];
      } else if (language === 'en-GB') {
        return voices[0];
      }
      return voices[0];
      
    case 'adult':
      // Professional adult voices
      if (language === 'en-US') {
        const adultVoice = premiumVoices.find(v => v.id === 'am_michael' || v.id === 'am_adam');
        if (adultVoice) return adultVoice;
        return americanMaleVoices[0] || maleVoices[0] || voices[0];
      } else if (language === 'en-GB') {
        return britishMaleVoices[0] || maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    case 'senior':
      // Senior-appropriate voices
      if (language === 'en-GB') {
        const seniorVoice = premiumVoices.find(v => v.id === 'bm_george');
        if (seniorVoice) return seniorVoice;
        return britishMaleVoices[0] || maleVoices[0] || voices[0];
      } else if (language === 'en-US') {
        const seniorVoice = premiumVoices.find(v => v.id === 'am_santa');
        if (seniorVoice) return seniorVoice;
        return americanMaleVoices[0] || maleVoices[0] || voices[0];
      }
      return maleVoices[0] || voices[0];
      
    default:
      // Default to a neutral voice
      if (language === 'en-US') {
        const defaultVoice = premiumVoices.find(v => v.id === 'af_heart' || v.id === 'am_adam');
        if (defaultVoice) return defaultVoice;
      }
      return voices[0];
  }
};

// Check if speech is currently active
export const isSpeechActive = (): boolean => {
  return isSpeaking;
};
