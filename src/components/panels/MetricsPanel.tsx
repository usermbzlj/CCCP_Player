import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const MetricsPanel: React.FC = () => {
  const { metrics } = useGameStore();

  const items = [
    { label: '指挥完整性', value: metrics.commandIntegrity, color: 'text-soviet-red' },
    { label: '战略优势', value: metrics.strategicAdvantage, color: 'text-soviet-green' },
    { label: '核升级风险', value: metrics.nuclearEscalation, color: 'text-soviet-amber' },
    { label: '外交压力', value: metrics.diplomaticPressure, color: 'text-soviet-cyan' },
    { label: '情报可信度', value: metrics.intelReliability, color: 'text-soviet-gray' },
    { label: '通信稳定性', value: metrics.commsStability, color: 'text-soviet-gray' },
    { label: '总参信任', value: metrics.stavkaTrust, color: 'text-soviet-gray' },
    { label: '民众恐慌', value: metrics.publicPanic, color: 'text-soviet-amber' },
    { label: '系统完整性', value: metrics.systemIntegrity, color: 'text-soviet-gray' },
  ];

  return (
    <div className="p-2 space-y-1">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between text-xs font-mono">
          <span className="text-soviet-gray">{item.label}</span>
          <span className={item.color}>{Math.round(item.value)}</span>
        </div>
      ))}
    </div>
  );
};
