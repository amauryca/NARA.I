import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="bg-gray-900 text-white py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-4 md:mb-0"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="text-xl font-bold mb-2">NARA.I</div>
            <p className="text-gray-400 text-sm">
              AI-powered emotional intelligence assistant
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <p className="flex items-center text-gray-300 mb-2">
              Created with <Heart className="h-4 w-4 mx-1 text-red-500" /> by Amaury Castillo-Acevedo
            </p>

          </motion.div>
        </div>
        
        <motion.div 
          className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          © {currentYear} NARA.I. All rights reserved.
        </motion.div>
      </div>
    </motion.footer>
  );
}