import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { ApiConfigScreen } from './components/boot/ApiConfigScreen';
import { BootSequence } from './components/boot/BootSequence';
import { MainDashboard } from './components/layout/MainDashboard';
import { EndingScreen } from './components/layout/EndingScreen';
import { startTickEngine, stopTickEngine } from './engine/tickEngine';
import { useLLMEvents } from './hooks/useLLMEvents';

function App() {
  const { phase, gameStarted } = useGameStore();

  // Start/stop tick engine
  useEffect(() => {
    if (gameStarted && phase !== 'ending') {
      startTickEngine();
    }
    return () => {
      stopTickEngine();
    };
  }, [gameStarted, phase]);

  // LLM events hook
  useLLMEvents();

  return (
    <div className="w-screen h-screen bg-soviet-black text-soviet-gray font-mono overflow-hidden">
      {phase === 'boot' || phase === 'api-test' ? (
        <ApiConfigScreen />
      ) : phase === 'initializing' ? (
        <BootSequence />
      ) : phase === 'ending' ? (
        <EndingScreen />
      ) : (
        <MainDashboard />
      )}
    </div>
  );
}

export default App;
