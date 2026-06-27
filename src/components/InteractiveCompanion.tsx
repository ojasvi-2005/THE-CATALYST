import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Star, CloudRain, ShieldCheck } from 'lucide-react';
import { CompanionMascot } from '../types';

interface InteractiveCompanionProps {
  companion: CompanionMascot;
  mood?: 'idle' | 'happy' | 'thinking' | 'chatting' | 'sleepy';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function InteractiveCompanion({
  companion,
  mood = 'idle',
  className = '',
  size = 'md',
  onClick
}: InteractiveCompanionProps) {
  const [localMood, setLocalMood] = useState<'idle' | 'happy' | 'thinking' | 'chatting' | 'sleepy'>(mood);
  const [clickCount, setClickCount] = useState(0);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);

  useEffect(() => {
    setLocalMood(mood);
  }, [mood]);

  // Occasional random blink / wiggle to feel "alive"
  useEffect(() => {
    const interval = setInterval(() => {
      if (localMood === 'idle') {
        const r = Math.random();
        if (r < 0.2) {
          // Trigger a cute stretch
          setLocalMood('happy');
          setTimeout(() => setLocalMood('idle'), 1500);
        } else if (r < 0.35) {
          // Look sleepy for a moment
          setLocalMood('sleepy');
          setTimeout(() => setLocalMood('idle'), 2000);
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [localMood]);

  // Dimensions based on size prop
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-36 h-36'
  };

  const handleCompanionClick = () => {
    // Physical squishy jump
    setLocalMood('happy');
    setClickCount(prev => prev + 1);

    // Create a burst of cute floating particles
    const particles = ['✨', '💖', '⭐', '🐾', '💭', '🔋'];
    const selectedParticle = particles[Math.floor(Math.random() * particles.length)];
    const newParticle = {
      id: Date.now(),
      char: selectedParticle,
      x: (Math.random() - 0.5) * 40,
      y: -20 - Math.random() * 20
    };

    setFloatingParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);

    // Reset back to idle after a quick dance
    setTimeout(() => {
      setLocalMood('idle');
    }, 1200);

    if (onClick) {
      onClick();
    }
  };

  // Get dynamic motion configuration depending on active companion state
  const getMotionProps = () => {
    switch (localMood) {
      case 'happy':
        return {
          animate: {
            y: [0, -25, 5, -8, 0],
            scaleY: [1, 0.85, 1.15, 0.9, 1.05, 1],
            scaleX: [1, 1.15, 0.85, 1.1, 0.95, 1],
            rotate: [0, -10, 10, -5, 5, 0]
          },
          transition: { duration: 1, ease: 'easeInOut' }
        };
      case 'thinking':
        return {
          animate: {
            y: [0, -2, 0, -2, 0],
            rotate: [-4, 4, -4, 4, 0],
            scale: [1, 1.02, 0.98, 1],
          },
          transition: { repeat: Infinity, duration: 4, ease: 'linear' }
        };
      case 'chatting':
        return {
          animate: {
            y: [0, -4, 0],
            scaleY: [1, 1.03, 0.97, 1],
            x: [-1, 1, -1, 1, 0],
          },
          transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
        };
      case 'sleepy':
        return {
          animate: {
            y: [0, 2, 0],
            scaleY: [1, 0.96, 1],
            scaleX: [1, 1.04, 1]
          },
          transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
        };
      case 'idle':
      default:
        // Soft floating & breathing effect
        return {
          animate: {
            y: [0, -6, 0],
            scaleY: [1, 1.03, 1],
            rotate: [0, 0.5, -0.5, 0]
          },
          transition: {
            repeat: Infinity,
            duration: 3 + (companion.name.length % 2), // slightly desynchronize multiple companions
            ease: 'easeInOut'
          }
        };
    }
  };

  return (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      {/* Glow Aura behind companion */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none transition-all duration-700 bg-[#8C9A86]" 
        style={{
          transform: 'scale(0.85)',
          animation: 'pulse 3s infinite ease-in-out'
        }}
      />

      <motion.div
        {...getMotionProps()}
        onClick={handleCompanionClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-[#DFD6C4] shadow-xs cursor-pointer flex items-center justify-center`}
      >
        {companion.svgMarkup ? (
          <div 
            className="w-full h-full p-2.5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full transition-transform"
            dangerouslySetInnerHTML={{ __html: companion.svgMarkup }}
          />
        ) : (
          <img 
            src={companion.imageUrl} 
            alt={companion.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform"
          />
        )}

        {/* State Indicators overlay */}
        {localMood === 'thinking' && (
          <div className="absolute inset-0 bg-[#FAF6F0]/20 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-2 border-2 border-dashed border-[#8C9A86]/30 rounded-full"
            />
            <span className="text-xs font-bold text-[#8C9A86] bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs">...</span>
          </div>
        )}

        {localMood === 'sleepy' && (
          <div className="absolute top-1 right-2 pointer-events-none">
            <span className="text-[10px] font-bold text-[#8C9A86] animate-ping block">💤</span>
          </div>
        )}

        {localMood === 'happy' && (
          <div className="absolute inset-0 bg-[#8C9A86]/5 pointer-events-none flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Decorative shadow under Buddy that responds to jump height */}
      <motion.div 
        animate={{
          scaleX: localMood === 'happy' ? [0.6, 1, 0.7, 1] : [1, 0.9, 1],
          opacity: localMood === 'happy' ? [0.1, 0.3, 0.1, 0.3] : 0.3
        }}
        transition={{ duration: localMood === 'happy' ? 1.2 : 3.5, ease: 'easeInOut', repeat: localMood === 'happy' ? 0 : Infinity }}
        className="w-16 h-1.5 bg-[#1a0f08]/15 rounded-full blur-xs mt-2 pointer-events-none" 
      />

      {/* Floating Sparkle/Heart Particles Burst */}
      <AnimatePresence>
        {floatingParticles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1.3, x: p.x, y: p.y }}
            exit={{ opacity: 0, y: p.y - 30, scale: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute text-sm font-bold pointer-events-none z-55"
            style={{ top: '35%' }}
          >
            {p.char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
