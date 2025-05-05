import { useEffect } from 'react';
import { Label } from '@/components/ui/label';

interface LanguageSelectorProps {
  onLanguageChange: (languageCode: string) => void;
  initialLanguage?: string;
}

export function LanguageSelector({ onLanguageChange, initialLanguage = 'en-US' }: LanguageSelectorProps) {
  // Just inform the parent component of the default language
  useEffect(() => {
    onLanguageChange(initialLanguage);
  }, [initialLanguage, onLanguageChange]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground italic">
        Text-to-speech language options have been removed from this application.
      </Label>
    </div>
  );
}
