// gemini-api.ts - Interface with Google's Gemini API

// Gemini API Key
// Use import.meta.env for client-side environment variables in Vite
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAkFJjQBTAoAHfxG9mtQbqr70njMip4lpQ';

// Function to generate a response from Gemini API via our backend proxy
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    // Make API request to backend proxy
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        apiKey: GEMINI_API_KEY 
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
