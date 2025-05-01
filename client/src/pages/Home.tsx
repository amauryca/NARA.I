import { Link } from "wouter";

export default function Home() {
  return (
    <section className="bg-[#D6F6F0] min-h-[90vh] flex items-center justify-center">
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">NARA.I: Empathy in Action</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Experience AI-driven emotional recognition and mental health support, designed to understand and respond to your emotional needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Emotion AI Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 text-center transition hover:shadow-lg">
            <div className="rounded-full bg-[#E0F7FA] w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Emotion Recognition</h2>
            <p className="mb-6 text-gray-600">
              Our AI analyses your facial expressions and voice to understand how you're feeling, providing compassionate responses.
            </p>
            <Link href="/emotion">
              <a className="inline-block bg-[#E0F7FA] hover:bg-[#E8F5E9] text-[#333333] font-semibold py-3 px-8 rounded-full transition">
                Start Emotion AI
              </a>
            </Link>
          </div>
          
          {/* Chatbot Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 text-center transition hover:shadow-lg">
            <div className="rounded-full bg-[#F3E5F5] w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Therapeutic Chatbot</h2>
            <p className="mb-6 text-gray-600">
              Have a conversation with our AI therapist designed to provide support, guidance, and a compassionate listening ear.
            </p>
            <Link href="/chatbot">
              <a className="inline-block bg-[#F3E5F5] hover:bg-[#C8E6C9] text-[#333333] font-semibold py-3 px-8 rounded-full transition">
                Open Chatbot
              </a>
            </Link>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            NARA.I processes all data locally in your browser. No information is stored or shared.
          </p>
        </div>
      </div>
    </section>
  );
}
