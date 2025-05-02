// gemini-api.ts - Interface with Google's Gemini API

// Gemini API Key
// Use import.meta.env for client-side environment variables in Vite
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAkFJjQBTAoAHfxG9mtQbqr70njMip4lpQ';

// Crisis detection patterns
const CRISIS_PATTERNS = {
  severe: [
    /(?:i('m| am)\s+(?:going\s+to|planning\s+to)\s+(?:kill|hurt|harm)\s+(?:myself|me))/i,
    /(?:i\s+want\s+to\s+(?:die|end\s+(?:my\s+life|it\s+all)))/i,
    /(?:i('m| am)\s+(?:about|going)\s+to\s+commit\s+suicide)/i,
    /(?:i('m| am)\s+ready\s+to\s+(?:die|end\s+it))/i,
    /(?:i\s+(?:have|('ve| have)\s+prepared)\s+(?:a|my)\s+suicide\s+(?:note|plan))/i,
    /(?:this\s+is\s+(?:my\s+)?(?:last|final)\s+(?:message|goodbye|words))/i,
  ],
  moderate: [
    /(?:i\s+(?:sometimes|often|frequently)\s+think\s+about\s+(?:dying|suicide|killing\s+myself))/i,
    /(?:i('m| am)\s+(?:feeling|thinking\s+about)\s+(?:suicide|killing\s+myself))/i,
    /(?:i\s+(?:feel|don't\s+want)\s+(?:to\s+live|to\s+be\s+alive|like\s+living))/i,
    /(?:life\s+is\s+not\s+worth\s+living)/i,
    /(?:i\s+(?:can't|cannot)\s+(?:do\s+this|go\s+on|take\s+it|handle\s+it)\s+(?:any\s*more|any\s*longer))/i,
    /(?:i\s+(?:hate|loathe)\s+(?:myself|my\s+life))/i,
    /(?:nobody\s+would\s+(?:miss|care\s+about)\s+me)/i,
    /(?:i('m| am)\s+a\s+burden\s+to\s+(?:everyone|anybody))/i,
    /(?:i\s+wish\s+i\s+(?:wasn't|were\s+not)\s+(?:alive|here|born))/i,
  ]
};

// Function to detect crisis content and its severity
export const detectCrisisContent = (text: string): 'severe' | 'moderate' | null => {
  for (const pattern of CRISIS_PATTERNS.severe) {
    if (pattern.test(text)) {
      return 'severe';
    }
  }
  
  for (const pattern of CRISIS_PATTERNS.moderate) {
    if (pattern.test(text)) {
      return 'moderate';
    }
  }
  
  return null;
};

// Response interface
export interface GeminiResponse {
  response: string;
  crisisSeverity?: 'severe' | 'moderate' | null;
}

// Function to generate a response from Gemini API via our backend proxy
export const generateGeminiResponse = async (prompt: string, ageGroup?: string): Promise<string> => {
  try {
    // Make API request to backend proxy
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        apiKey: GEMINI_API_KEY,
        ageGroup
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error from Gemini API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw error;
  }
};

// Function to generate a response with crisis detection
export const generateResponseWithCrisisDetection = async (prompt: string, ageGroup?: string): Promise<GeminiResponse> => {
  const crisisSeverity = detectCrisisContent(prompt);
  const response = await generateGeminiResponse(prompt, ageGroup);
  
  return {
    response,
    crisisSeverity
  };
};
