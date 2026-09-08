import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  active?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '', active = false }) => {
  return (
    <span className={`glitch-text ${active ? 'glitch-active' : ''} ${className}`} data-text={text}>
      {text}
    </span>
  );
};
