import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glassy?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, glassy = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl border border-gray-200/20 transition-all duration-300';
    const glassyStyles = glassy 
      ? 'backdrop-blur-md bg-white/10 border-white/20' 
      : 'bg-white/80 backdrop-blur-sm';

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, glassyStyles, className)}
        whileHover={hoverable ? { 
          y: -8,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;