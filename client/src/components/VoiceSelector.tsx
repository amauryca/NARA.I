import { useEffect, useState } from 'react';
import { VoiceOption, getAvailableVoices, testVoice, initVoices } from '@/lib/web-speech-tts';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceSelectorProps {
  onVoiceChange: (voiceId: string) => void;
  selectedLanguage: string;
  initialVoiceId?: string;
}

export function VoiceSelector({ 
  onVoiceChange, 
  selectedLanguage, 
  initialVoiceId = 'tara' 
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  
  // Initialize voices when component mounts
  useEffect(() => {
    const initializeVoices = async () => {
      await initVoices();
      const availableVoices = getAvailableVoices(selectedLanguage);
      setVoices(availableVoices);
      
      if (availableVoices.length > 0) {
        // Check if the initial voice is available
        const initialVoiceExists = initialVoiceId && availableVoices.some(v => v.id === initialVoiceId);
        
        // Use initial voice or default to first available
        onVoiceChange(initialVoiceExists ? initialVoiceId : availableVoices[0].id);
      }
    };
    
    initializeVoices();
    // This effect doesn't need to re-run since it's only for initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update voices when language changes
  useEffect(() => {
    const availableVoices = getAvailableVoices(selectedLanguage);
    setVoices(availableVoices);
    
    // If no initial voice ID provided or if it's not available for this language,
    // default to first available voice for this language
    if ((!initialVoiceId || !availableVoices.find(v => v.id === initialVoiceId)) && availableVoices.length > 0) {
      onVoiceChange(availableVoices[0].id);
    } else if (initialVoiceId) {
      onVoiceChange(initialVoiceId);
    }
  }, [selectedLanguage, initialVoiceId, onVoiceChange]);

  const handleVoiceChange = (value: string) => {
    onVoiceChange(value);
  };
  
  // Function to test the currently selected voice
  const handleTestVoice = () => {
    // Use either the selected voice or default to the first available
    const currentSelectedVoice = initialVoiceId || (voices.length > 0 ? voices[0].id : 'en-US-AriaNeural');
    testVoice(currentSelectedVoice);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="voice-select" className="text-sm font-medium">
            Voice
          </Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestVoice}
            className="flex items-center gap-1"
            title="Test this voice"
          >
            <Volume2 size={16} />
            <span>Test</span>
          </Button>
        </div>
        
        {voices.length > 0 ? (
          <Select 
            defaultValue={initialVoiceId} 
            onValueChange={handleVoiceChange}
          >
            <SelectTrigger id="voice-select" className="w-full">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} {voice.gender ? `(${voice.gender})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Label className="text-sm italic text-muted-foreground">
            No voices available for this language
          </Label>
        )}
      </div>
    </div>
  );
}
