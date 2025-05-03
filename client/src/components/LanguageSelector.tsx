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
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {/* Group by language regions */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            European Languages
          </div>
          {availableLanguages
            .filter(lang => ['en-US', 'en-GB', 'fr-FR', 'es-ES', 'de-DE', 'it-IT', 'pt-BR', 'pl-PL', 'nl-NL', 'ru-RU', 'tr-TR'].includes(lang.code))
            .map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
            
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
            Asian Languages
          </div>
          {availableLanguages
            .filter(lang => ['ja-JP', 'zh-CN', 'ko-KR', 'hi-IN'].includes(lang.code))
            .map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
            
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
            Middle Eastern Languages
          </div>
          {availableLanguages
            .filter(lang => ['ar-XA'].includes(lang.code))
            .map((language) => (
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
