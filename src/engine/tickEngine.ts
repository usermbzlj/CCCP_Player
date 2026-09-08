import { useGameStore } from '../store/useGameStore';
import { processCombat } from './combatEngine';
import { processCommand } from './commandEngine';
import { processNuclearTick } from './nuclearEngine';
import { checkEndings } from './endingEngine';
import { Speed } from '../types/game';

let tickInterval: ReturnType<typeof setInterval> | null = null;
let tickAccumulator = 0;

const TICK_MS = 1000;

export function startTickEngine() {
  stopTickEngine();

  tickInterval = setInterval(() => {
    const state = useGameStore.getState();
    if (state.phase !== 'operational' && state.phase !== 'crisis') return;
    if (state.speed === 0) return;
    if (state.isLLMLoading) return;

    tickAccumulator += state.speed;

    while (tickAccumulator >= 1) {
      tickAccumulator -= 1;
      runSingleTick();
    }
  }, TICK_MS);
}

export function stopTickEngine() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

export function runSingleTick() {
  const state = useGameStore.getState();
  if (state.phase !== 'operational' && state.phase !== 'crisis') return;
  if (state.isLLMLoading) return;

  // Advance time
  state.tick();

  // Process orders
  processCommand();

  // Process combat
  processCombat();

  // Process nuclear countdown
  processNuclearTick();

  // Check endings
  checkEndings();
}

export function setGameSpeed(speed: Speed) {
  useGameStore.getState().setSpeed(speed);
}
