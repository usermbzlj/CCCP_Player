import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { LLMClient } from '../../api/llmClient';
import { SovietButton } from '../ui/SovietButton';
import { SovietCard } from '../ui/SovietCard';

export const ApiConfigScreen: React.FC = () => {
  const { apiConfig, setAPIConfig } = useSettingsStore();
  const { setPhase } = useGameStore();
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    setError('');
    setTesting(true);

    if (!apiConfig.baseUrl || !apiConfig.apiKey || !apiConfig.modelId) {
      setError('请填写所有必填字段');
      setTesting(false);
      return;
    }

    const client = new LLMClient({
      baseUrl: apiConfig.baseUrl,
      apiKey: apiConfig.apiKey,
      modelId: apiConfig.modelId,
    });

    const result = await client.testConnection();
    setTesting(false);

    if (result.success) {
      setAPIConfig({ connected: true });
    } else {
      setAPIConfig({ connected: false });
      setError(result.error || '连接失败');
    }
  };

  const handleStart = () => {
    if (!apiConfig.connected) {
      setError('请先通过连接测试');
      return;
    }
    setPhase('initializing');
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-soviet-black crt-container">
      <div className="w-full max-w-lg">
        <SovietCard title={`${'КРАСНЫЙ КОМПЛЕКС'} — 系统接入配置`} className="border-soviet-red/50">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-soviet-gray mb-1 uppercase">Base URL</label>
              <input
                type="text"
                value={apiConfig.baseUrl}
                onChange={(e) => setAPIConfig({ baseUrl: e.target.value, connected: false })}
                placeholder="https://api.example.com/v1"
                className="w-full bg-soviet-black border border-soviet-gray/50 px-3 py-2 text-sm font-mono text-soviet-gray focus:border-soviet-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-soviet-gray mb-1 uppercase">API Key</label>
              <input
                type="password"
                value={apiConfig.apiKey}
                onChange={(e) => setAPIConfig({ apiKey: e.target.value, connected: false })}
                placeholder="sk-..."
                className="w-full bg-soviet-black border border-soviet-gray/50 px-3 py-2 text-sm font-mono text-soviet-gray focus:border-soviet-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-soviet-gray mb-1 uppercase">Model ID</label>
              <input
                type="text"
                value={apiConfig.modelId}
                onChange={(e) => setAPIConfig({ modelId: e.target.value, connected: false })}
                placeholder="gpt-4.1-mini"
                className="w-full bg-soviet-black border border-soviet-gray/50 px-3 py-2 text-sm font-mono text-soviet-gray focus:border-soviet-red focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={apiConfig.rememberSession}
                onChange={(e) => setAPIConfig({ rememberSession: e.target.checked })}
                className="accent-soviet-red"
              />
              <label htmlFor="remember" className="text-xs font-mono text-soviet-gray">
                记住本次会话（仅保存 Base URL 和 Model ID）
              </label>
            </div>

            {error && (
              <div className="border border-soviet-red bg-soviet-red/10 px-3 py-2 text-xs font-mono text-soviet-redBright">
                {error}
              </div>
            )}

            {apiConfig.connected && (
              <div className="border border-soviet-green bg-soviet-green/10 px-3 py-2 text-xs font-mono text-soviet-green">
                连接成功 — 系统就绪
              </div>
            )}

            <div className="flex gap-3">
              <SovietButton
                onClick={handleTest}
                disabled={testing}
                variant="warning"
                className="flex-1"
              >
                {testing ? '测试中...' : '连接测试'}
              </SovietButton>
              <SovietButton
                onClick={handleStart}
                variant="danger"
                className="flex-1"
              >
                启动系统
              </SovietButton>
            </div>
          </div>
        </SovietCard>

        <div className="mt-4 text-center text-xs font-mono text-soviet-gray/50">
          СЕКРЕТНО — 架空冷战战略模拟 — 不包含真实攻击信息
        </div>
      </div>
    </div>
  );
};
