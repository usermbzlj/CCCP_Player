import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const NuclearCountdown: React.FC = () => {
  const { nuclear } = useGameStore();

  if (nuclear.countdown === undefined) {
    return (
      <div className="border border-soviet-gray/30 p-3 text-center">
        <div className="text-xs font-mono text-soviet-gray/50">倒计时未启动</div>
      </div>
    );
  }

  const isCritical = nuclear.countdown <= 10;

  return (
    <div className={`border p-4 text-center ${isCritical ? 'border-soviet-red bg-soviet-red/20 animate-pulse' : 'border-soviet-red/30 bg-soviet-red/5'}`}>
      <div className="text-xs font-mono text-soviet-red uppercase mb-2">发射倒计时</div>
      <div className={`text-4xl font-mono font-bold ${isCritical ? 'text-soviet-redBright' : 'text-soviet-red'}`}>
        {nuclear.countdown}
      </div>
      <div className="text-xs font-mono text-soviet-gray mt-1">秒</div>
      {nuclear.irreversible && (
        <div className="mt-2 text-xs font-mono text-soviet-redBright font-bold">
          НЕОБРАТИМО
        </div>
      )}
    </div>
  );
};
