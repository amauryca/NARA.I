import { useLocation, Link } from "wouter";

export default function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="shadow-sm bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-bold">
            NARA.I
          </Link>
          <div className="flex space-x-2 md:space-x-4">
            <Link href="/" className={`px-3 py-1.5 rounded-full text-sm transition hover:bg-gray-100 ${location === "/" ? "bg-gray-100" : ""}`}>
              Home
            </Link>
            <Link href="/emotion" className={`px-3 py-1.5 rounded-full text-sm transition hover:bg-gray-100 ${location === "/emotion" ? "bg-gray-100" : ""}`}>
              Emotion AI
            </Link>
            <Link href="/chatbot" className={`px-3 py-1.5 rounded-full text-sm transition hover:bg-gray-100 ${location === "/chatbot" ? "bg-gray-100" : ""}`}>
              Chatbot
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
