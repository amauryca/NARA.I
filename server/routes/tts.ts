import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// The URL to the Kokoro-FastAPI service
const KOKORO_API_URL = process.env.KOKORO_API_URL || 'https://api.example.com/kokoro-tts';

// Proxy route for TTS generation
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice, speed, client_id } = req.body;
    
    // Validate required parameters
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Make request to Kokoro TTS API
    const response = await axios.post(`${KOKORO_API_URL}/api/tts/generate`, {
      text,
      voice: voice || 'tara',
      speed: speed || 1.0,
      client_id: client_id || 'anonymous'
    });
    
    // Return the audio URL or data to the client
    return res.json({
      success: true,
      audio_url: response.data.audio_url || response.data.url,
      duration: response.data.duration,
      message: 'Audio generated successfully'
    });
  } catch (error) {
    console.error('Error generating TTS via Kokoro API:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: `Kokoro TTS API error: ${error.response.data.detail || error.response.statusText}`
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate speech. Internal server error.'
    });
  }
});

// Get available voice models from Kokoro API
router.get('/voices', async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${KOKORO_API_URL}/api/tts/voices`);
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching voices from Kokoro API:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch voice options'
    });
  }
});

export default router;
