import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TerminalLog } from '../../types/events';
import { formatCampaignTime } from '../../utils/formatTime';

type Tab = 'all' | 'stavka' | 'frontline' | 'enemy' | 'diplomacy' | 'news' | 'system' | 'nuclear';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'stavka', label: '总参' },
  { key: 'frontline', label: '前线' },
  { key: 'enemy', label: '敌方' },
  { key: 'diplomacy', label: '外交' },
  { key: 'news', label: '新闻' },
  { key: 'system', label: '系统' },
  { key: 'nuclear', label: '核协议' },
];

export const TerminalPanel: React.FC = () => {
  const { logs, isLLMLoading } = useGameStore();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = activeTab === 'all' ? logs : logs.filter((l) => l.category === activeTab);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs.length]);

  return (
    <div className="h-full flex flex-col bg-soviet-dark/50">
      <div className="flex border-b border-soviet-gray/30">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 text-[10px] font-mono uppercase border-r border-soviet-gray/30 ${
              activeTab === tab.key
                ? 'bg-soviet-gray/20 text-soviet-gray'
                : 'text-soviet-gray/50 hover:text-soviet-gray'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {isLLMLoading && (
          <div className="ml-auto px-3 py-1 text-[10px] font-mono text-soviet-amber animate-pulse">
            主机正在计算...
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLogs.length === 0 && (
          <div className="text-xs font-mono text-soviet-gray/30 text-center py-4">
            等待系统消息...
          </div>
        )}
        {filteredLogs.map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};

const LogEntry: React.FC<{ log: TerminalLog }> = ({ log }) => {
  const categoryColors: Record<string, string> = {
    stavka: 'text-soviet-cyan',
    frontline: 'text-soviet-green',
    enemy: 'text-soviet-red',
    diplomacy: 'text-soviet-amber',
    news: 'text-soviet-gray',
    system: 'text-soviet-gray',
    nuclear: 'text-soviet-red',
  };

  return (
    <div className={`text-xs font-mono ${log.important ? 'border-l-2 border-soviet-red pl-2' : 'pl-2'}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-soviet-gray/40 text-[10px]">[{formatCampaignTime(log.timestamp)}]</span>
        <span className={`${categoryColors[log.category] || 'text-soviet-gray'} font-bold`}>
          {log.speaker || log.category.toUpperCase()}
        </span>
      </div>
      <div className={`${log.important ? 'text-soviet-redBright' : 'text-soviet-gray'} leading-relaxed`}>
        {log.title && <span className="font-bold">{log.title}: </span>}
        {log.content}
      </div>
    </div>
  );
};
