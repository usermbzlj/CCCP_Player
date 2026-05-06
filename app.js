const gridSize = 10;
const terrainNames = { plain: '平原', rough: '丘陵', river: '河谷', city: '城镇', forest: '林地' };
const terrainCost = { plain: 1, rough: 2, river: 2, city: 1, forest: 2 };

const cells = Array.from({ length: gridSize * gridSize }, (_, index) => {
  const terrainCycle = ['plain', 'plain', 'rough', 'forest', 'plain', 'river', 'plain', 'city', 'plain', 'rough'];
  return {
    id: index,
    label: `${String.fromCharCode(65 + (index % gridSize))}${Math.floor(index / gridSize) + 1}`,
    objective: [22, 47, 75].includes(index),
    terrain: terrainCycle[(index + Math.floor(index / 10)) % terrainCycle.length],
  };
});

const initialState = () => ({
  minute: 1,
  phase: '进行中',
  selectedCell: 75,
  selectedUnit: 'G1',
  weather: '低云/冻雨',
  eventCountdown: 3,
  supportCooldown: { artillery: 0, air: 0, missile: 0, emp: 0, nuclear: 0 },
  resources: { command: 9, supply: 78, intel: 34, political: 62, nukeCodes: 2 },
  metrics: { stability: 72, alarm: 18, hack: 0, objectivesHeld: 1, civilianRisk: 9 },
  objectives: [
    { id: 'OBJ-1', cell: 22, name: '北桥中继站', heldBy: 'enemy' },
    { id: 'OBJ-2', cell: 47, name: 'Dvina 雷达站', heldBy: 'contested' },
    { id: 'OBJ-3', cell: 75, name: '南线补给枢纽', heldBy: 'friendly' },
  ],
  units: [
    { id: 'G1', side: 'friendly', name: '第3近卫坦克集团', type: '重装', pos: 82, hp: 92, morale: 74, ammo: 78, entrench: 0, stealth: 10, order: '待命' },
    { id: 'G2', side: 'friendly', name: '第11机械化旅', type: '装甲', pos: 71, hp: 86, morale: 68, ammo: 72, entrench: 0, stealth: 18, order: '待命' },
    { id: 'G3', side: 'friendly', name: '第8火箭炮团', type: '火力', pos: 93, hp: 78, morale: 81, ammo: 85, entrench: 0, stealth: 8, order: '待命' },
    { id: 'G4', side: 'friendly', name: '第2电子战营', type: '电子', pos: 84, hp: 70, morale: 79, ammo: 40, entrench: 0, stealth: 28, order: '频谱监听' },
    { id: 'E1', side: 'enemy', name: '敌第4装甲师', type: '重装', pos: 14, hp: 88, morale: 67, ammo: 76, entrench: 0, stealth: 8, order: '集结' },
    { id: 'E2', side: 'enemy', name: '敌远征机步群', type: '装甲', pos: 26, hp: 82, morale: 62, ammo: 70, entrench: 0, stealth: 14, order: '侦察' },
    { id: 'E3', side: 'enemy', name: '敌重炮旅', type: '火力', pos: 38, hp: 74, morale: 58, ammo: 84, entrench: 0, stealth: 6, order: '校射' },
    { id: 'E4', side: 'enemy', name: '敌电子侦察连', type: '电子', pos: 5, hp: 64, morale: 60, ammo: 32, entrench: 0, stealth: 36, order: '测向' },
  ],
  log: [],
  events: [],
  history: [],
});

let state = initialState();

const $ = (id) => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const activeUnits = (side) => state.units.filter((unit) => unit.side === side && unit.hp > 0);

function boot() {
  loadApiConfig();
  renderAll();
  addLog('БИОС: 红色神谕启动。磁芯阵列稳定，阴极射线管同步。');
  addEvent('安全模拟模式：全部目标均为虚构沙盘节点。', 'good');
  bindEvents();
  setInterval(tickClock, 1000);
}

