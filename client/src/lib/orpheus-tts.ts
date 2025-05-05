// This file contains stubs for Orpheus text-to-speech functionality that has been removed

// Interface for voice options
export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// Empty voices array since TTS functionality has been removed
export const availableLanguages: { code: string; name: string }[] = [];
export const orpheusVoices: VoiceOption[] = [];

// Define empty emotive tags type and object
type EmotiveTagsType = { [key: string]: string[] };
export const emotiveTags: EmotiveTagsType = {};

// No-op stubs for TTS functions
export const getAvailableVoices = (_language?: string): VoiceOption[] => {
  console.warn('Text-to-speech functionality has been removed from this application.');
  return [];
};

export const stopSpeech = (): void => {
  console.warn('Text-to-speech functionality has been removed from this application.');
};

export const isSpeechActive = (): boolean => {
  return false;
};

export const speakText = async (
  _text: string,
  _voiceId?: string,
  _speed?: number,
  _addEmotiveTags?: boolean
): Promise<void> => {
  console.warn('Text-to-speech functionality has been removed from this application.');
};

export const getVoiceForAgeGroup = (_ageGroup: string, _language: string = 'en-US'): VoiceOption | null => {
  console.warn('Text-to-speech functionality has been removed from this application.');
  return null;
};