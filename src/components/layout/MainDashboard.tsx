import React from 'react';
import { TopStatusBar } from './TopStatusBar';
import { TacticalMap } from '../map/TacticalMap';
import { UnitListPanel } from '../panels/UnitListPanel';
import { CommandPanel } from '../panels/CommandPanel';
import { TerminalPanel } from '../terminal/TerminalPanel';
import { UnitDetailPanel } from '../panels/UnitDetailPanel';
import { NuclearProtocolPanel } from '../nuclear/NuclearProtocolPanel';
import { useGameStore } from '../../store/useGameStore';

export const MainDashboard: React.FC = () => {
  const { phase, nuclear } = useGameStore();

  if (phase === 'nuclear-protocol') {
    return (
      <div className="w-screen h-screen flex flex-col crt-container">
        <TopStatusBar />
        <div className="flex-1 overflow-hidden">
          <NuclearProtocolPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col crt-container">
      <TopStatusBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Unit List */}
        <div className="w-64 border-r border-soviet-gray/30 flex flex-col">
          <UnitListPanel />
        </div>

        {/* Center: Map + Detail */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            <TacticalMap />
          </div>
          <div className="h-48 border-t border-soviet-gray/30">
            <UnitDetailPanel />
          </div>
        </div>

        {/* Right: Command + Terminal */}
        <div className="w-80 border-l border-soviet-gray/30 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <CommandPanel />
          </div>
        </div>
      </div>
      <div className="h-56 border-t border-soviet-gray/30">
        <TerminalPanel />
      </div>
    </div>
  );
};