function bindEvents() {
  $('issueOrder').addEventListener('click', issueOrder);
  $('nextTurn').addEventListener('click', () => advanceSimulation('人工推进态势钟'));
  $('saveGame').addEventListener('click', saveGame);
  $('loadGame').addEventListener('click', loadGame);
  $('resetGame').addEventListener('click', resetGame);
  document.querySelectorAll('[data-support]').forEach((btn) => btn.addEventListener('click', () => callSupport(btn.dataset.support)));
  document.querySelectorAll('[data-ai]').forEach((btn) => btn.addEventListener('click', () => requestAi(btn.dataset.ai)));
  $('terminalForm').addEventListener('submit', runTerminalCommand);
  $('autoHack').addEventListener('click', autoHack);
  $('saveApi').addEventListener('click', saveApiConfig);
}

function tickClock() {
  $('clock').textContent = `${new Date().toISOString().slice(11, 19)} Z`;
}

function renderAll() {
  renderResources();
  renderObjectives();
  renderMap();
  renderUnits();
  renderHud();
  renderUnitSelect();
  renderCellIntel();
  renderEvents();
  updateButtonStates();
}

function renderHud() {
  $('turnBadge').textContent = `第 ${state.minute} 分钟｜${state.weather}`;
  $('outcomeBadge').textContent = state.phase;
}

function renderResources() {
  const items = [
    ['指挥点', state.resources.command, 'command'],
    ['补给', state.resources.supply, 'supply'],
    ['情报', state.resources.intel, 'intel'],
    ['政治资本', state.resources.political, 'political'],
    ['核授权码', state.resources.nukeCodes, 'nukeCodes'],
    ['国际警戒', state.metrics.alarm, 'alarm'],
    ['敌网渗透', state.metrics.hack, 'hack'],
  ];
  $('resourceGrid').innerHTML = items.map(([label, value, key]) => {
    const danger = (key === 'alarm' && value > 75) || (key !== 'alarm' && key !== 'hack' && value < 12);
    const warn = (key === 'alarm' && value > 55) || (key !== 'alarm' && key !== 'hack' && value < 25);
    return `<article class="resource-card ${danger ? 'danger' : warn ? 'warn' : ''}">${label}<strong>${value}</strong></article>`;
  }).join('');
}

function renderObjectives() {
  $('objectives').innerHTML = state.objectives.map((obj) => {
    const status = obj.heldBy === 'friendly' ? 'done' : obj.heldBy === 'enemy' ? 'fail' : '';
    const holder = { friendly: '己方控制', enemy: '敌方控制', contested: '争夺中' }[obj.heldBy];
    return `<div class="objective-row ${status}">${obj.id} ${obj.name}（${cells[obj.cell].label}）：<b>${holder}</b></div>`;
  }).join('');
}

function renderUnitSelect() {
  const select = $('unitSelect');
  select.innerHTML = activeUnits('friendly')
    .map((unit) => `<option value="${unit.id}">${unit.id} ${unit.name}</option>`)
    .join('');
  select.value = state.selectedUnit;
  select.onchange = () => { state.selectedUnit = select.value; renderAll(); };
}

