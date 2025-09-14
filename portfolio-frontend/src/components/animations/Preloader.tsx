'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Easing } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
              setIsComplete(true);
              setTimeout(onComplete, 600);
            }, 800);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  const textVariants = {
    hidden: {
      y: '100%',
      opacity: 0
    },
    visible: (i: number) => ({
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: i * 0.1,
        ease: [0.19, 1, 0.22, 1] as Easing // cubic-bezier(.19,1,.22,1)
      }
    }),
    exit: {
      y: '-100%',
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.19, 1, 0.22, 1] as Easing
      }
    }
  };

  const loaderVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: progress / 100,
      transition: {
        duration: 0.2,
        ease: 'easeOut' as Easing
      }
    },
    exit: {
      scaleX: 1,
      transition: {
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1] as Easing
      }
    }
  };

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ backgroundColor: '#000000' }}
          animate={{
            backgroundColor: isTransitioning ? '#ffffff' : '#000000'
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] }
          }}
          transition={{
            backgroundColor: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
          }}
        >
          <div className="text-center">
            {/* Main Text */}
            <div className="overflow-hidden mb-8">
              <motion.h1
                className="text-4xl md:text-6xl font-mono font-bold uppercase tracking-widest"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={0}
                style={{
                  color: isTransitioning ? '#000000' : '#ffffff'
                }}
                transition={{
                  color: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
                }}
              >
                LOADING
              </motion.h1>
            </div>

            {/* Subtitle */}
            <div className="overflow-hidden mb-16">
              <motion.p
                className="text-xs font-mono uppercase tracking-widest"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={1}
                style={{
                  color: isTransitioning ? '#666666' : '#999999'
                }}
                transition={{
                  color: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
                }}
              >
                PREPARING EXPERIENCE
              </motion.p>
            </div>

            {/* Progress Bar */}
            <motion.div
              className="w-64 h-px mx-auto relative overflow-hidden"
              style={{
                backgroundColor: isTransitioning ? '#e5e5e5' : '#333333'
              }}
              transition={{
                backgroundColor: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
              }}
            >
              <motion.div
                className="absolute top-0 left-0 h-full origin-left"
                variants={loaderVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  backgroundColor: isTransitioning ? '#000000' : '#ffffff'
                }}
                transition={{
                  backgroundColor: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
                }}
              />
            </motion.div>

            {/* Progress Number */}
            <motion.div
              className="mt-4 font-mono text-xs tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                color: isTransitioning ? '#888888' : '#666666'
              }}
            >
              {Math.round(progress)}%
            </motion.div>

            {/* Blinking Indicator */}
            <motion.div
              className="w-1 h-1 rounded-full mx-auto mt-8"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundColor: isTransitioning ? '#000000' : '#ffffff'
              }}
            />
          </div>

          {/* Grid Background */}
          <div className="absolute inset-0 opacity-[0.01]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}