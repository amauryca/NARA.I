import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle } from 'lucide-react';

interface EmergencyResourcesProps {
  show: boolean;
  onClose: () => void;
  severity: 'moderate' | 'severe';
}

export default function EmergencyResources({ show, onClose, severity = 'moderate' }: EmergencyResourcesProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const resourcesVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } }
  };

  const minimizedVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  // Emergency resources content based on severity
  const renderContent = () => {
    if (severity === 'severe') {
      return (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <a 
              href="tel:911" 
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold animate-pulse shadow-lg"
            >
              <Phone className="h-5 w-5" />
              <span>Call 911 (Emergency)</span>
            </a>
            <a 
              href="tel:988" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md"
            >
              <Phone className="h-5 w-5" />
              <span>Call 988 (Crisis Hotline)</span>
            </a>
          </div>
          <p className="text-sm text-red-800">If you or someone else is in immediate danger, please call emergency services right away.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg">24/7 Support Available</h3>
        <div className="flex flex-col gap-3">
          <a 
            href="tel:988" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md"
          >
            <Phone className="h-5 w-5" />
            <span>Call 988 (Crisis Hotline)</span>
          </a>
          <a 
            href="https://988lifeline.org/chat/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md"
          >
            <span>Chat Online with Crisis Counselor</span>
          </a>
        </div>
        <p className="text-sm text-gray-700">You're not alone. Trained counselors are available to provide support 24/7.</p>
      </div>
    );
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <AnimatePresence>
        {expanded ? (
          <motion.div 
            key="expanded"
            className={`p-5 rounded-xl shadow-lg ${severity === 'severe' ? 'bg-red-50 border-2 border-red-500' : 'bg-blue-50 border-2 border-blue-400'}`}
            variants={resourcesVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2 items-center">
                <AlertTriangle className={`${severity === 'severe' ? 'text-red-600' : 'text-blue-600'} h-6 w-6`} />
                <h2 className="font-semibold font-heading text-xl">
                  {severity === 'severe' ? 'Emergency Resources' : 'Support Resources'}
                </h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleExpanded} 
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Minimize"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
                  </svg>
                </button>
                <button 
                  onClick={onClose} 
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {renderContent()}
          </motion.div>
        ) : (
          <motion.div 
            key="minimized"
            className={`p-3 rounded-full shadow-lg flex items-center ${severity === 'severe' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} cursor-pointer`}
            variants={minimizedVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={toggleExpanded}
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">{severity === 'severe' ? 'Emergency Help' : 'Support Resources'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}