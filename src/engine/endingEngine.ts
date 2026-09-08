import { useGameStore } from '../store/useGameStore';
import { EndingType } from '../types/game';
import { getEndingInfo } from '../data/endings';

export function checkEndings() {
  const state = useGameStore.getState();
  if (state.phase === 'ending') return;

  const m = state.metrics;
  let ending: EndingType | undefined;

  // Primary failure: command integrity
  if (m.commandIntegrity <= 0) {
    ending = 'command-collapse';
  }
  // System takeover
  else if (m.systemIntegrity <= 10 && m.commandIntegrity < 30) {
    ending = 'system-takeover';
  }
  // Coup
  else if (m.stavkaTrust <= 0 && m.commandIntegrity < 40) {
    ending = 'coup';
  }
  // Nuclear winter
  else if (m.nuclearEscalation >= 100) {
    ending = 'nuclear-winter';
  }
  // Conventional victory
  else if (m.strategicAdvantage >= 60 && m.commandIntegrity >= 50) {
    const enemyUnits = state.units.filter((u) => u.faction === 'enemy' && u.strength > 0);
    if (enemyUnits.length <= 2) {
      ending = 'conventional-victory';
    }
  }
  // Pyrrhic victory
  else if (m.strategicAdvantage >= 40 && m.commandIntegrity < 30) {
    ending = 'pyrrhic-victory';
  }
  // Ceasefire
  else if (m.diplomaticPressure >= 85 && m.nuclearEscalation < 80) {
    ending = 'ceasefire';
  }
  // Tactical nuclear victory
  else if (state.nuclear.authorizationStage === 'executed' && m.strategicAdvantage > 20 && m.nuclearEscalation < 100) {
    ending = 'tactical-nuclear-victory';
  }

  if (ending) {
    triggerEnding(ending);
  }
}

export function triggerEnding(ending: EndingType) {
  const state = useGameStore.getState();
  const info = getEndingInfo(ending);

  state.setEnding(ending);
  state.addLog({
    category: 'system',
    title: info.title,
    content: info.description,
    tone: info.tone === 'triumph' ? 'propaganda' : info.tone === 'bitter' ? 'cold' : 'horror',
    important: true,
  });
}
