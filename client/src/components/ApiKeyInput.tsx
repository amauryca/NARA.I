import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
  initialApiKey?: string;
}

export function ApiKeyInput({ onApiKeyChange, initialApiKey = '' }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // When API key changes, notify parent component
  useEffect(() => {
    onApiKeyChange(apiKey);
  }, [apiKey, onApiKeyChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="api-key" className="text-sm font-medium">
        API Key (Optional)
      </Label>
      <div className="flex">
        <Input
          id="api-key"
          type={showApiKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="flex-1 rounded-r-none"
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-l-none border-l-0"
          onClick={() => setShowApiKey(!showApiKey)}
        >
          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Optional - the new TTS API is now free to use. API key may be required for future premium features.
      </p>
    </div>
  );
}
