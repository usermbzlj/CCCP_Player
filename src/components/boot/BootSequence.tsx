import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { GlitchText } from '../ui/GlitchText';

const BOOT_LINES = [
  'КРАСНЫЙ КОМПЛЕКС v7.2.1987',
  '初始化核心神经网络...',
  '加载战略数据库...',
  '验证操作员权限...',
  '连接总参谋部通信链路...',
  '扫描战区态势...',
  '敌方目标识别模块... 就绪',
  '核协议子系统... 待机',
  '指挥链监控... 激活',
  '系统完整性检查... 通过',
  '',
  'ВНИМАНИЕ: 本系统为最高机密',
  '所有操作将被记录',
  '',
  '>>> 主机上线 <<<',
];

export const BootSequence: React.FC = () => {
  const { setPhase, startGame, addLog } = useGameStore();
  const { apiConfig } = useSettingsStore();
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(() => {
            addLog({
              category: 'system',
              title: '系统上线',
              content: `КРАСНЫЙ КОМПЛЕКС 已通过 ${apiConfig.modelId} 接入战略神经网络。等待总参谋部简报。`,
              tone: 'terminal',
              important: true,
            });
            startGame();
          }, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="w-screen h-screen bg-soviet-black flex items-center justify-center crt-container">
      <div className="w-full max-w-2xl p-8">
        <div className="mb-6 text-center">
          <GlitchText
            text="КРАСНЫЙ КОМПЛЕКС"
            className="text-3xl font-mono text-soviet-red text-glow-red tracking-widest"
            active={visibleLines < 5}
          />
          <div className="text-sm font-mono text-soviet-gray mt-2">苏联秘密超级计算机战略指挥模拟器</div>
        </div>

        <div className="bg-soviet-dark/50 border border-soviet-gray/30 p-6 font-mono text-sm text-soviet-green min-h-[300px]">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={line.startsWith('>>>') ? 'text-soviet-red mt-4' : ''}>
              {line ? `> ${line}` : ''}
            </div>
          ))}
          {visibleLines < BOOT_LINES.length && (
            <span className={`inline-block w-2 h-4 bg-soviet-green ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>

        <div className="mt-4 flex justify-between text-xs font-mono text-soviet-gray/50">
          <span>内存: 64MB</span>
          <span>CPU: ЭЛЬБРУС-2</span>
          <span>网络: 加密</span>
        </div>
      </div>
    </div>
  );
};
