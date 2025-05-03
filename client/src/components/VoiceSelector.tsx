import { useEffect, useState } from 'react';
import { getAvailableVoices, VoiceOption, speakText, stopSpeech, isSpeechActive } from '@/lib/text-to-speech';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlayIcon, Square } from 'lucide-react';

interface VoiceSelectorProps {
  onVoiceChange: (voiceId: string) => void;
  selectedLanguage: string;
  initialVoiceId?: string;
}

export function VoiceSelector({ 
  onVoiceChange, 
  selectedLanguage, 
  initialVoiceId = 'af_bella'
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(initialVoiceId);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Update voices when language changes
  useEffect(() => {
    const availableVoices = getAvailableVoices(selectedLanguage);
    setVoices(availableVoices);
    
    // If there's no voice for this language or the current voice isn't in this language,
    // select the first available voice for this language
    if (availableVoices.length > 0) {
      const currentVoiceInLanguage = availableVoices.find(v => v.id === selectedVoiceId);
      if (!currentVoiceInLanguage) {
        setSelectedVoiceId(availableVoices[0].id);
      }
    }
  }, [selectedLanguage, selectedVoiceId]);

  // When voice changes, notify parent component
  useEffect(() => {
    onVoiceChange(selectedVoiceId);
  }, [selectedVoiceId, onVoiceChange]);

  // Update speaking state
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      setIsSpeaking(isSpeechActive());
    }, 300);
    
    return () => clearInterval(checkSpeakingInterval);
  }, []);

  // Test selected voice
  const handleTestVoice = async () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const testMessage = "Hello, this is a test of my voice. How do I sound?";
    try {
      await speakText(testMessage, selectedVoiceId, 1.0);
    } catch (error) {
      console.error('Voice test failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select" className="text-sm font-medium">
          Voice
        </Label>
        <Select 
          value={selectedVoiceId} 
          onValueChange={setSelectedVoiceId}
          disabled={voices.length === 0}
        >
          <SelectTrigger id="voice-select" className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.length === 0 ? (
              <SelectItem value="no_voices">No voices available</SelectItem>
            ) : (
              voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} {voice.gender ? `(${voice.gender})` : ''}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Premium voices from the Image-Upscaling.net API
        </p>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleTestVoice}
        className="flex items-center justify-center gap-2 w-full"
        disabled={voices.length === 0}
      >
        {isSpeaking ? 
          <><Square className="h-4 w-4" /> Stop Test</> : 
          <><PlayIcon className="h-4 w-4" /> Test Voice</>
        }
      </Button>
    </div>
  );
}
