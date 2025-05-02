import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div 
      className="flex items-center" 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-8 h-8 mr-2 flex items-center justify-center"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" fill="#D6F6F0" stroke="#333333" strokeWidth="2"/>
          <path d="M14 20C14 16.6863 16.6863 14 20 14H28C31.3137 14 34 16.6863 34 20V28C34 31.3137 31.3137 34 28 34H20C16.6863 34 14 31.3137 14 28V20Z" fill="#E8EAF6"/>
          <path d="M20 23C21.1046 23 22 22.1046 22 21C22 19.8954 21.1046 19 20 19C18.8954 19 18 19.8954 18 21C18 22.1046 18.8954 23 20 23Z" fill="#333333"/>
          <path d="M28 23C29.1046 23 30 22.1046 30 21C30 19.8954 29.1046 19 28 19C26.8954 19 26 19.8954 26 21C26 22.1046 26.8954 23 28 23Z" fill="#333333"/>
          <path d="M16 29C16 29 20 33 24 33C28 33 32 29 32 29" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.div>
      <motion.span 
        className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-400 bg-clip-text text-transparent font-heading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        NARA.I
      </motion.span>
    </motion.div>
  );
}