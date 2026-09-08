import { useGameStore } from '../store/useGameStore';
import { GameEvent } from '../types/events';
import { chance, randInt } from '../utils/random';
import { checkNuclearUnlock } from './nuclearEngine';

const RANDOM_EVENTS: Array<Omit<GameEvent, 'id' | 'timestamp'>> = [
  {
    type: 'random',
    title: '通信干扰',
    description: '敌方电子战导致局部通信中断。',
    resolved: false,
    autoPause: false,
  },
  {
    type: 'random',
    title: '补给车队遭袭',
    description: '后方补给线遭到敌方空袭，物资损失严重。',
    resolved: false,
    autoPause: true,
  },
  {
    type: 'random',
    title: '士气波动',
    description: '前线部队士气出现不稳定迹象。',
    resolved: false,
    autoPause: false,
  },
  {
    type: 'random',
    title: '情报更新',
    description: '侦察机带回新的敌方部署情报。',
    resolved: false,
    autoPause: false,
  },
  {
    type: 'internal',
    title: '总参谋部分歧',
    description: '总参谋部内部就是否继续进攻产生严重分歧。',
    resolved: false,
    autoPause: true,
  },
  {
    type: 'combat',
    title: '局部交火',
    description: '前沿阵地与敌方发生激烈交火。',
    resolved: false,
    autoPause: false,
  },
];

export function processRandomEvents() {
  const state = useGameStore.getState();
  if (state.phase !== 'operational') return;

  // Periodic random event
  if (state.campaignTime > 0 && state.campaignTime % 20 === 0 && chance(0.4)) {
    const template = RANDOM_EVENTS[randInt(0, RANDOM_EVENTS.length - 1)];
    state.addEvent(template);

    if (template.autoPause) {
      state.setPhase('crisis');
    }

    // Apply minor effects
    if (template.title === '补给车队遭袭') {
      state.applyMetricDelta('commandIntegrity', -3);
      state.units
        .filter((u) => u.faction === 'soviet')
        .forEach((u) => {
          state.updateUnit(u.id, { supply: Math.max(0, u.supply - 10) });
        });
    } else if (template.title === '通信干扰') {
      state.applyMetricDelta('commsStability', -5);
    } else if (template.title === '士气波动') {
      state.units
        .filter((u) => u.faction === 'soviet')
        .forEach((u) => {
          state.updateUnit(u.id, { morale: Math.max(0, u.morale - 5) });
        });
    } else if (template.title === '情报更新') {
      state.applyMetricDelta('intelReliability', 5);
    }
  }

  // Check nuclear unlock
  checkNuclearUnlock();
}
