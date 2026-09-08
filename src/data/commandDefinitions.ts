import { OrderType, OrderRisk, UnitType } from '../types/units';

export type CommandDefinition = {
  type: OrderType;
  label: string;
  description: string;
  category: 'maneuver' | 'fire' | 'electronic' | 'cyber' | 'command' | 'nuclear';
  availableFor: UnitType[];
  defaultRisk: OrderRisk;
  cooldownTicks: number;
};

export const COMMAND_DEFINITIONS: CommandDefinition[] = [
  // 机动命令
  { type: 'advance', label: '推进', description: '向指定方向推进', category: 'maneuver', availableFor: ['armor', 'mechanized', 'engineer'], defaultRisk: 'medium', cooldownTicks: 2 },
  { type: 'retreat', label: '撤退', description: '向后方撤退', category: 'maneuver', availableFor: ['armor', 'mechanized', 'artillery', 'rocket', 'airDefense', 'engineer'], defaultRisk: 'medium', cooldownTicks: 2 },
  { type: 'flank', label: '侧翼机动', description: '尝试侧翼包抄', category: 'maneuver', availableFor: ['armor', 'mechanized'], defaultRisk: 'high', cooldownTicks: 3 },
  { type: 'hold', label: '固守', description: '坚守当前阵地', category: 'maneuver', availableFor: ['armor', 'mechanized', 'artillery', 'rocket', 'airDefense', 'engineer'], defaultRisk: 'low', cooldownTicks: 1 },
  { type: 'regroup', label: '重新集结', description: '休整并恢复状态', category: 'maneuver', availableFor: ['armor', 'mechanized', 'artillery', 'rocket', 'airDefense', 'engineer', 'electronicWarfare', 'missile', 'command', 'logistics'], defaultRisk: 'low', cooldownTicks: 3 },
  // 火力命令
  { type: 'artillery', label: '炮兵压制', description: '对目标区域进行炮火压制', category: 'fire', availableFor: ['artillery'], defaultRisk: 'medium', cooldownTicks: 4 },
  { type: 'rocket', label: '火箭覆盖', description: '火箭弹饱和打击', category: 'fire', availableFor: ['rocket'], defaultRisk: 'high', cooldownTicks: 6 },
  { type: 'missile', label: '战术导弹打击', description: '精确导弹打击高价值目标', category: 'fire', availableFor: ['missile'], defaultRisk: 'high', cooldownTicks: 8 },
  { type: 'airSupport', label: '空中支援请求', description: '请求战术航空支援', category: 'fire', availableFor: ['armor', 'mechanized', 'command'], defaultRisk: 'medium', cooldownTicks: 5 },
  // 电子战/网络战
  { type: 'electronicWarfare', label: '电子干扰', description: '干扰敌方通信与雷达', category: 'electronic', availableFor: ['electronicWarfare'], defaultRisk: 'medium', cooldownTicks: 4 },
  { type: 'cyber', label: '网络战行动', description: '破坏敌方情报同步或注入虚假信息', category: 'cyber', availableFor: ['electronicWarfare', 'command'], defaultRisk: 'high', cooldownTicks: 5 },
  // 指挥链
  { type: 'restoreComms', label: '恢复通信', description: '修复通信链路', category: 'command', availableFor: ['command', 'engineer', 'electronicWarfare'], defaultRisk: 'low', cooldownTicks: 3 },
  { type: 'politicalOfficer', label: '派遣政治委员', description: '稳定军心，提升忠诚', category: 'command', availableFor: ['command'], defaultRisk: 'medium', cooldownTicks: 4 },
  { type: 'replaceCommander', label: '更换前线指挥官', description: '撤换不服从命令的指挥官', category: 'command', availableFor: ['command'], defaultRisk: 'high', cooldownTicks: 5 },
  { type: 'stabilize', label: '稳定军心', description: '发布稳定军心命令', category: 'command', availableFor: ['command'], defaultRisk: 'low', cooldownTicks: 2 },
  { type: 'requestStavka', label: '请求总参授权', description: '请求总参谋部高级授权', category: 'command', availableFor: ['command'], defaultRisk: 'medium', cooldownTicks: 3 },
  // 核命令（特殊处理）
  { type: 'nuclear', label: '核选项', description: '进入核协议流程', category: 'nuclear', availableFor: ['command', 'missile'], defaultRisk: 'extreme', cooldownTicks: 10 },
];

export function getCommandsForUnit(unitType: UnitType): CommandDefinition[] {
  return COMMAND_DEFINITIONS.filter(cmd => cmd.availableFor.includes(unitType));
}