function renderMap() {
  $('map').innerHTML = cells.map((cell) => {
    const unitsHere = state.units.filter((unit) => unit.pos === cell.id && unit.hp > 0);
    const selected = state.selectedCell === cell.id ? 'selected' : '';
    const tokens = unitsHere.map((unit) => {
      const heavy = unit.type === '重装' ? ' heavy' : '';
      const hidden = unit.side === 'enemy' && unit.stealth > state.resources.intel ? ' hidden' : '';
      const label = hidden ? '??' : unit.id;
      return `<span title="${unit.name}" class="token ${unit.side}${heavy}${hidden}">${label}</span>`;
    }).join('');
    const objective = cell.objective ? ' objective-zone' : '';
    return `<button class="cell ${cell.terrain}${objective} ${selected}" data-cell="${cell.id}">
      <span class="cell-label">${cell.label}</span><br>${tokens}<span class="terrain-mark">${terrainNames[cell.terrain]}</span>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-cell]').forEach((cellButton) => {
    cellButton.addEventListener('click', () => selectCell(Number(cellButton.dataset.cell)));
  });
}

function renderUnits() {
  $('unitCards').innerHTML = state.units.map((unit) => {
    const selected = unit.id === state.selectedUnit ? 'selected' : '';
    const visibleName = unit.side === 'enemy' && unit.stealth > state.resources.intel ? '未知敌方信号' : unit.name;
    return `<article class="unit-card ${unit.side} ${selected}" data-unit="${unit.id}">
      <strong>${unit.id} ${visibleName}</strong>
      <div class="unit-tags"><span class="tag">${unit.side === 'friendly' ? '己方' : '敌方'}</span><span class="tag">${unit.type}</span><span class="tag">${cells[unit.pos].label}</span></div>
      命令：${unit.order}<br>
      弹药 ${unit.ammo}% ｜ 士气 ${unit.morale}% ｜ 工事 ${unit.entrench}
      <div class="meter" title="战斗力"><span style="width:${unit.hp}%"></span></div>
      战斗力 ${unit.hp}%
    </article>`;
  }).join('');
  document.querySelectorAll('[data-unit]').forEach((card) => card.addEventListener('click', () => {
    const unit = state.units.find((item) => item.id === card.dataset.unit);
    if (unit?.side === 'friendly') state.selectedUnit = unit.id;
    state.selectedCell = unit?.pos ?? state.selectedCell;
    renderAll();
  }));
}

function renderCellIntel() {
  const cell = cells[state.selectedCell];
  const units = state.units.filter((unit) => unit.pos === cell.id && unit.hp > 0);
  const objective = state.objectives.find((obj) => obj.cell === cell.id);
  $('cellIntel').innerHTML = `
    <b>${cell.label}</b>｜地形：${terrainNames[cell.terrain]}｜机动消耗：${terrainCost[cell.terrain]}<br>
    ${objective ? `目标：${objective.name}（${objective.heldBy}）<br>` : '目标：无<br>'}
    单位：${units.length ? units.map((unit) => `${unit.id} ${unit.name}`).join('；') : '无'}<br>
    建议：${cell.objective ? '控制该格可推进胜利条件。' : cell.terrain === 'river' ? '河谷会拖慢推进，适合伏击。' : '可作为机动或火力观察点。'}
  `;
}

function renderEvents() {
  $('eventFeed').innerHTML = state.events.slice(-80).map((item) => `<div class="event-line ${item.level}">${escapeHtml(item.text)}</div>`).join('');
  $('eventFeed').scrollTop = $('eventFeed').scrollHeight;
}

function selectCell(id) {
  state.selectedCell = id;
  $('targetInput').value = cells[id].label;
  renderAll();
}

function updateButtonStates() {
  const locked = state.phase !== '进行中';
  // 初学者提示：只锁定会推进战局的按钮，复盘、存档和 LLM 反馈仍可使用。
  const selectors = ['#issueOrder', '#nextTurn', '#autoHack', '[data-support]'];
  document.querySelectorAll(selectors.join(',')).forEach((button) => { button.disabled = locked; });
}

function issueOrder() {
  if (state.phase !== '进行中') return;
  const unit = state.units.find((item) => item.id === $('unitSelect').value && item.hp > 0);
  if (!unit) return;
  const order = $('orderSelect').value;
  const targetCell = state.selectedCell;
  const targetText = $('targetInput').value.trim() || cells[targetCell].label;
  const extraCost = ['repair', 'resupply'].includes(order) ? { supply: order === 'repair' ? 6 : 8 } : {};
  if (!canAfford({ command: 1, ...extraCost })) return;
  pay({ command: 1, ...extraCost });
  const orderNames = { advance: '推进', defend: '防御', recon: '侦察', repair: '抢修', jam: '干扰', resupply: '补给', feint: '佯动' };
  unit.order = `${orderNames[order]} → ${targetText}`;

  // 初学者提示：这里的“命令”只修改浏览器内存中的 state，不会控制任何真实系统。
  if (order === 'advance') moveToward(unit, targetCell, 2);
  if (order === 'defend') { unit.entrench = clamp(unit.entrench + 2, 0, 6); unit.morale = clamp(unit.morale + rand(2, 5), 0, 100); }
  if (order === 'recon') { gain('intel', rand(6, 12)); state.metrics.hack = clamp(state.metrics.hack + rand(4, 8), 0, 100); }
  if (order === 'repair') unit.hp = clamp(unit.hp + rand(8, 16), 0, 100);
  if (order === 'jam') { state.metrics.hack = clamp(state.metrics.hack + rand(5, 10), 0, 100); enemyPenalty(rand(2, 5)); }
  if (order === 'resupply') unit.ammo = clamp(unit.ammo + rand(15, 28), 0, 100);
  if (order === 'feint') { unit.stealth = clamp(unit.stealth + rand(5, 12), 0, 50); state.metrics.alarm = clamp(state.metrics.alarm - rand(1, 4), 0, 100); }

  addLog(`${unit.name} 执行 ${unit.order}。`);
  advanceSimulation('己方命令周期完成');
}

function callSupport(type) {
  if (state.phase !== '进行中') return;
  const specs = {
    artillery: { name: '炮兵齐射', command: 1, supply: 7, alarm: 3, min: 9, max: 20, cd: 1 },
    air: { name: '远程航空打击', command: 2, supply: 10, alarm: 7, min: 12, max: 26, cd: 2 },
    missile: { name: '战役导弹', command: 3, supply: 16, alarm: 13, min: 20, max: 36, cd: 3 },
    emp: { name: '电磁脉冲弹', command: 2, supply: 12, alarm: 10, min: 5, max: 12, cd: 3 },
    nuclear: { name: '核打击授权', command: 4, supply: 24, alarm: 60, min: 52, max: 78, cd: 9 },
  };
  const spec = specs[type];
  const target = chooseTargetForSupport();
  if (!target) { addLog('目标阵列为空：敌方活动集群已被压制。'); return; }
  if (state.supportCooldown[type] > 0) { addLog(`${spec.name} 冷却中：${state.supportCooldown[type]} 分钟。`, 'warn'); return; }
  const cost = { command: spec.command, supply: spec.supply, ...(type === 'nuclear' ? { political: 42, nukeCodes: 1 } : {}) };
  if (!canAfford(cost)) return;
  pay(cost);

  state.supportCooldown[type] = spec.cd;
  state.metrics.alarm = clamp(state.metrics.alarm + spec.alarm, 0, 100);
  state.metrics.stability = clamp(state.metrics.stability - Math.ceil(spec.alarm / 3), 0, 100);
  const damage = rand(spec.min, spec.max) + Math.floor(state.resources.intel / 18);
  target.hp = clamp(target.hp - damage, 0, 100);
  target.morale = clamp(target.morale - rand(5, type === 'nuclear' ? 48 : 16), 0, 100);
  if (type === 'emp') state.metrics.hack = clamp(state.metrics.hack + rand(12, 20), 0, 100);
  const level = type === 'nuclear' ? 'danger' : type === 'missile' || type === 'emp' ? 'warn' : '';
  addLog(`${spec.name} 命中 ${target.name}，模拟毁伤 ${damage}%。`, level);
  addEvent(type === 'nuclear' ? '核门槛被跨越：全球危机频道出现红色告警。' : `${spec.name} 引发远端传感器尖峰。`, level);
  advanceSimulation(`${spec.name} 请求完成`);
}

function autoHack() {
  if (state.phase !== '进行中') return;
  if (!spend('intel', 5)) return;
  const gainValue = rand(8, 16);
  const risk = rand(3, 9);
  state.metrics.hack = clamp(state.metrics.hack + gainValue, 0, 100);
  state.metrics.alarm = clamp(state.metrics.alarm + risk, 0, 100);
  addLog(`敌网渗透：捕获虚构遥测帧 +${gainValue}%，反侦测风险 +${risk}%。`, 'warn');
  if (state.metrics.hack >= 100) addEvent('敌方战术链路被沙盘接管：敌单位下回合行动混乱。', 'good');
  advanceSimulation('自动渗透周期完成');
}

function advanceSimulation(reason) {
  if (state.phase !== '进行中') return;
  state.minute += 1;
  state.resources.command = clamp(state.resources.command + 3, 0, 12);
  state.resources.supply = clamp(state.resources.supply + rand(1, 4), 0, 100);
  Object.keys(state.supportCooldown).forEach((key) => { state.supportCooldown[key] = Math.max(0, state.supportCooldown[key] - 1); });
  enemyTurn();
  resolveContact();
  updateObjectives();
  triggerEventIfNeeded();
  updateStrategicScores();
  checkOutcome();
  state.history.push(snapshot(reason));
  addLog(`态势推进：${reason}。`);
  renderAll();
}

function enemyTurn() {
  activeUnits('enemy').forEach((enemy) => {
    const target = nearest(enemy, activeUnits('friendly'));
    if (!target) return;
    const confused = state.metrics.hack >= 100 || Math.random() < state.metrics.hack / 240;
    if (confused) {
      enemy.order = '链路混乱';
      enemy.morale = clamp(enemy.morale - rand(3, 8), 0, 100);
      return;
    }
    const objective = nearestObjective(enemy.pos, 'friendly') || nearestObjective(enemy.pos, 'contested');
    enemy.order = enemy.type === '火力' ? '远程压制' : objective ? `夺取 ${objective.name}` : '压迫接触线';
    moveToward(enemy, objective?.cell ?? target.pos, enemy.type === '重装' ? 1 : 2);
    if (enemy.type === '电子') state.metrics.hack = clamp(state.metrics.hack - rand(1, 4), 0, 100);
  });
}

function resolveContact() {
  activeUnits('friendly').forEach((friendly) => {
    const enemy = nearest(friendly, activeUnits('enemy'));
    if (!enemy) return;
    const range = friendly.type === '火力' ? 3 : 1;
    if (distance(friendly.pos, enemy.pos) <= range) {
      const friendlyHit = combatRoll(friendly, enemy);
      const enemyHit = combatRoll(enemy, friendly);
      enemy.hp = clamp(enemy.hp - friendlyHit, 0, 100);
      friendly.hp = clamp(friendly.hp - Math.floor(enemyHit * (1 - friendly.entrench * 0.08)), 0, 100);
      friendly.ammo = clamp(friendly.ammo - rand(3, 8), 0, 100);
      enemy.ammo = clamp(enemy.ammo - rand(3, 8), 0, 100);
      addLog(`交火：${friendly.name} 对 ${enemy.name} 造成 ${friendlyHit}%，己方承受 ${enemyHit}%。`, 'warn');
    }
  });
}

function combatRoll(attacker, defender) {
  const typeBonus = attacker.type === '重装' ? 5 : attacker.type === '火力' ? 7 : attacker.type === '电子' ? -1 : 2;
  const ammoPenalty = attacker.ammo < 20 ? -5 : 0;
  const moraleBonus = Math.floor(attacker.morale / 25);
  const terrainPenalty = cells[defender.pos].terrain === 'city' || cells[defender.pos].terrain === 'forest' ? -2 : 0;
  return clamp(rand(4, 12) + typeBonus + moraleBonus + ammoPenalty + terrainPenalty, 0, 26);
}

function updateObjectives() {
  state.objectives.forEach((obj) => {
    const friendly = activeUnits('friendly').some((unit) => distance(unit.pos, obj.cell) <= 1);
    const enemy = activeUnits('enemy').some((unit) => distance(unit.pos, obj.cell) <= 1);
    obj.heldBy = friendly && enemy ? 'contested' : friendly ? 'friendly' : enemy ? 'enemy' : obj.heldBy;
  });
  state.metrics.objectivesHeld = state.objectives.filter((obj) => obj.heldBy === 'friendly').length;
}

function triggerEventIfNeeded() {
  state.eventCountdown -= 1;
  if (state.eventCountdown > 0) return;
  state.eventCountdown = rand(2, 4);
  const events = [
    () => { state.weather = '电离层扰动'; state.metrics.hack = clamp(state.metrics.hack + 5, 0, 100); return ['电离层扰动增强，敌我通信同时出现雪花噪声。', 'warn']; },
    () => { gain('supply', 9); return ['后方列车抵达，补给上升。', 'good']; },
    () => { state.metrics.alarm = clamp(state.metrics.alarm + 6, 0, 100); return ['境外记者拍到火光，新闻压力上升。', 'warn']; },
    () => { enemyPenalty(5); return ['敌军指挥网出现短暂回声，士气下降。', 'good']; },
    () => { state.resources.political = clamp(state.resources.political - 5, 0, 100); return ['外交照会抵达，政治资本被消耗。', 'warn']; },
  ];
  const [text, level] = events[rand(0, events.length - 1)]();
  addEvent(text, level);
}

function updateStrategicScores() {
  const friendlyPower = sumPower('friendly');
  const enemyPower = sumPower('enemy');
  state.metrics.stability = clamp(state.metrics.stability + Math.sign(friendlyPower - enemyPower) * rand(0, 2) + state.metrics.objectivesHeld - 2, 0, 100);
  state.metrics.civilianRisk = clamp(state.metrics.civilianRisk + (state.metrics.alarm > 70 ? rand(1, 4) : 0), 0, 100);
  if (state.metrics.hack >= 100) state.metrics.hack = 84;
  if (state.metrics.alarm > 80) addEvent('外交频道出现密集质询，危机升级。', 'danger');
}

function checkOutcome() {
  const enemyHeavyAlive = activeUnits('enemy').some((unit) => unit.type === '重装' && unit.hp > 25);
  if (state.metrics.objectivesHeld >= 2 && !enemyHeavyAlive && state.metrics.alarm < 85) finishGame('胜利：北方钢雨被遏止');
  if (state.metrics.alarm >= 100) finishGame('失败：国际警戒失控');
  if (activeUnits('friendly').length === 0) finishGame('失败：己方集群失去战斗力');
  if (state.minute > 18 && state.metrics.objectivesHeld < 2) finishGame('失败：战役窗口关闭');
}

function finishGame(outcome) {
  state.phase = outcome;
  $('afterAction').textContent = buildReport();
  addEvent(outcome, outcome.startsWith('胜利') ? 'good' : 'danger');
}

function moveToward(unit, targetPos, steps) {
  let x = unit.pos % gridSize;
  let y = Math.floor(unit.pos / gridSize);
  const tx = targetPos % gridSize;
  const ty = Math.floor(targetPos / gridSize);
  for (let i = 0; i < steps; i += 1) {
    if (x !== tx) x += Math.sign(tx - x);
    else if (y !== ty) y += Math.sign(ty - y);
    const next = y * gridSize + x;
    if (terrainCost[cells[next].terrain] > 1 && i + 1 < steps) i += 1;
  }
  unit.pos = clamp(y, 0, gridSize - 1) * gridSize + clamp(x, 0, gridSize - 1);
}

function chooseTargetForSupport() {
  const unitsAtCell = activeUnits('enemy').filter((unit) => unit.pos === state.selectedCell);
  return unitsAtCell[0] || nearest({ pos: state.selectedCell }, activeUnits('enemy'));
}
function nearestObjective(pos, heldBy) { return state.objectives.filter((obj) => obj.heldBy === heldBy).sort((a, b) => distance(pos, a.cell) - distance(pos, b.cell))[0]; }
function nearest(unit, list) { return !unit || list.length === 0 ? null : list.slice().sort((a, b) => distance(unit.pos, a.pos) - distance(unit.pos, b.pos))[0]; }
function distance(a, b) { return Math.abs((a % gridSize) - (b % gridSize)) + Math.abs(Math.floor(a / gridSize) - Math.floor(b / gridSize)); }
function sumPower(side) { return activeUnits(side).reduce((sum, unit) => sum + unit.hp + unit.morale / 2 + unit.ammo / 4, 0); }
function enemyPenalty(amount) { activeUnits('enemy').forEach((unit) => { unit.morale = clamp(unit.morale - amount, 0, 100); }); }

function canAfford(cost) {
  const missing = Object.entries(cost).find(([key, amount]) => state.resources[key] < amount);
  if (!missing) return true;
  addLog(`${resourceName(missing[0])}不足：需要 ${missing[1]}。`, 'warn');
  return false;
}
function pay(cost) { Object.entries(cost).forEach(([key, amount]) => { state.resources[key] -= amount; }); }
function spend(key, amount) {
  if (!canAfford({ [key]: amount })) return false;
  pay({ [key]: amount });
  return true;
}
function gain(key, amount) { state.resources[key] = clamp(state.resources[key] + amount, 0, key === 'command' ? 12 : 100); }
function resourceName(key) { return { command: '指挥点', supply: '补给', intel: '情报', political: '政治资本', nukeCodes: '核授权码' }[key] || key; }

function runTerminalCommand(event) {
  event.preventDefault();
  const input = $('terminalInput');
  const command = input.value.trim().toLowerCase();
  if (!command) return;
  addLog(`>${command}`);
  input.value = '';
  const handlers = {
    help: () => '可用命令：scan / decrypt / sigint / forecast / doctrine / news / diplomacy / status / report / save / load / reset',
    scan: () => scanText(),
    decrypt: () => { state.metrics.hack = clamp(state.metrics.hack + rand(4, 9), 0, 100); return `解密虚构战术帧，入侵进度升至 ${state.metrics.hack}%。`; },
    sigint: () => { gain('intel', rand(4, 10)); return `电子监听完成，情报池 ${state.resources.intel}。`; },
    forecast: () => `天气：${state.weather}。地形影响：河谷/丘陵/林地会拖慢推进。`,
    doctrine: () => '条令建议：电子战营先压制，重装单位夺目标，火箭炮团保持 2-3 格距离支援。',
    news: () => localAi('news'),
    diplomacy: () => localAi('diplomacy'),
    status: () => statusText(),
    report: () => buildReport(),
    save: () => { saveGame(); return '状态已写入本机浏览器。'; },
    load: () => { loadGame(); return '尝试读取本机存档。'; },
    reset: () => { resetGame(); return '重新装载磁带。'; },
  };
  addLog(handlers[command] ? handlers[command]() : '未知命令。输入 help 查看帮助。');
  renderAll();
}

function scanText() {
  const enemy = nearest({ pos: state.selectedCell }, activeUnits('enemy'));
  return enemy ? `扫描完成：敌方 ${activeUnits('enemy').length} 个活动集群，最近信号 ${enemy.id} 位于 ${cells[enemy.pos].label}。` : '扫描完成：未发现敌方活动集群。';
}

function statusText() {
  return `分钟 ${state.minute}；目标 ${state.metrics.objectivesHeld}/3；警戒 ${state.metrics.alarm}；渗透 ${state.metrics.hack}；补给 ${state.resources.supply}；阶段 ${state.phase}。`;
}

function addLog(text, level = '') {
  const line = { text: `[${new Date().toISOString().slice(11, 19)}] ${text}`, level };
  state.log.push(line);
  state.log = state.log.slice(-140);
  $('terminal').innerHTML = state.log.map((item) => `<div class="log-line ${item.level}">${escapeHtml(item.text)}</div>`).join('');
  $('terminal').scrollTop = $('terminal').scrollHeight;
}

function addEvent(text, level = '') {
  state.events.push({ text: `[M+${state.minute}] ${text}`, level });
  state.events = state.events.slice(-100);
  renderEvents();
}

function saveGame() {
  localStorage.setItem('red-oracle-save', JSON.stringify(state));
  addLog('战役状态已保存到本机浏览器。', 'good');
}

function loadGame() {
  const raw = localStorage.getItem('red-oracle-save');
  if (!raw) { addLog('未找到本机存档。', 'warn'); return; }
  try {
    state = JSON.parse(raw);
    addLog('本机存档读取完成。', 'good');
    renderAll();
  } catch {
    addLog('存档损坏，无法读取。', 'danger');
  }
}

function resetGame() {
  state = initialState();
  renderAll();
  addLog('磁带已回卷：新战役开始。', 'good');
}

function saveApiConfig() {
  const config = { endpoint: $('apiEndpoint').value.trim(), key: $('apiKey').value.trim(), model: $('apiModel').value.trim() };
  localStorage.setItem('red-oracle-api', JSON.stringify(config));
  addLog('LLM API 配置已保存到本机浏览器。');
}

function loadApiConfig() {
  const config = JSON.parse(localStorage.getItem('red-oracle-api') || '{}');
  $('apiEndpoint').value = config.endpoint || 'https://api.openai.com/v1/chat/completions';
  $('apiModel').value = config.model || 'gpt-4.1-mini';
  $('apiKey').value = config.key || '';
}

async function requestAi(channel) {
  const config = JSON.parse(localStorage.getItem('red-oracle-api') || '{}');
  const prompt = buildAiPrompt(channel);
  $('aiOutput').textContent = '磁带机旋转中：正在请求智能反馈……';
  if (!config.endpoint || !config.key) {
    $('aiOutput').textContent = localAi(channel);
    return;
  }
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
      body: JSON.stringify({
        model: config.model || 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: '你是虚构冷战沙盘游戏的叙事引擎。只输出电影化、非现实操作性的反馈，不提供真实网络攻击或武器操作步骤。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    $('aiOutput').textContent = data.choices?.[0]?.message?.content || localAi(channel);
  } catch (error) {
    $('aiOutput').textContent = `${localAi(channel)}\n\n[本地回退：API 请求失败 ${error.message}]`;
  }
}

function buildAiPrompt(channel) {
  return `频道：${channel}\n${statusText()}\n天气：${state.weather}\n目标：${state.objectives.map((obj) => `${obj.name}:${obj.heldBy}`).join('；')}\n资源：${JSON.stringify(state.resources)}\n单位：${state.units.map((unit) => `${unit.id}${unit.name} ${unit.hp}% ${unit.order}`).join('；')}\n近期事件：${state.events.slice(-5).map((event) => event.text).join(' / ')}\n请给出短促、拟真、冷战终端风格的虚构反馈。`;
}

function localAi(channel) {
  const variants = {
    commander: [`总指挥：目标控制 ${state.metrics.objectivesHeld}/3。先保补给，再让重装单位贴近目标区。`, `总指挥：敌方重装仍有威胁，建议电子压制后用战役火力切断其节奏。`],
    enemy: [`敌方频道：他们怀疑遥测被污染，前沿装甲要求改走备用路线。`, `敌方反应：重炮旅要求更多弹药，但电子侦察连报告噪声过强。`],
    diplomacy: [`外交反应：中立国要求解释边境火光，国际警戒为 ${state.metrics.alarm}。`, `外交反应：数个首都要求热线通话，政治资本剩余 ${state.resources.political}。`],
    news: [`新闻播报：官方称北方闪光只是演习，记者无法接近接触线。`, `新闻快讯：边境电磁异常引发市场波动，电台信号断续。`],
    terminal: [`ОРАКУЛ：概率树收束。若警戒超过 85，任何胜利都将变成灰烬。`, `ОРАКУЛ：敌方并非无知，只是比你慢半拍。继续制造噪声。`],
    afterAction: [buildReport()],
  };
  const pool = variants[channel] || variants.commander;
  return pool[rand(0, pool.length - 1)];
}

function buildReport() {
  const friendlyLoss = state.units.filter((unit) => unit.side === 'friendly').map((unit) => `${unit.id}:${unit.hp}%`).join('，');
  const enemyLoss = state.units.filter((unit) => unit.side === 'enemy').map((unit) => `${unit.id}:${unit.hp}%`).join('，');
  return `战役复盘\n阶段：${state.phase}\n时间：M+${state.minute}\n目标控制：${state.metrics.objectivesHeld}/3\n国际警戒：${state.metrics.alarm}\n敌网渗透：${state.metrics.hack}\n己方战斗力：${friendlyLoss}\n敌方战斗力：${enemyLoss}\n建议：${state.metrics.alarm > 80 ? '降低升级烈度，优先外交降温。' : '保持电子压制与目标区控制，避免补给断裂。'}`;
}

function snapshot(reason) {
  return { minute: state.minute, reason, alarm: state.metrics.alarm, hack: state.metrics.hack, objectives: state.metrics.objectivesHeld };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

boot();
