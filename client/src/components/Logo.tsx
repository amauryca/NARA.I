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
        className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-2"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span 
          className="text-white font-bold text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          N
        </motion.span>
      </motion.div>
      <motion.span 
        className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-400 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        NARA.I
      </motion.span>
    </motion.div>
  );
}