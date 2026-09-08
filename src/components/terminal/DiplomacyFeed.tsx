import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const DiplomacyFeed: React.FC = () => {
  const { logs } = useGameStore();
  const diploLogs = logs.filter((l) => l.category === 'diplomacy');

  return (
    <div className="h-full overflow-y-auto p-2 space-y-2">
      {diploLogs.length === 0 && (
        <div className="text-xs font-mono text-soviet-gray/30 text-center py-4">
          等待外交频道...
        </div>
      )}
      {diploLogs.map((log) => (
        <div key={log.id} className="border border-soviet-gray/20 p-2">
          <div className="text-xs font-mono text-soviet-cyan font-bold">{log.title}</div>
          <div className="text-xs font-mono text-soviet-gray mt-1">{log.content}</div>
        </div>
      ))}
    </div>
  );
};
