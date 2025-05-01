import { useState, useRef, useEffect } from "react";
import { generateGeminiResponse } from "@/lib/gemini-api";

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
      `;
      
      // Generate response from Gemini
      const botResponse = await generateGeminiResponse(prompt);
      
      // Add bot message
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(botResponse);
        speechSynthesis.speak(utterance);
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

  return (
    <section className="bg-[#F3E5F5] min-h-[90vh]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Therapeutic Chatbot</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Chat with our AI therapist for support, guidance, and a compassionate conversation.
          </p>
        </div>
        
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
    </section>
  );
}
