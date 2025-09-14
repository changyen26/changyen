'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface AnimatedLinkProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  external?: boolean;
  underlineColor?: string;
  underlineHeight?: string;
}

export default function AnimatedLink({
  href,
  children,
  className = '',
  onClick,
  external = false,
  underlineColor = 'bg-current',
  underlineHeight = 'h-px'
}: AnimatedLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const underlineVariants = {
    initial: {
      scaleX: 0,
      originX: 0
    },
    hover: {
      scaleX: 1,
      originX: 0,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1] // Jan Raven's cubic-bezier
      }
    },
    tap: {
      scaleX: 1,
      originX: 0,
      transition: {
        duration: 0.3,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  };

  const textVariants = {
    initial: {
      y: 0
    },
    hover: {
      y: -1,
      transition: {
        duration: 0.3,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  };

  const Component = href ? 'a' : 'button';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Component
      href={href}
      onClick={handleClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`relative inline-block group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ willChange: 'transform' }}
    >
      {/* 文字內容 */}
      <motion.span
        className="relative z-10 block"
        variants={textVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        {children}
      </motion.span>

      {/* 底線動畫 */}
      <motion.div
        className={`absolute bottom-0 left-0 w-full ${underlineHeight} ${underlineColor}`}
        variants={underlineVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        style={{ willChange: 'transform' }}
      />

      {/* Hover 狀態的額外效果 */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.4,
            ease: [0.19, 1, 0.22, 1]
          }}
          style={{
            background: 'radial-gradient(circle, currentColor 0%, transparent 70%)'
          }}
        />
      )}
    </Component>
  );
}