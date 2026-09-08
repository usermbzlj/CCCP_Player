import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getEndingInfo } from '../../data/endings';
import { GlitchText } from '../ui/GlitchText';
import { SovietButton } from '../ui/SovietButton';
import { getRussianLabel } from '../../data/russianLabels';

export const EndingScreen: React.FC = () => {
  const { endingType, resetGame } = useGameStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!endingType) return null;

  const info = getEndingInfo(endingType);

  const toneColors = {
    triumph: 'text-soviet-green',
    bitter: 'text-soviet-amber',
    ominous: 'text-soviet-red',
    doom: 'text-soviet-red',
    ironic: 'text-soviet-gray',
  };

  return (
    <div className="w-screen h-screen bg-soviet-black flex items-center justify-center crt-container">
      <div
        className={`w-full max-w-2xl p-8 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-8">
          <div className="text-xs font-mono text-soviet-red/50 uppercase tracking-widest mb-4">
            {getRussianLabel('SECRET')} — 结局报告
          </div>
          <GlitchText
            text={info.title}
            className={`text-5xl font-mono ${toneColors[info.tone]} text-glow-red tracking-wider`}
            active={info.tone === 'doom' || info.tone === 'ominous'}
          />
          <div className={`text-lg font-mono mt-3 ${toneColors[info.tone]} opacity-80`}>
            {info.subtitle}
          </div>
        </div>

        <div className="border border-soviet-gray/30 bg-soviet-dark/50 p-6 mb-8">
          <div className="text-sm font-mono text-soviet-gray leading-relaxed whitespace-pre-line">
            {info.description}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <SovietButton onClick={resetGame} variant="default">
            返回主菜单
          </SovietButton>
        </div>

        <div className="mt-8 text-center text-xs font-mono text-soviet-gray/30">
          КРАСНЫЙ КОМПЛЕКС — 模拟结束
        </div>
      </div>
    </div>
  );
};
