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

      // Import the Google generative AI library
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      
      // Initialize the Google Generative AI client
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      
      // Use the updated model name
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Generate content using the new API
      const result = await model.generateContent(prompt, {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      });

      const response = await result.response;
      const generatedText = response.text() || "I'm sorry, I couldn't generate a response.";
      
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
