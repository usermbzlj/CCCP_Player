import React from 'react';

interface SovietCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'danger' | 'warning';
}

export const SovietCard: React.FC<SovietCardProps> = ({
  children,
  title,
  className = '',
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-soviet-gray/30',
    danger: 'border-soviet-red/50',
    warning: 'border-soviet-amber/50',
  };

  return (
    <div className={`border ${borderColors[variant]} bg-soviet-dark/80 ${className}`}>
      {title && (
        <div className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border-b ${borderColors[variant]} ${variant === 'danger' ? 'text-soviet-red' : variant === 'warning' ? 'text-soviet-amber' : 'text-soviet-gray'}`}>
          {title}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
};
