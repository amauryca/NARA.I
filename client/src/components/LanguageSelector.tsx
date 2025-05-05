import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableLanguages } from '@/lib/web-speech-tts';

interface LanguageSelectorProps {
  onLanguageChange: (languageCode: string) => void;
  initialLanguage?: string;
}

export function LanguageSelector({ onLanguageChange, initialLanguage = 'en-US' }: LanguageSelectorProps) {
  // Inform the parent component of the language selection on initial render
  useEffect(() => {
    onLanguageChange(initialLanguage);
  }, [initialLanguage, onLanguageChange]);

  // Handle language change
  const handleLanguageChange = (value: string) => {
    onLanguageChange(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select" className="text-sm font-medium">
        Language
      </Label>
      
      <Select 
        defaultValue={initialLanguage} 
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
