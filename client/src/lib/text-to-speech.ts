// text-to-speech.ts - Interface with Web Speech API for text-to-speech

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Get all available voices
export const getAvailableVoices = (): VoiceOption[] => {
  if (!('speechSynthesis' in window)) {
    console.error('Text-to-speech not supported in this browser');
    return [];
  }
  
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  return voices.map((voice, index) => ({
    id: String(index),
    name: voice.name,
    lang: voice.lang,
    gender: voice.name.includes('Female') ? 'female' : voice.name.includes('Male') ? 'male' : undefined
  }));
};

// Speak text aloud
export const speakText = (
  text: string, 
  voiceId: string = 'default',
  rate: number = 1.0,
  pitch: number = 1.0,
  volume: number = 1.0
): void => {
  if (!('speechSynthesis' in window)) {
    console.error('Text-to-speech not supported in this browser');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set speech properties
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  
  // If a specific voice is requested, try to use it
  if (voiceId !== 'default') {
    const voices = synth.getVoices();
    const voiceIndex = parseInt(voiceId, 10);
    
    if (!isNaN(voiceIndex) && voiceIndex >= 0 && voiceIndex < voices.length) {
      utterance.voice = voices[voiceIndex];
    }
  }
  
  // Start speaking
  synth.speak(utterance);
};

// Get voice options suitable for different age groups
export const getVoiceForAgeGroup = (ageGroup: string): VoiceOption | null => {
  const voices = getAvailableVoices();
  
  // No voices available
  if (voices.length === 0) return null;
  
  // Return a different voice based on age group if possible
  switch (ageGroup) {
    case 'child':
      // Try to find a friendly-sounding, higher-pitched voice
      return voices.find(v => v.gender === 'female' && v.lang.startsWith('en')) || voices[0];
    
    case 'teen':
      // Try to find a younger-sounding voice
      return voices.find(v => v.name.includes('Young') || v.name.includes('Girl') || v.name.includes('Boy')) || voices[0];
    
    case 'young':
      // Try to find an energetic voice
      return voices.find(v => v.gender === 'female' && v.lang.startsWith('en')) || voices[0];
    
    case 'adult':
      // Default neutral voice
      return voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    case 'senior':
      // Try to find a more mature voice
      return voices.find(v => (v.gender === 'male' && v.lang.startsWith('en'))) || voices[0];
    
    default:
      // Fallback to first available voice
      return voices[0];
  }
};
