import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatCampaignTime } from '../../utils/formatTime';
import { GlitchText } from '../ui/GlitchText';

export const TopStatusBar: React.FC = () => {
  const { metrics, campaignTime, speed, nuclear, setSpeed, phase } = useGameStore();

  const nuclearLabels = ['Обычный', 'Наблюдение', 'Предв. готовность', 'Такт. порог', 'Страт. разрешение', 'Необратимый'];

  return (
    <div className="h-14 border-b border-soviet-gray/30 bg-soviet-dark flex items-center px-4 gap-6 select-none">
      <div className="flex items-center gap-2">
        <span className="text-soviet-red font-mono text-sm font-bold tracking-wider">КРАСНЫЙ КОМПЛЕКС</span>
        {nuclear.level > 0 && (
          <span className="text-xs font-mono text-soviet-redBright animate-pulse border border-soviet-red px-1">
            {nuclearLabels[nuclear.level]}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4 text-xs font-mono">
        <MetricBadge label="指挥完整性" value={metrics.commandIntegrity} color="red" />
        <MetricBadge label="战略优势" value={metrics.strategicAdvantage} color="green" />
        <MetricBadge label="核风险" value={metrics.nuclearEscalation} color="amber" />
        <MetricBadge label="外交压力" value={metrics.diplomaticPressure} color="cyan" />
        <MetricBadge label="通信" value={metrics.commsStability} color="gray" />
        <MetricBadge label="总参信任" value={metrics.stavkaTrust} color="gray" />
      </div>

      <div className="w-px h-8 bg-soviet-gray/30" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-soviet-gray">{formatCampaignTime(campaignTime)}</span>
        <div className="flex border border-soviet-gray/50">
          {([0, 1, 2, 4] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 text-xs font-mono ${
                speed === s
                  ? 'bg-soviet-red text-white'
                  : 'text-soviet-gray hover:bg-soviet-gray/20'
              }`}
            >
              {s === 0 ? '||' : `${s}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricBadge: React.FC<{ label: string; value: number; color: 'red' | 'green' | 'amber' | 'cyan' | 'gray' }> = ({
  label,
  value,
  color,
}) => {
  const colorClasses = {
    red: 'text-soviet-red',
    green: 'text-soviet-green',
    amber: 'text-soviet-amber',
    cyan: 'text-soviet-cyan',
    gray: 'text-soviet-gray',
  };

  const barColor = {
    red: 'bg-soviet-red',
    green: 'bg-soviet-green',
    amber: 'bg-soviet-amber',
    cyan: 'bg-soviet-cyan',
    gray: 'bg-soviet-gray',
  };

  const clamped = Math.max(0, Math.min(100, value));
  const isCritical = clamped < 25;

  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <span className={`text-[10px] uppercase ${colorClasses[color]} ${isCritical ? 'animate-pulse' : ''}`}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <div className="w-12 h-1.5 bg-soviet-black border border-soviet-gray/30">
          <div
            className={`h-full ${barColor[color]} ${isCritical ? 'animate-pulse' : ''}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className={`text-[10px] ${colorClasses[color]}`}>{Math.round(clamped)}</span>
      </div>
    </div>
  );
};
