import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import Logo from "./Logo";

export default function Navigation() {
  const [location] = useLocation();
  
  return (
    <motion.nav 
      className="shadow-sm bg-white sticky top-0 z-10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/">
            <a className="cursor-pointer">
              <Logo />
            </a>
          </Link>
          
          <div className="flex space-x-2 md:space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/">
                <a className={`px-3 py-1.5 rounded-full text-sm transition hover:bg-gray-100 ${location === "/" ? "bg-purple-100 text-purple-700" : ""}`}>
                  Home
                </a>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/emotion">
                <a className={`px-3 py-1.5 rounded-full text-sm transition hover:bg-gray-100 ${location === "/emotion" ? "bg-purple-100 text-purple-700" : ""}`}>
                  Emotion AI
                </a>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/chatbot">
                <a className={`px-3 py-1.5 rounded-full text-sm transition hover:bg-gray-100 ${location === "/chatbot" ? "bg-purple-100 text-purple-700" : ""}`}>
                  Chatbot
                </a>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
