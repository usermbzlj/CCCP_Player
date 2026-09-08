import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const NewsFeed: React.FC = () => {
  const { logs } = useGameStore();
  const newsLogs = logs.filter((l) => l.category === 'news');

  return (
    <div className="h-full overflow-y-auto p-2 space-y-2">
      {newsLogs.length === 0 && (
        <div className="text-xs font-mono text-soviet-gray/30 text-center py-4">
          等待新闻广播...
        </div>
      )}
      {newsLogs.map((log) => (
        <div key={log.id} className="border border-soviet-gray/20 p-2">
          <div className="text-xs font-mono text-soviet-amber font-bold">{log.title}</div>
          <div className="text-xs font-mono text-soviet-gray mt-1">{log.content}</div>
        </div>
      ))}
    </div>
  );
};
