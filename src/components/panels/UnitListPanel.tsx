import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SovietCard } from '../ui/SovietCard';

export const UnitListPanel: React.FC = () => {
  const { units, selectedUnitId, setSelectedUnit, setSelectedTarget } = useGameStore();

  const sovietUnits = units.filter((u) => u.faction === 'soviet');
  const enemyUnits = units.filter((u) => u.faction === 'enemy');

  return (
    <div className="h-full overflow-y-auto p-2 space-y-2">
      <SovietCard title="己方单位" variant="default" className="border-soviet-green/30">
        <div className="space-y-1">
          {sovietUnits.map((unit) => (
            <div
              key={unit.id}
              onClick={() => {
                setSelectedUnit(unit.id);
                setSelectedTarget(undefined);
              }}
              className={`px-2 py-1 text-xs font-mono cursor-pointer border ${
                selectedUnitId === unit.id
                  ? 'border-soviet-green bg-soviet-green/10 text-soviet-green'
                  : 'border-transparent text-soviet-gray hover:bg-soviet-gray/10'
              }`}
            >
              <div className="flex justify-between">
                <span>{unit.name}</span>
                <span className={unit.strength < 50 ? 'text-soviet-red' : 'text-soviet-green'}>
                  {Math.round(unit.strength)}%
                </span>
              </div>
              <div className="flex gap-2 text-[10px] text-soviet-gray/60">
                <span>士气:{Math.round(unit.morale)}</span>
                <span>补给:{Math.round(unit.supply)}</span>
                <span>{getStatusLabel(unit.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </SovietCard>

      <SovietCard title="敌方目标" variant="danger" className="border-soviet-red/30">
        <div className="space-y-1">
          {enemyUnits.map((unit) => (
            <div
              key={unit.id}
              onClick={() => {
                setSelectedTarget(unit.id);
                setSelectedUnit(undefined);
              }}
              className={`px-2 py-1 text-xs font-mono cursor-pointer border ${
                unit.detection === 'unknown'
                  ? 'opacity-40'
                  : unit.detection === 'probable'
                  ? 'opacity-70'
                  : ''
              } ${
                'border-transparent text-soviet-red/80 hover:bg-soviet-red/10'
              }`}
            >
              <div className="flex justify-between">
                <span>{unit.detection === 'unknown' ? '未识别目标' : unit.name}</span>
                <span>{unit.detection === 'confirmed' ? `${Math.round(unit.strength)}%` : '?'}</span>
              </div>
              <div className="text-[10px] text-soviet-gray/60">
                {unit.detection === 'confirmed' ? '已确认' : unit.detection === 'probable' ? '疑似' : '未知'}
              </div>
            </div>
          ))}
        </div>
      </SovietCard>
    </div>
  );
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    idle: '待命',
    advancing: '推进中',
    engaged: '交战中',
    holding: '固守',
    retreating: '撤退中',
    'comms-lost': '通信中断',
    disrupted: '混乱',
    disobeying: '抗命',
    suppressed: '被压制',
    'low-ammo': '弹药不足',
    'low-fuel': '燃料不足',
    'awaiting-support': '等待支援',
    jammed: '受干扰',
    'command-lost': '失去指挥',
  };
  return labels[status] || status;
}
