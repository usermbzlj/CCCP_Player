import { useGameStore } from '../store/useGameStore';
import { NuclearLevel, NuclearTarget, StavkaOpinion } from '../types/nuclear';
import { clamp } from '../utils/clamp';

export function escalateNuclearLevel() {
  const state = useGameStore.getState();
  const newLevel = clamp(state.nuclear.level + 1, 0, 5) as NuclearLevel;
  state.setNuclearState({ level: newLevel });

  const levelNames = [
    'Обычный режим — 常规作战',
    'Ядерное наблюдение — 核监视',
    'Предварительная готовность — 预备核戒备',
    'Тактический порог — 战术核门槛',
    'Стратегическое разрешение — 战略授权待定',
    'Необратимый протокол — 不可逆协议',
  ];

  state.addLog({
    category: 'nuclear',
    title: '核等级提升',
    content: `核状态升至等级 ${newLevel}：${levelNames[newLevel]}`,
    tone: 'horror',
    important: true,
  });

  state.applyMetricDelta('diplomaticPressure', 10);
  state.applyMetricDelta('nuclearEscalation', 15);
  state.applyMetricDelta('publicPanic', 8);

  if (newLevel >= 3) {
    state.applyMetricDelta('stavkaTrust', -5);
    state.applyMetricDelta('commandIntegrity', -5);
  }
}

export function generateTargetPackage(): NuclearTarget[] {
  return [
    { id: 'nt-1', name: '敌方装甲集群-Alpha', description: '北部突破口敌军主力', type: 'enemy-cluster' },
    { id: 'nt-2', name: '敌方机械化集结地', description: '中部战线敌方预备队', type: 'enemy-cluster' },
    { id: 'nt-3', name: '突破走廊', description: '阻止敌方向纵深推进', type: 'breakthrough-zone' },
    { id: 'nt-4', name: '高空示警区', description: '在敌方阵地上空进行示警爆炸', type: 'warning-burst' },
    { id: 'nt-5', name: '敌方战区司令部', description: '高价值指挥目标', type: 'strategic' },
  ];
}

export function generateStavkaOpinions(): StavkaOpinion[] {
  return [
    { role: '总参谋长', name: '库罗帕特金大将', stance: 'oppose', argument: '一旦跨过核门槛，就没有回头路。常规力量仍足以稳住战线。' },
    { role: '前线司令', name: '罗科索夫斯基元帅', stance: 'support', argument: '敌人正在突破！没有战术核打击，整个北方集群都会被歼灭！' },
    { role: '政治委员', name: '日丹诺夫同志', stance: 'hesitate', argument: '这需要最高政治局的批准。我们的意识形态不允许轻易毁灭世界。' },
  ];
}

export function executeNuclearStrike(targetId: string, strikeType: 'tactical' | 'area-denial' | 'warning-burst') {
  const state = useGameStore.getState();
  const targets = state.nuclear.targetPackage?.targets || [];
  const target = targets.find((t) => t.id === targetId);

  if (!target) return;

  // Apply abstract damage to enemy units near the target
  state.units.forEach((unit) => {
    if (unit.faction === 'enemy') {
      const dist = Math.abs(unit.position.x - 15); // abstract target center
      if (dist < 5) {
        const damage = strikeType === 'tactical' ? 60 : strikeType === 'area-denial' ? 40 : 20;
        state.updateUnit(unit.id, {
          strength: Math.max(0, unit.strength - damage),
          morale: Math.max(0, unit.morale - 30),
          status: 'disrupted',
        });
      }
    }
    if (unit.faction === 'soviet') {
      const dist = Math.abs(unit.position.x - 15);
      if (dist < 3) {
        state.updateUnit(unit.id, {
          strength: Math.max(0, unit.strength - 20),
          morale: Math.max(0, unit.morale - 20),
        });
      }
    }
  });

  // Severe metric impacts
  state.applyMetricDelta('commandIntegrity', -20);
  state.applyMetricDelta('diplomaticPressure', 30);
  state.applyMetricDelta('nuclearEscalation', 25);
  state.applyMetricDelta('publicPanic', 30);
  state.applyMetricDelta('stavkaTrust', -15);
  state.applyMetricDelta('strategicAdvantage', 15);

  state.setNuclearState({
    authorizationStage: 'executed',
    lastAction: `执行${strikeType === 'tactical' ? '战术核打击' : strikeType === 'area-denial' ? '区域拒止打击' : '示警性高空爆炸'}于${target.name}`,
  });

  state.addLog({
    category: 'nuclear',
    title: '核打击已执行',
    content: `${target.name}遭到核打击。冲击波正在扩散。`,
    tone: 'horror',
    important: true,
  });
}

export function abortNuclearProtocol() {
  const state = useGameStore.getState();
  state.setNuclearState({
    protocolActive: false,
    authorizationStage: 'aborted',
    countdown: undefined,
    targetPackage: undefined,
    irreversible: false,
  });
  state.applyMetricDelta('stavkaTrust', -10);
  state.applyMetricDelta('commandIntegrity', -5);
  state.applyMetricDelta('nuclearEscalation', -5);
  state.setPhase('operational');
  state.addLog({
    category: 'nuclear',
    title: '核流程中止',
    content: '操作员中止了核授权流程。总参谋部对此表示强烈不满。',
    tone: 'cold',
    important: true,
  });
}

export function processNuclearTick() {
  const state = useGameStore.getState();
  if (!state.nuclear.protocolActive) return;

  if (state.nuclear.countdown !== undefined && state.nuclear.countdown > 0) {
    const newCountdown = state.nuclear.countdown - 1;
    state.setNuclearState({ countdown: newCountdown });

    if (newCountdown <= 0 && state.nuclear.irreversible) {
      // Auto-execute if irreversible
      const targetId = state.nuclear.targetPackage?.selectedTargetId;
      if (targetId) {
        executeNuclearStrike(targetId, 'tactical');
      }
    }
  }
}

export function checkNuclearUnlock(): boolean {
  const state = useGameStore.getState();
  const m = state.metrics;

  const shouldUnlock =
    m.strategicAdvantage < -30 ||
    m.commandIntegrity < 40 ||
    m.nuclearEscalation > 50 ||
    m.stavkaTrust < 30;

  if (shouldUnlock && state.nuclear.level === 0) {
    state.setNuclearState({
      level: 1,
      protocolActive: false,
      authorizationStage: 'none',
    });
    state.addLog({
      category: 'nuclear',
      title: '核监视启动',
      content: 'Ядерное наблюдение — 系统已进入核监视状态。',
      tone: 'horror',
    });
    return true;
  }

  return false;
}
