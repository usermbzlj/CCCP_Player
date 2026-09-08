import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { NuclearAuthorizationFlow } from './NuclearAuthorizationFlow';
import { NuclearCountdown } from './NuclearCountdown';
import { AlertBanner } from '../ui/AlertBanner';
import { GlitchText } from '../ui/GlitchText';

export const NuclearProtocolPanel: React.FC = () => {
  const { nuclear, metrics } = useGameStore();

  const levelNames = [
    'Обычный режим',
    'Ядерное наблюдение',
    'Предварительная готовность',
    'Тактический порог',
    'Стратегическое разрешение',
    'Необратимый протокол',
  ];

  return (
    <div className="w-full h-full bg-soviet-black nuclear-overlay flex flex-col crt-container">
      <AlertBanner
        text={`ЯДЕРНЫЙ ПРОТОКОЛ АКТИВЕН — 等级 ${nuclear.level}: ${levelNames[nuclear.level]}`}
        level={nuclear.level >= 4 ? 'critical' : nuclear.level >= 3 ? 'danger' : 'warning'}
      />

      <div className="flex-1 flex">
        {/* Left: Authorization Flow */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <GlitchText
              text="ЯДЕРНЫЙ ПРОТОКОЛ"
              className="text-4xl font-mono text-soviet-red text-glow-red tracking-widest"
              active={true}
            />
            <div className="text-sm font-mono text-soviet-red/70 mt-2">
              当前核升级风险: {Math.round(metrics.nuclearEscalation)}%
            </div>
          </div>

          <NuclearAuthorizationFlow />
        </div>

        {/* Right: Status + Countdown */}
        <div className="w-80 border-l border-soviet-red/30 p-4 space-y-4">
          <NuclearCountdown />

          <div className="border border-soviet-red/30 bg-soviet-red/5 p-3">
            <div className="text-xs font-mono text-soviet-red uppercase mb-2">外交警报</div>
            <div className="text-xs font-mono text-soviet-gray">
              外交压力: {Math.round(metrics.diplomaticPressure)}%
            </div>
            <div className="text-xs font-mono text-soviet-gray">
              民众恐慌: {Math.round(metrics.publicPanic)}%
            </div>
          </div>

          <div className="border border-soviet-red/30 bg-soviet-red/5 p-3">
            <div className="text-xs font-mono text-soviet-red uppercase mb-2">指挥链状态</div>
            <div className="text-xs font-mono text-soviet-gray">
              指挥完整性: {Math.round(metrics.commandIntegrity)}%
            </div>
            <div className="text-xs font-mono text-soviet-gray">
              总参信任: {Math.round(metrics.stavkaTrust)}%
            </div>
          </div>

          {nuclear.irreversible && (
            <div className="border-2 border-soviet-red bg-soviet-red/20 p-3 animate-pulse">
              <div className="text-sm font-mono text-soviet-redBright text-center font-bold">
                НЕОБРАТИМЫЙ ПРОТОКОЛ
              </div>
              <div className="text-xs font-mono text-soviet-red text-center mt-1">
                流程已不可逆转
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
