import { useEffect, useState } from 'react';
import { VoiceOption, getAvailableVoices } from '@/lib/kokoro-tts';
import { Label } from '@/components/ui/label';
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
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select" className="text-sm font-medium">
          Voice
        </Label>
        
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
