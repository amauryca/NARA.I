import type { Express } from "express";
import { createServer, type Server } from "http";
// Remove storage import as it's not being used
// import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for generating responses using the Gemini API
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, apiKey, ageGroup } = req.body;
      
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
      
      // Prepare a context based on the age group
      let contextPrompt = prompt;
      
      if (ageGroup) {
        // Add age-appropriate context to the prompt
        switch (ageGroup) {
          case 'child':
            contextPrompt = `You are speaking to a child (5-12 years old). Use simple vocabulary, short sentences, and be encouraging. Explain concepts in a fun, engaging way using examples they can relate to. Avoid complex topics and be friendly and nurturing. Here's what they said: "${prompt}"`;
            break;
          case 'teen':
            contextPrompt = `You are speaking to a teenager (13-17 years old). Use relatable language but don't try too hard to be cool. Be supportive and provide guidance without being condescending. Acknowledge their growing independence while still providing clear explanations. Here's what they said: "${prompt}"`;
            break;
          case 'young':
            contextPrompt = `You are speaking to a young adult (18-25 years old). Be conversational and relatable. You can use contemporary references and a more casual tone. Provide thoughtful insights while respecting their autonomy and intelligence. Here's what they said: "${prompt}"`;
            break;
          case 'adult':
            contextPrompt = `You are speaking to an adult (26-59 years old). Use a balanced, mature tone. Be straightforward and provide comprehensive information. You can discuss complex topics and use professional language. Here's what they said: "${prompt}"`;
            break;
          case 'senior':
            contextPrompt = `You are speaking to a senior (60+ years old). Be clear and respectful, not condescending. Use a slightly slower pace, avoid unnecessary jargon, and provide context for technical terms. Be patient and thorough in your explanations. Here's what they said: "${prompt}"`;
            break;
          default:
            // Use the original prompt if age group is not recognized
            break;
        }
      }
      
      console.log(`Generating response for age group: ${ageGroup || 'default'}`);
      
      // Generate content using the new API with age-appropriate context
      const result = await model.generateContent(contextPrompt);

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
