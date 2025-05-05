import { useEffect, useState } from 'react';
import { getAvailableVoices, VoiceOption, speakText, stopSpeech, isSpeechActive } from '@/lib/orpheus-tts';
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
  initialVoiceId = 'en_us_001' // Default to Aria voice
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

    // Get a test message based on the language
    const getTestMessageForLanguage = (language: string) => {
      switch (language) {
        case 'en-US':
        case 'en-GB':
          return "Hello, this is a test of my voice. How do I sound?";
        case 'fr-FR':
          return "Bonjour, ceci est un test de ma voix. Comment est-ce que je sonne?";
        case 'es-ES':
          return "Hola, esta es una prueba de mi voz. ¿Cómo sueno?";
        case 'de-DE':
          return "Hallo, dies ist ein Test meiner Stimme. Wie klinge ich?";
        case 'it-IT':
          return "Ciao, questo è un test della mia voce. Come suono?";
        case 'pt-BR':
          return "Olá, este é um teste da minha voz. Como eu soo?";
        case 'ja-JP':
          return "こんにちは、これは私の声のテストです。どのように聞こえますか？";
        case 'zh-CN':
          return "你好，这是我声音的测试。我的声音怎么样？";
        case 'ko-KR':
          return "안녕하세요, 이것은 제 목소리 테스트입니다. 어떻게 들리나요?";
        default:
          return "Hello, this is a test of my voice. How do I sound?";
      }
    };

    // Find the selected voice's language
    const selectedVoice = voices.find(v => v.id === selectedVoiceId);
    const language = selectedVoice?.lang || selectedLanguage;
    const testMessage = getTestMessageForLanguage(language);
    
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
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {voices.length === 0 ? (
              <SelectItem value="no_voices">No voices available</SelectItem>
            ) : (
              <>
                {/* Group female voices */}
                {voices.filter(v => v.gender === 'female').length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Female Voices
                  </div>
                )}
                {voices
                  .filter(voice => voice.gender === 'female')
                  .map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                
                {/* Group male voices */}
                {voices.filter(v => v.gender === 'male').length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Male Voices
                  </div>
                )}
                {voices
                  .filter(voice => voice.gender === 'male')
                  .map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                
                {/* Other voices without gender specification */}
                {voices.filter(v => !v.gender).length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Other Voices
                  </div>
                )}
                {voices
                  .filter(voice => !voice.gender)
                  .map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
              </>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Premium voices from Image-Upscaling.net (v2025.0.1)
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
