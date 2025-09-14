'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Easing } from 'framer-motion';

interface TextRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  stagger?: boolean;
}

export default function TextReveal({
  children,
  delay = 0,
  duration = 0.8,
  className = '',
  stagger = false
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger ? 0.1 : 0,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: {
      y: '100%',
      opacity: 0
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration,
        ease: [0.19, 1, 0.22, 1] as Easing // Jan Raven's cubic-bezier
      }
    }
  };

  // 如果是文字，將其分割成行
  const processContent = (content: React.ReactNode): React.ReactNode => {
    if (typeof content === 'string') {
      const lines = content.split('\n');
      return lines.map((line, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div variants={itemVariants}>
            {line}
          </motion.div>
        </div>
      ));
    }

    if (stagger && Array.isArray(children)) {
      return (children as React.ReactNode[]).map((child, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div variants={itemVariants}>
            {child}
          </motion.div>
        </div>
      ));
    }

    return (
      <div className="overflow-hidden">
        <motion.div variants={itemVariants}>
          {content}
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {processContent(children)}
    </motion.div>
  );
}