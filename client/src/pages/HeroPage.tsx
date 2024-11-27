import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
      {/* Geometric Background Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/3 bg-white/10 transform -skew-y-12 -translate-x-1/4"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/3 bg-white/10 transform skew-y-12 translate-x-1/4"></div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 opacity-75"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Spoon Sync</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              A revolutionary mess management system that leverages AI and real-time data to reduce food waste and optimize meal planning with unprecedented precision.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="#/register"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started Now
              </a>
            </motion.div>
          </motion.div>

          {/* Circular Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center items-center"
          >
            <div className="w-80 h-80 bg-white/10 backdrop-blur-lg rounded-full border-4 border-white/20 shadow-2xl flex items-center justify-center">
              <div className="text-center p-6 bg-white/20 rounded-full">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Optimize Your Meals
                </h2>
                <p className="text-white/80 text-sm">
                  Smart tracking. Zero waste.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;