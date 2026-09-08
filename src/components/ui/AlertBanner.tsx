import React from 'react';
import { motion } from 'framer-motion';

interface AlertBannerProps {
  text: string;
  level?: 'warning' | 'danger' | 'critical';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ text, level = 'warning' }) => {
  const colors = {
    warning: 'bg-soviet-amber/20 border-soviet-amber text-soviet-amber',
    danger: 'bg-soviet-red/20 border-soviet-red text-soviet-redBright',
    critical: 'bg-soviet-red/40 border-soviet-red text-white animate-pulse',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border px-4 py-2 font-mono text-sm text-center ${colors[level]}`}
    >
      {text}
    </motion.div>
  );
};
