import { useState, useRef, useEffect } from "react";
import { generateResponseWithCrisisDetection, detectCrisisContent } from "@/lib/gemini-api";
import { speakText } from "@/lib/text-to-speech";
import { Settings } from "lucide-react";
import { AgeGroupSelector } from "@/components/AgeGroupSelector";
import { VoiceSelector } from "@/components/VoiceSelector";
import { AgeGroup } from "@shared/types/index";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('default');
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState<boolean>(true);
  const [crisisSeverity, setCrisisSeverity] = useState<'severe' | 'moderate' | null>(null);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus on input when component loads
  useEffect(() => {
    const inputElement = document.getElementById("chatInput");
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
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
        Respond in the first person as if you are NARA. Keep your response concise (2-3 sentences).

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
      
      // Speak the response using our custom text-to-speech functionality
      if (textToSpeechEnabled) {
        speakText(response.response, selectedVoiceId);
      }
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
        
        <p className="text-lg max-w-2xl mb-6">
          Chat with our AI therapist for support, guidance, and a compassionate conversation.
        </p>
        
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
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-3">Voice Settings</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="text-to-speech"
                      checked={textToSpeechEnabled}
                      onCheckedChange={setTextToSpeechEnabled}
                    />
                    <Label htmlFor="text-to-speech">Enable Text-to-Speech</Label>
                  </div>
                  
                  {textToSpeechEnabled && (
                    <VoiceSelector
                      onVoiceChange={setSelectedVoiceId}
                      initialVoiceId={selectedVoiceId}
                    />
                  )}
                </div>
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
                className="bg-[#F3E5F5] hover:bg-[#C8E6C9] text-[#333333] font-semibold px-6 py-2.5 rounded-full transition disabled:opacity-50"
                aria-label="Send message"
                disabled={isLoading || !inputText.trim()}
              >
                Send
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
