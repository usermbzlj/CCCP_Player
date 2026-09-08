import { useGameStore } from '../store/useGameStore';
import { chance } from '../utils/random';

export function processDiplomacyTick() {
  const state = useGameStore.getState();
  if (state.phase !== 'operational' && state.phase !== 'crisis') return;

  // Random diplomatic pressure changes
  if (chance(0.05)) {
    const delta = Math.random() > 0.5 ? 2 : -1;
    state.applyMetricDelta('diplomaticPressure', delta);
  }

  // Public panic follows diplomatic pressure and nuclear escalation
  if (state.campaignTime % 10 === 0) {
    const targetPanic =
      state.metrics.diplomaticPressure * 0.3 +
      state.metrics.nuclearEscalation * 0.4 +
      (100 - state.metrics.commandIntegrity) * 0.2;
    const diff = targetPanic - state.metrics.publicPanic;
    if (Math.abs(diff) > 5) {
      state.applyMetricDelta('publicPanic', Math.sign(diff) * 2);
    }
  }
}
