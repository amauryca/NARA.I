import { useEffect, useState } from 'react';
import { VoiceOption, getAvailableVoices } from '@/lib/edge-tts';
import { testVoice } from '@/lib/edge-tts';
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
  
  // Get available voices for the selected language
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
