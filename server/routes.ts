import type { Express } from "express";
import { createServer, type Server } from "http";
// Remove storage import as it's not being used
// import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for generating responses using the Gemini API
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, apiKey } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt parameter' });
      }
      
      // Use the provided API key or fall back to environment variable
      const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        return res.status(400).json({ error: 'Missing API key' });
      }
      
      // Define API URL for Gemini
      const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`;
      
      // Prepare the request payload
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      // Make the API call to Gemini
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        return res.status(response.status).json({ 
          error: `Gemini API error: ${response.statusText}`,
          details: errorText
        });
      }
      
      const data = await response.json();
      
      // Extract the generated text from the response
      let generatedText = "I'm sorry, I couldn't generate a response.";
      
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0]) {
        generatedText = data.candidates[0].content.parts[0].text || generatedText;
      }
      
      // Send the response back to the client
      return res.json({ response: generatedText });
    } catch (error) {
      console.error('Error in /api/generate:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
