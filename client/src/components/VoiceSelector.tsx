import { useEffect } from 'react';
import { VoiceOption } from '@/lib/orpheus-tts';
import { Label } from '@/components/ui/label';

interface VoiceSelectorProps {
  onVoiceChange: (voiceId: string) => void;
  selectedLanguage: string;
  initialVoiceId?: string;
}

export function VoiceSelector({ 
  onVoiceChange, 
  selectedLanguage, 
  initialVoiceId = '' 
}: VoiceSelectorProps) {
  // Just inform the parent component of the default empty voice ID
  useEffect(() => {
    onVoiceChange(initialVoiceId);
  }, [initialVoiceId, onVoiceChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground italic">
          Text-to-speech functionality has been removed from this application.
        </Label>
      </div>
    </div>
  );
}
