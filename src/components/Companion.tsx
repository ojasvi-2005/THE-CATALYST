import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coffee, Heart, Smile } from 'lucide-react';

// Static assets imported as ES modules to compile with Vite
import biscuitAvatarImg from '../assets/images/biscuit_avatar_1782381164224.jpg';
import biscuitSleepingImg from '../assets/images/biscuit_sleeping_1782381180640.jpg';

interface CompanionProps {
  mood: 'happy' | 'sleeping' | 'celebrating';
  message: string;
  onWakeUp?: () => void;
}

export default function Companion({ mood, message, onWakeUp }: CompanionProps) {
  const [bouncing, setBouncing] = useState(false);

  // Trigger brief bounce loop occasionally or on change
  useEffect(() => {
    if (mood === 'celebrating') {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 1200);
      return () => clearTimeout(timer);
    } else {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [mood, message]);

  // Mascot image URLs from assets
  const happyUrl = biscuitAvatarImg;
  const sleepingUrl = biscuitSleepingImg;

  return (
    <div id="biscuit-companion" className="relative flex items-center gap-4 bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-5 shadow-sm max-w-xl mx-auto mb-6">
      {/* Visual Avatar with bouncy keyframes */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={
            mood === 'sleeping'
              ? {
                  scale: [1, 0.96, 1],
                  y: [0, 2, 0],
                  transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
                }
              : mood === 'celebrating'
              ? {
                  y: [0, -35, 0, -20, 0],
                  rotate: [0, 360, 360, 0, 0],
                  scale: [1, 1.15, 1.1, 1, 1],
                  transition: { duration: 1.2, ease: 'easeInOut' },
                }
              : bouncing
              ? {
                  y: [0, -12, 0],
                  scale: [1, 1.05, 1],
                  transition: { duration: 0.5, ease: 'easeOut' },
                }
              : { y: 0 }
          }
          className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-[#DFD6C4] shadow-sm flex items-center justify-center relative cursor-pointer"
          onClick={() => {
            if (mood === 'sleeping' && onWakeUp) {
              onWakeUp();
            } else {
              setBouncing(true);
              setTimeout(() => setBouncing(false), 600);
            }
          }}
        >
          <img
            src={mood === 'sleeping' ? sleepingUrl : happyUrl}
            alt="Biscuit the Dog"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Sparkles / Effects overlay */}
          {mood === 'celebrating' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-yellow-400/10 pointer-events-none flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-yellow-500 animate-spin" />
            </motion.div>
          )}

          {mood === 'sleeping' && (
            <div className="absolute top-1 right-1 flex gap-0.5">
              <span className="text-[10px] font-bold text-sky-400 animate-ping">Z</span>
              <span className="text-[8px] font-bold text-sky-300 animate-bounce delay-100">z</span>
            </div>
          )}
        </motion.div>

        {/* Decorative shadow under Biscuit */}
        <div className="w-20 h-2 bg-[#1a0f08]/5 rounded-full blur-sm mx-auto mt-2 transition-all duration-300" />
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0 relative">
        {/* Cute Speech Bubble Tail */}
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-[#FFFDF9] border-b-[8px] border-b-transparent filter drop-shadow-[-1px_0_0_#E9E4DB]" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#5D5750] tracking-wide">
              {mood === 'sleeping' ? '💤 Biscuit is snoozing...' : '🐾 Biscuit says'}
            </span>
            {mood === 'happy' && <Smile className="w-4 h-4 text-amber-500" />}
            {mood === 'celebrating' && <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />}
            {mood === 'sleeping' && <Coffee className="w-4 h-4 text-sky-400" />}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-[#2C2A29] leading-relaxed italic"
            >
              "{message}"
            </motion.p>
          </AnimatePresence>
        </div>

        {mood === 'sleeping' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWakeUp}
            className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer"
          >
            Wake Biscuit up! 🐾
          </motion.button>
        )}
      </div>
    </div>
  );
}
