import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#D6F6F0] to-[#e0f2ff] min-h-[90vh] flex items-center justify-center py-10">
      <motion.div 
        className="container mx-auto px-6 py-10 max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 bg-clip-text text-transparent"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            NARA.I: Empathy in Action
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl max-w-3xl mx-auto text-gray-700"
            variants={itemVariants}
          >
            Experience AI-driven emotional recognition and mental health support, designed to understand and respond to your emotional needs.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Emotion AI Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-md p-8 text-center transition hover:shadow-lg relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              backgroundColor: "#FAFFFE"
            }}
          >
            <motion.div 
              className="absolute -right-10 -top-10 w-40 h-40 bg-teal-100 rounded-full opacity-30"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            <motion.div 
              className="rounded-full bg-[#E0F7FA] w-20 h-20 mx-auto mb-6 flex items-center justify-center relative z-10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-teal-600" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
              </motion.svg>
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-teal-800">Emotion Recognition</h2>
            <p className="mb-6 text-gray-600">
              Our AI analyses your facial expressions and voice to understand how you're feeling, providing compassionate responses.
            </p>
            <Link href="/emotion">
              <motion.a 
                className="inline-block bg-[#E0F7FA] hover:bg-[#E8F5E9] text-[#333333] font-semibold py-3 px-8 rounded-full transition cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Emotion AI
              </motion.a>
            </Link>
          </motion.div>
          
          {/* Chatbot Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-md p-8 text-center transition hover:shadow-lg relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              backgroundColor: "#FDF9FF"
            }}
          >
            <motion.div 
              className="absolute -left-10 -top-10 w-40 h-40 bg-purple-100 rounded-full opacity-30"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -10, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5
              }}
            />
            <motion.div 
              className="rounded-full bg-[#F3E5F5] w-20 h-20 mx-auto mb-6 flex items-center justify-center relative z-10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-purple-600" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </motion.svg>
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Therapeutic Chatbot</h2>
            <p className="mb-6 text-gray-600">
              Have a conversation with our AI therapist designed to provide support, guidance, and a compassionate listening ear.
            </p>
            <Link href="/chatbot">
              <motion.a 
                className="inline-block bg-[#F3E5F5] hover:bg-[#C8E6C9] text-[#333333] font-semibold py-3 px-8 rounded-full transition cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Open Chatbot
              </motion.a>
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-500">
            NARA.I processes all data locally in your browser. No information is stored or shared.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
