import { useGameStore } from '../store/useGameStore';
import { Order, Unit, UnitStatus, OrderType } from '../types/units';
import { distance, isValidPosition } from './validation';
import { chance, randFloat } from '../utils/random';

export function issueOrder(order: Omit<Order, 'id' | 'issuedAt' | 'status' | 'progress'>): Order {
  const state = useGameStore.getState();
  const id = `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const fullOrder: Order = {
    ...order,
    id,
    issuedAt: state.campaignTime,
    status: 'queued',
    progress: 0,
  };

  // Execute immediately for now (simplified)
  executeOrder(fullOrder);
  return fullOrder;
}

function executeOrder(order: Order) {
  const state = useGameStore.getState();
  const unit = state.units.find((u) => u.id === order.sourceUnitId);
  if (!unit) return;

  // Check disobedience
  const disobeyChance = calculateDisobeyChance(unit, order);
  if (chance(disobeyChance)) {
    order.status = 'refused';
    state.addLog({
      category: 'frontline',
      title: `${unit.name}拒绝执行命令`,
      content: `${unit.commander?.name || '该单位'}拒绝执行${getOrderLabel(order.type)}。士气过低或通信不稳。`,
      speaker: unit.commander?.name || '前线',
      tone: 'panic',
      important: true,
    });
    state.applyMetricDelta('commandIntegrity', -3);
    state.applyMetricDelta('stavkaTrust', -2);
    return;
  }

  // Check command delay
  const delayChance = 1 - (state.metrics.commsStability / 100) * 0.5;
  if (chance(delayChance * 0.3)) {
    order.status = 'delayed';
    state.addLog({
      category: 'system',
      title: '命令延迟',
      content: `向${unit.name}下达的命令因通信干扰被延迟。`,
      tone: 'terminal',
    });
    return;
  }

  order.status = 'executing';

  switch (order.type) {
    case 'advance':
      handleAdvance(unit, order);
      break;
    case 'retreat':
      handleRetreat(unit, order);
      break;
    case 'flank':
      handleFlank(unit, order);
      break;
    case 'hold':
      handleHold(unit);
      break;
    case 'regroup':
      handleRegroup(unit);
      break;
    case 'artillery':
    case 'rocket':
    case 'missile':
      handleFireSupport(unit, order);
      break;
    case 'airSupport':
      handleAirSupport(unit, order);
      break;
    case 'electronicWarfare':
      handleElectronicWarfare(unit);
      break;
    case 'cyber':
      handleCyber(unit);
      break;
    case 'restoreComms':
      handleRestoreComms(unit);
      break;
    case 'politicalOfficer':
      handlePoliticalOfficer(unit);
      break;
    case 'replaceCommander':
      handleReplaceCommander(unit);
      break;
    case 'stabilize':
      handleStabilize(unit);
      break;
    case 'requestStavka':
      handleRequestStavka(unit);
      break;
    case 'nuclear':
      handleNuclear(unit);
      break;
    default:
      order.status = 'failed';
  }
}

function calculateDisobeyChance(unit: Unit, order: Order): number {
  let chance = 0;
  if (unit.morale < 40) chance += 0.2;
  if (unit.morale < 20) chance += 0.3;
  if (unit.comms < 40) chance += 0.15;
  if (unit.commander && unit.commander.loyalty < 50) chance += 0.2;
  if (order.risk === 'high') chance += 0.1;
  if (order.risk === 'extreme') chance += 0.25;
  if (unit.status === 'disobeying') chance += 0.3;
  return Math.min(0.8, chance);
}

function getOrderLabel(type: OrderType): string {
  const labels: Record<OrderType, string> = {
    advance: '推进',
    retreat: '撤退',
    flank: '侧翼机动',
    hold: '固守',
    regroup: '重新集结',
    artillery: '炮兵压制',
    rocket: '火箭覆盖',
    missile: '战术导弹打击',
    airSupport: '空中支援请求',
    electronicWarfare: '电子干扰',
    cyber: '网络战行动',
    restoreComms: '恢复通信',
    politicalOfficer: '派遣政治委员',
    replaceCommander: '更换前线指挥官',
    stabilize: '稳定军心',
    requestStavka: '请求总参授权',
    nuclear: '核选项',
  };
  return labels[type] || type;
}

function handleAdvance(unit: Unit, order: Order) {
  const state = useGameStore.getState();
  let targetPos = order.targetPosition;
  if (!targetPos) {
    // Default: move towards nearest enemy
    const enemies = state.units.filter((u) => u.faction === 'enemy' && u.strength > 0);
    if (enemies.length > 0) {
      const nearest = enemies.reduce((best, u) =>
        distance(unit.position, u.position) < distance(unit.position, best.position) ? u : best
      );
      const dx = Math.sign(nearest.position.x - unit.position.x);
      const dy = Math.sign(nearest.position.y - unit.position.y);
      targetPos = { x: unit.position.x + dx, y: unit.position.y + dy };
    } else {
      targetPos = { x: unit.position.x + 1, y: unit.position.y };
    }
  }

  if (isValidPosition(targetPos)) {
    state.updateUnit(unit.id, {
      position: targetPos,
      status: 'advancing',
      fuel: Math.max(0, unit.fuel - 5),
    });
  }
}

function handleRetreat(unit: Unit, order: Order) {
  const state = useGameStore.getState();
  const dx = unit.faction === 'soviet' ? -1 : 1;
  const newPos = { x: Math.max(0, unit.position.x + dx), y: unit.position.y };
  state.updateUnit(unit.id, {
    position: newPos,
    status: 'retreating',
    morale: Math.max(0, unit.morale - 5),
  });
  state.applyMetricDelta('commandIntegrity', -1);
}

function handleFlank(unit: Unit, order: Order) {
  const state = useGameStore.getState();
  const enemies = state.units.filter((u) => u.faction === 'enemy' && u.strength > 0);
  if (enemies.length === 0) return;

  const target = enemies[0];
  const flankPos = {
    x: target.position.x,
    y: target.position.y + (unit.position.y < target.position.y ? -2 : 2),
  };

  if (isValidPosition(flankPos)) {
    state.updateUnit(unit.id, {
      position: flankPos,
      status: 'advancing',
      fuel: Math.max(0, unit.fuel - 8),
    });
    // Flank bonus: damage enemy
    state.updateUnit(target.id, { strength: Math.max(0, target.strength - 15), morale: Math.max(0, target.morale - 10) });
  }
}

function handleHold(unit: Unit) {
  const state = useGameStore.getState();
  state.updateUnit(unit.id, { status: 'holding' });
}

function handleRegroup(unit: Unit) {
  const state = useGameStore.getState();
  state.updateUnit(unit.id, {
    status: 'idle',
    morale: Math.min(100, unit.morale + 10),
    readiness: Math.min(100, unit.readiness + 15),
    supply: Math.min(100, unit.supply + 10),
  });
}

function handleFireSupport(unit: Unit, order: Order) {
  const state = useGameStore.getState();
  const target = state.units.find((u) => u.id === order.targetUnitId);
  if (!target || target.faction === unit.faction) {
    state.addLog({ category: 'system', title: '打击失败', content: '目标无效', tone: 'terminal' });
    return;
  }

  const dist = distance(unit.position, target.position);
  const maxRange = unit.type === 'artillery' ? 6 : unit.type === 'rocket' ? 8 : 10;

  if (dist > maxRange) {
    state.addLog({ category: 'system', title: '超出射程', content: `${unit.name}无法够到目标`, tone: 'terminal' });
    return;
  }

  const accuracy = (state.metrics.intelReliability / 100) * (unit.readiness / 100);
  if (chance(accuracy)) {
    const damage = unit.type === 'artillery' ? 20 : unit.type === 'rocket' ? 30 : 40;
    state.updateUnit(target.id, {
      strength: Math.max(0, target.strength - damage),
      morale: Math.max(0, target.morale - 15),
      status: 'suppressed',
    });
    state.addLog({
      category: 'frontline',
      title: `${getOrderLabel(order.type)}命中`,
      content: `${unit.name}成功打击${target.name}。`,
      tone: 'military',
      important: true,
    });
    state.applyMetricDelta('strategicAdvantage', 2);
  } else {
    state.addLog({
      category: 'frontline',
      title: '打击偏离',
      content: `${unit.name}的${getOrderLabel(order.type)}未能有效命中目标。`,
      tone: 'panic',
    });
    state.applyMetricDelta('intelReliability', -2);
  }

  state.updateUnit(unit.id, { ammo: Math.max(0, unit.ammo - 15), cooldown: unit.type === 'artillery' ? 4 : 6 });
}

function handleAirSupport(unit: Unit, order: Order) {
  const state = useGameStore.getState();
  const target = state.units.find((u) => u.id === order.targetUnitId);
  if (!target) return;

  if (chance(0.6)) {
    state.updateUnit(target.id, {
      strength: Math.max(0, target.strength - 25),
      morale: Math.max(0, target.morale - 10),
    });
    state.addLog({ category: 'frontline', title: '空中支援到达', content: '战术航空队成功打击目标。', tone: 'military' });
  } else {
    state.addLog({ category: 'frontline', title: '空中支援未能到达', content: '敌方防空火力干扰。', tone: 'panic' });
  }
}

function handleElectronicWarfare(unit: Unit) {
  const state = useGameStore.getState();
  if (chance(0.5)) {
    state.applyMetricDelta('commsStability', 5);
    state.applyMetricDelta('intelReliability', 5);
    state.addLog({ category: 'system', title: '电子干扰成功', content: '敌方通信受到干扰。', tone: 'terminal' });
  } else {
    state.applyMetricDelta('commsStability', -3);
    state.addLog({ category: 'system', title: '电子干扰失败', content: '敌方反制措施生效。', tone: 'terminal' });
  }
  state.updateUnit(unit.id, { cooldown: 4 });
}

function handleCyber(unit: Unit) {
  const state = useGameStore.getState();
  if (chance(0.4)) {
    state.applyMetricDelta('intelReliability', 8);
    state.addLog({ category: 'system', title: '网络战成功', content: '成功破坏敌方情报同步。', tone: 'terminal' });
  } else {
    state.applyMetricDelta('intelReliability', -5);
    state.applyMetricDelta('systemIntegrity', -3);
    state.addLog({ category: 'system', title: '网络战暴露', content: '敌方发现我方干预。', tone: 'horror' });
  }
  state.updateUnit(unit.id, { cooldown: 5 });
}

function handleRestoreComms(unit: Unit) {
  const state = useGameStore.getState();
  state.applyMetricDelta('commsStability', 10);
  state.units
    .filter((u) => u.faction === 'soviet' && u.comms < 80)
    .forEach((u) => {
      state.updateUnit(u.id, { comms: Math.min(100, u.comms + 15), status: u.status === 'comms-lost' ? 'idle' : u.status });
    });
  state.addLog({ category: 'system', title: '通信恢复', content: '通信链路已修复。', tone: 'terminal' });
}

function handlePoliticalOfficer(unit: Unit) {
  const state = useGameStore.getState();
  const target = state.units.find((u) => u.id === state.selectedUnitId && u.faction === 'soviet');
  if (target) {
    state.updateUnit(target.id, { morale: Math.min(100, target.morale + 15) });
    if (target.commander) {
      state.updateUnit(target.id, {
        commander: { ...target.commander, loyalty: Math.min(100, target.commander.loyalty + 10) },
      });
    }
  }
  state.applyMetricDelta('stavkaTrust', 2);
  state.addLog({ category: 'stavka', title: '政治委员介入', content: '政治委员已抵达前线，稳定军心。', tone: 'propaganda' });
}

function handleReplaceCommander(unit: Unit) {
  const state = useGameStore.getState();
  const target = state.units.find((u) => u.id === state.selectedUnitId && u.faction === 'soviet');
  if (target && target.commander) {
    state.updateUnit(target.id, {
      commander: {
        name: '新任命指挥官',
        loyalty: 80,
        aggressiveness: 50,
        experience: 60,
      },
      morale: Math.max(20, target.morale - 20),
    });
    state.applyMetricDelta('commandIntegrity', -5);
    state.applyMetricDelta('stavkaTrust', -3);
    state.addLog({ category: 'stavka', title: '指挥官更换', content: `${target.name}指挥官已被撤换。`, tone: 'cold' });
  }
}

function handleStabilize(unit: Unit) {
  const state = useGameStore.getState();
  state.units
    .filter((u) => u.faction === 'soviet' && u.morale < 60)
    .forEach((u) => {
      state.updateUnit(u.id, { morale: Math.min(100, u.morale + 8) });
    });
  state.applyMetricDelta('commandIntegrity', 3);
  state.addLog({ category: 'stavka', title: '稳定军心', content: '全军收到鼓舞士气命令。', tone: 'propaganda' });
}

function handleRequestStavka(unit: Unit) {
  const state = useGameStore.getState();
  state.applyMetricDelta('stavkaTrust', 3);
  state.addLog({ category: 'stavka', title: '总参授权', content: '总参谋部已批准高级作战权限。', tone: 'military' });
}

function handleNuclear(unit: Unit) {
  const state = useGameStore.getState();
  state.setNuclearState({
    protocolActive: true,
    authorizationStage: 'warning',
    level: Math.max(state.nuclear.level, 1) as 0 | 1 | 2 | 3 | 4 | 5,
  });
  state.setPhase('nuclear-protocol');
  state.addLog({ category: 'nuclear', title: '核协议启动', content: 'ЯДЕРНЫЙ ПРОТОКОЛ 已激活。', tone: 'horror', important: true });
}

export function processCommand() {
  // In this simplified version, commands execute immediately when issued.
  // Cooldowns are handled by decrementing unit.cooldown each tick.
  const state = useGameStore.getState();
  state.units.forEach((unit) => {
    if (unit.cooldown > 0) {
      state.updateUnit(unit.id, { cooldown: unit.cooldown - 1 });
    }
  });
}
