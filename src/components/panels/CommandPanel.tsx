import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getCommandsForUnit } from '../../data/commandDefinitions';
import { issueOrder } from '../../engine/commandEngine';
import { SovietButton } from '../ui/SovietButton';
import { SovietCard } from '../ui/SovietCard';
import { OrderRisk } from '../../types/units';

export const CommandPanel: React.FC = () => {
  const { units, selectedUnitId, selectedTargetId, metrics, nuclear } = useGameStore();
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<OrderRisk>('medium');

  const unit = units.find((u) => u.id === selectedUnitId && u.faction === 'soviet');
  const target = units.find((u) => u.id === selectedTargetId);

  if (!unit) {
    return (
      <div className="p-4 text-xs font-mono text-soviet-gray/50 text-center">
        选择己方单位以下达命令
      </div>
    );
  }

  const commands = getCommandsForUnit(unit.type);
  const activeCooldown = unit.cooldown > 0;

  const handleIssueOrder = (commandType: string) => {
    if (activeCooldown) return;

    const command = commands.find((c) => c.type === commandType);
    if (!command) return;

    if (command.category === 'nuclear') {
      issueOrder({
        type: 'nuclear',
        sourceUnitId: unit.id,
        risk: 'extreme',
        duration: 10,
      });
      return;
    }

    issueOrder({
      type: command.type,
      sourceUnitId: unit.id,
      targetUnitId: ['artillery', 'rocket', 'missile', 'airSupport'].includes(command.type) ? selectedTargetId : undefined,
      targetPosition: ['advance', 'flank'].includes(command.type) && target ? target.position : undefined,
      risk: selectedRisk,
      duration: command.cooldownTicks,
    });

    setSelectedCommand(null);
  };

  return (
    <div className="p-2 space-y-2">
      <SovietCard title={`命令: ${unit.name}`} className="border-soviet-gray/30">
        {activeCooldown && (
          <div className="mb-2 text-xs font-mono text-soviet-amber">
            冷却中... ({unit.cooldown} tick)
          </div>
        )}

        <div className="mb-2">
          <div className="text-[10px] text-soviet-gray uppercase mb-1">风险等级</div>
          <div className="flex gap-1">
            {(['low', 'medium', 'high', 'extreme'] as OrderRisk[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2 py-0.5 text-[10px] font-mono border ${
                  selectedRisk === r
                    ? r === 'extreme'
                      ? 'border-soviet-red bg-soviet-red text-white'
                      : 'border-soviet-green bg-soviet-green text-soviet-black'
                    : 'border-soviet-gray/30 text-soviet-gray'
                }`}
              >
                {r === 'low' ? '低' : r === 'medium' ? '中' : r === 'high' ? '高' : '极高'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {commands.map((cmd) => {
            const isNuclear = cmd.category === 'nuclear';
            const isDisabled = activeCooldown || (isNuclear && nuclear.level === 0 && metrics.nuclearEscalation < 40);

            return (
              <SovietButton
                key={cmd.type}
                onClick={() => handleIssueOrder(cmd.type)}
                disabled={isDisabled}
                variant={isNuclear ? 'danger' : cmd.category === 'fire' ? 'warning' : 'default'}
                className="w-full text-left text-xs py-1.5"
              >
                <div className="flex justify-between">
                  <span>{cmd.label}</span>
                  <span className="text-[10px] opacity-60">{cmd.cooldownTicks}T</span>
                </div>
                <div className="text-[10px] opacity-60 font-normal normal-case">{cmd.description}</div>
              </SovietButton>
            );
          })}
        </div>
      </SovietCard>
    </div>
  );
};
