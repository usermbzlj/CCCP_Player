import React from 'react';

interface SovietButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  className?: string;
}

export const SovietButton: React.FC<SovietButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'px-4 py-2 font-mono text-sm border uppercase tracking-wider transition-all duration-150 active:scale-95';

  const variantClasses = {
    default: 'border-soviet-gray bg-soviet-dark text-soviet-gray hover:bg-soviet-gray hover:text-soviet-black',
    danger: 'border-soviet-red bg-soviet-red/20 text-soviet-redBright hover:bg-soviet-red hover:text-white',
    warning: 'border-soviet-amber bg-soviet-amber/20 text-soviet-amber hover:bg-soviet-amber hover:text-soviet-black',
    success: 'border-soviet-green bg-soviet-green/20 text-soviet-green hover:bg-soviet-green hover:text-soviet-black',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
};
