import { useEffect, useState } from 'react';
import { getAvailableVoices, VoiceOption, speakText } from '@/lib/text-to-speech';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlayIcon, Square } from 'lucide-react';

interface VoiceSelectorProps {
  onVoiceChange: (voiceId: string) => void;
  initialVoiceId?: string;
}

export function VoiceSelector({ onVoiceChange, initialVoiceId = 'default' }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(initialVoiceId);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Initialize voices
  useEffect(() => {
    const initializeVoices = () => {
      // Wait a moment to make sure voices are loaded
      setTimeout(() => {
        const availableVoices = getAvailableVoices();
        setVoices(availableVoices);
      }, 100);
    };

    // Load voices and set up event listener for voices changed
    initializeVoices();

    // Many browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = initializeVoices;
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // When voice changes, notify parent component
  useEffect(() => {
    onVoiceChange(selectedVoiceId);
  }, [selectedVoiceId, onVoiceChange]);

  // Test selected voice
  const handleTestVoice = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const testMessage = "Hello, this is a test of my voice. How do I sound?";
    speakText(testMessage, selectedVoiceId);
    
    // Listen for speech end
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const checkSpeaking = setInterval(() => {
        if (!synth.speaking) {
          setIsSpeaking(false);
          clearInterval(checkSpeaking);
        }
      }, 100);
    } else {
      // Fallback for browsers without proper event support
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-3">AI Voice Settings</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select a voice for the AI assistant. Different voices work better for different age groups.
      </p>
      
      <div className="flex flex-col gap-3">
        <Select 
          value={selectedVoiceId} 
          onValueChange={setSelectedVoiceId}
          disabled={voices.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Voice</SelectItem>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} ({voice.lang})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTestVoice}
          className="flex items-center justify-center gap-2"
          disabled={voices.length === 0}
        >
          {isSpeaking ? 
            <><Square className="h-4 w-4" /> Stop Test</> : 
            <><PlayIcon className="h-4 w-4" /> Test Voice</>
          }
        </Button>
      </div>
    </div>
  );
}
