import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Edge TTS API Key and Region
const EDGE_TTS_KEY = process.env.EDGE_TTS_KEY || 'your_edge_tts_key_here';
const EDGE_TTS_REGION = process.env.EDGE_TTS_REGION || 'eastus';

// Set up temp directory for audio files
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Helper function to synthesize speech
const synthesizeSpeech = (text: string, voiceName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a unique filename for this synthesis
      const fileName = `${uuidv4()}.wav`;
      const filePath = path.join(tempDir, fileName);
      
      // Configure speech configuration
      const speechConfig = sdk.SpeechConfig.fromSubscription(EDGE_TTS_KEY, EDGE_TTS_REGION);
      speechConfig.speechSynthesisVoiceName = voiceName;
      
      // Create audio config that pulls the data to a file
      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
      
      // Create the speech synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      
      // Start synthesis
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log(`Speech synthesized to ${filePath}`);
            // Clean up resources
            synthesizer.close();
            // Return the path to the generated file
            resolve(fileName);
          } else {
            const cancellation = sdk.CancellationDetails.fromResult(result);
            console.error(`Synthesis canceled: ${cancellation.reason}`);
            console.error(`Error details: ${cancellation.errorDetails}`);
            synthesizer.close();
            reject(new Error(`Synthesis failed: ${cancellation.errorDetails}`));
          }
        },
        (err) => {
          console.error(`Error synthesizing: ${err}`);
          synthesizer.close();
          reject(err);
        }
      );
    } catch (error) {
      console.error('Error in synthesizeSpeech:', error);
      reject(error);
    }
  });
};

// Generate TTS audio
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice, speed, client_id } = req.body;
    
    // Validate required parameters
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Get the voice name, or use default
    const voiceName = voice || 'en-US-AriaNeural';
    
    // Generate the speech file
    const fileName = await synthesizeSpeech(text, voiceName);
    
    // Generate URL for the audio file
    const audioUrl = `/api/edge-tts/audio/${fileName}`;
    
    // Return success response
    return res.json({
      success: true,
      audio_url: audioUrl,
      message: 'Audio generated successfully'
    });
  } catch (error) {
    console.error('Error generating speech with Edge TTS:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate speech. Internal server error.'
    });
  }
});

// Serve audio files
router.get('/audio/:fileName', (req: Request, res: Response) => {
  const fileName = req.params.fileName;
  const filePath = path.join(tempDir, fileName);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'audio/wav');
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ error: 'Audio file not found' });
  }
});

// Get available voices
router.get('/voices', (_req: Request, res: Response) => {
  // Return a list of supported voices
  return res.json({
    success: true,
    voices: [
      // English US
      { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US', gender: 'female' },
      { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'male' },
      { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'female' },
      { id: 'en-US-SaraNeural', name: 'Sara', language: 'en-US', gender: 'female' },
      { id: 'en-US-DavisNeural', name: 'Davis', language: 'en-US', gender: 'male' },
      { id: 'en-US-AmberNeural', name: 'Amber (Child)', language: 'en-US', gender: 'female' },
      { id: 'en-US-AndrewNeural', name: 'Andrew', language: 'en-US', gender: 'male' },
      { id: 'en-US-BrianNeural', name: 'Brian', language: 'en-US', gender: 'male' },
      
      // English GB
      { id: 'en-GB-LibbyNeural', name: 'Libby', language: 'en-GB', gender: 'female' },
      { id: 'en-GB-RyanNeural', name: 'Ryan', language: 'en-GB', gender: 'male' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB', gender: 'female' },
      
      // Other languages can be added as needed
    ]
  });
});

// Test a voice with sample text
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { voice } = req.body;
    
    if (!voice) {
      return res.status(400).json({ error: 'Voice ID is required' });
    }
    
    // Sample text for voice testing
    const testText = "Hello, this is a test of the voice synthesis system. How does my voice sound?";
    
    // Generate the speech file
    const fileName = await synthesizeSpeech(testText, voice);
    
    // Generate URL for the audio file
    const audioUrl = `/api/edge-tts/audio/${fileName}`;
    
    // Return success response
    return res.json({
      success: true,
      audio_url: audioUrl,
      message: 'Test audio generated successfully'
    });
  } catch (error) {
    console.error('Error testing voice with Edge TTS:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test voice. Internal server error.'
    });
  }
});

export default router;