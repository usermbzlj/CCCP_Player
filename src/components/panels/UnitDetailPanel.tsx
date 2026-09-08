import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SovietCard } from '../ui/SovietCard';

export const UnitDetailPanel: React.FC = () => {
  const { units, selectedUnitId, selectedTargetId } = useGameStore();
  const unitId = selectedUnitId || selectedTargetId;
  const unit = units.find((u) => u.id === unitId);

  if (!unit) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-mono text-soviet-gray/50">
        选择单位查看详情
      </div>
    );
  }

  return (
    <div className="h-full p-2">
      <SovietCard
        title={unit.name}
        variant={unit.faction === 'soviet' ? 'default' : 'danger'}
        className="h-full"
      >
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          <StatBar label="战力" value={unit.strength} color={unit.strength < 50 ? 'red' : 'green'} />
          <StatBar label="士气" value={unit.morale} color={unit.morale < 40 ? 'red' : 'green'} />
          <StatBar label="补给" value={unit.supply} color={unit.supply < 30 ? 'amber' : 'green'} />
          <StatBar label="燃料" value={unit.fuel} color={unit.fuel < 30 ? 'amber' : 'green'} />
          <StatBar label="弹药" value={unit.ammo} color={unit.ammo < 30 ? 'amber' : 'green'} />
          <StatBar label="就绪" value={unit.readiness} color="green" />
          <StatBar label="通信" value={unit.comms} color={unit.comms < 50 ? 'red' : 'green'} />
        </div>

        {unit.commander && (
          <div className="mt-2 pt-2 border-t border-soviet-gray/20 text-[10px] text-soviet-gray">
            指挥官: {unit.commander.name} | 忠诚:{unit.commander.loyalty} | 经验:{unit.commander.experience}
          </div>
        )}

        <div className="mt-1 text-[10px] text-soviet-gray/60">
          位置: ({unit.position.x}, {unit.position.y}) | 状态: {getStatusLabel(unit.status)}
        </div>
      </SovietCard>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: 'red' | 'green' | 'amber' }> = ({
  label,
  value,
  color,
}) => {
  const colors = {
    red: 'bg-soviet-red',
    green: 'bg-soviet-green',
    amber: 'bg-soviet-amber',
  };

  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-soviet-gray">{label}</span>
        <span className={color === 'red' ? 'text-soviet-red' : color === 'amber' ? 'text-soviet-amber' : 'text-soviet-green'}>
          {Math.round(value)}
        </span>
      </div>
      <div className="h-1 bg-soviet-black border border-soviet-gray/20">
        <div className={`h-full ${colors[color]}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
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
