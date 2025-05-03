import { useState, useEffect } from 'react';
import { availableLanguages } from '@/lib/text-to-speech';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LanguageSelectorProps {
  onLanguageChange: (languageCode: string) => void;
  initialLanguage?: string;
}

export function LanguageSelector({ onLanguageChange, initialLanguage = 'en-US' }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);

  // When language changes, notify parent component
  useEffect(() => {
    onLanguageChange(selectedLanguage);
  }, [selectedLanguage, onLanguageChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select" className="text-sm font-medium">
        Language
      </Label>
      <Select 
        value={selectedLanguage} 
        onValueChange={setSelectedLanguage}
      >
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        Select the language for the AI voice
      </p>
    </div>
  );
}
