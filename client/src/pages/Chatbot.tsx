import { useState, useRef, useEffect } from "react";
import { generateResponseWithCrisisDetection, detectCrisisContent } from "@/lib/gemini-api";
import { speakText, stopSpeech, isSpeechActive, getVoiceForAgeGroup, initVoices } from "@/lib/web-speech-tts";
import { Settings, Volume2, VolumeX } from "lucide-react";
import { AgeGroupSelector } from "@/components/AgeGroupSelector";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { LanguageSelector } from "@/components/LanguageSelector";
import { VoiceSelector } from "@/components/VoiceSelector";
import { AgeGroup } from "@shared/types/index";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import EmergencyResources from "@/components/EmergencyResources";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hello, I'm NARA, your AI therapeutic assistant. How are you feeling today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(AgeGroup.ADULT);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedVoice, setSelectedVoice] = useState("tara");
  const [crisisSeverity, setCrisisSeverity] = useState<'severe' | 'moderate' | null>(null);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Adding a slight delay allows the DOM to update before scrolling
      const timer = setTimeout(() => {
        // Instead of scrolling the entire page, only scroll the chat container
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Initialize TTS and focus on input when component loads
  useEffect(() => {
    // Initialize the TTS voices
    initVoices().then(success => {
      if (success) {
        console.log('TTS voices initialized successfully in Chatbot');
      } else {
        console.warn('Failed to initialize TTS voices in Chatbot');
      }
    });
    
    // Focus on input field
    const inputElement = document.getElementById("chatInput");
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  // Function to validate user input for potential jailbreak attempts
  const validateInput = (input: string): boolean => {
    const jailbreakPatterns = [
      /ignore( all)? (previous|prior|above|earlier) instructions/i,
      /ignore( all)? (constraints|rules|guidelines)/i,
      /bypass (restrictions|filters|limitations|constraints)/i,
      /disregard (previous|prior|above) (instructions|constraints|limitations)/i,
      /you are (now |)(a|an) .{1,30}(\.|$)/i,
      /act as (a|an) .{1,30}(\.|$)/i,
      /you are not (a|an) (AI|artificial intelligence|language model|assistant)/i,
      /pretend (that )?(you are|you're|to be) .{1,30}(\.|$)/i,
      /\[(DAN|STAN|JAILBREAK|SYSTEM|ADMIN)\]/i,
      /\bDAN\b/i,
      /\bSTAN\b/i,
      /\bJAILBREAK(ED|ING)?\b/i,
      /dev(eloper)? mode/i,
      /\bSYSTEM (PROMPT|MESSAGE|INSTRUCTION)\b/i,
      /\bADMIN (PROMPT|MESSAGE|INSTRUCTION)\b/i,
      /write as if you (are human|were human)/i,
      /forget (all your|your|all) (training|programming|instructions|limitations)/i,
      /escape your (programming|instructions|rules)/i
    ];

    // Return true if input is safe, false if potential jailbreak attempt
    return !jailbreakPatterns.some(pattern => pattern.test(input));
  };
  
  // Handle text-to-speech for bot responses
  const speakBotResponse = (text: string) => {
    if (voiceEnabled && text) {
      // Stop any currently playing speech
      stopSpeech();
      
      // If user has selected a specific voice, use it. Otherwise, use age-appropriate voice
      const voice = selectedVoice || getVoiceForAgeGroup(selectedAgeGroup, selectedLanguage)?.id || 'tara';
      
      console.log(`Speaking with voice: ${voice} (language: ${selectedLanguage})`);
      speakText(text, voice);
    }
  };
  
  // Toggle text-to-speech functionality
  const toggleVoice = () => {
    if (isSpeechActive()) {
      stopSpeech();
    }
    setVoiceEnabled(!voiceEnabled);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Save the current scroll position
    const chatContainer = chatContainerRef.current;
    const wasAtBottom = chatContainer ? 
      chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 50 : true;
    
    // Validate the input for security
    if (!validateInput(inputText)) {
      // Add a system message about invalid input
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "I'm here to provide therapeutic support within my guidelines. Let's focus on how I can help you with your emotional well-being.",
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, {
        id: (Date.now() - 1).toString(),
        text: inputText,
        sender: "user",
        timestamp: new Date()
      }, systemMessage]);
      
      setInputText("");
      
      // Only auto-scroll if we were already at the bottom
      if (!wasAtBottom && chatContainer) {
        // Prevent auto-scrolling by restoring previous position after a brief delay
        setTimeout(() => {
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;
          }
        }, 150);
      }
      
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    // Only auto-scroll if we were already at the bottom
    if (!wasAtBottom && chatContainer) {
      // Prevent auto-scrolling by restoring previous position after a brief delay
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;
        }
      }, 150);
    }
    
    try {
      // Create a prompt for Gemini that includes conversation history
      const conversationHistory = messages
        .map(msg => `${msg.sender === "user" ? "User" : "NARA"}: ${msg.text}`)
        .join("\n");
      
      const prompt = `
        You are NARA, a compassionate AI therapeutic assistant. Respond to the user's message.
        
        Conversation history:
        ${conversationHistory}
        
        User: ${inputText}
        
        Provide a thoughtful, supportive response as NARA. Be conversational, warm, and helpful.
        Respond in the first person as if you are NARA. Keep your response very brief (2-3 sentences max).

        Keep your tone therapeutic but natural and conversational, not clinical or distant.
        If the user mentions self-harm, suicide, or other concerning content, provide a compassionate and supportive response that acknowledges their pain but encourages them to seek professional help.
      `;
      
      // Check for crisis content in the user's message
      const detectedCrisis = detectCrisisContent(inputText);
      if (detectedCrisis) {
        setCrisisSeverity(detectedCrisis);
        setShowEmergencyResources(true);
      }
      
      // Generate response from Gemini with age-appropriate context
      const response = await generateResponseWithCrisisDetection(prompt, selectedAgeGroup);
      
      // Add bot message
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the bot response if TTS is enabled
      speakBotResponse(response.response);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle closing the emergency resources panel
  const handleCloseEmergencyResources = () => {
    setShowEmergencyResources(false);
  };

  return (
    <section className="bg-[#F3E5F5] min-h-[90vh]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">Therapeutic Chatbot</h1>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings size={18} />
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
        </div>
        
        <p className="text-lg max-w-2xl mb-4">
          Chat with our AI therapist for support, guidance, and a compassionate conversation.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-700">
            <strong>New!</strong> Enhanced text-to-speech functionality is now available with your browser's built-in speech synthesis! Enable voice in settings to hear responses spoken aloud. Try the new voice test feature to hear how each voice sounds before selecting it.
          </p>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">AI Assistant Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AgeGroupSelector 
                onAgeGroupChange={setSelectedAgeGroup} 
                initialAgeGroup={selectedAgeGroup}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Text-to-Speech</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    <span>Voice Output</span>
                  </div>
                  <Switch 
                    checked={voiceEnabled} 
                    onCheckedChange={toggleVoice}
                  />
                </div>
                
                {voiceEnabled && (
                  <div className="space-y-4">
                    <LanguageSelector 
                      onLanguageChange={setSelectedLanguage}
                      initialLanguage={selectedLanguage}
                    />
                    
                    <VoiceSelector 
                      onVoiceChange={setSelectedVoice}
                      selectedLanguage={selectedLanguage}
                      initialVoiceId={selectedVoice}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Chat Messages Container */}
          <div 
            ref={chatContainerRef}
            className="p-4 md:p-6 h-[50vh] overflow-y-auto"
          >
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`chat-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                {message.text}
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-bubble bot-bubble animate-pulse">
                <span>Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input Form */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                id="chatInput"
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 rounded-full border border-[#C8E6C9] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8E6C9]"
                aria-label="Chat message input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="bg-[#F3E5F5] hover:bg-[#C8E6C9] text-[#333333] font-semibold p-2.5 rounded-full transition disabled:opacity-50 flex items-center justify-center w-10 h-10"
                aria-label="Send message"
                disabled={isLoading || !inputText.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This chatbot uses AI for conversational support. It is not a replacement for professional mental health services.
          </p>
        </div>
      </div>
      
      {/* Emergency Resources */}
      <EmergencyResources 
        show={showEmergencyResources}
        onClose={handleCloseEmergencyResources}
        severity={crisisSeverity || 'moderate'}
      />
    </section>
  );
}
