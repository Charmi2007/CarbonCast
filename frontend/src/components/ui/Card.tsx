import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hoverable = false,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : {}}
      className={`bg-brand-bg rounded-2xl shadow-soft border border-brand-border p-6 transition-shadow duration-300 ${hoverable ? 'hover:shadow-modern cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
