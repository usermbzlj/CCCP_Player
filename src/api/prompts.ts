import { LLMMessage } from '../types/llm';
import { Metrics } from '../types/game';
import { Unit } from '../types/units';

function buildContext(metrics: Metrics, units: Unit[], campaignTime: number): string {
  const sovietUnits = units.filter(u => u.faction === 'soviet');
  const enemyUnits = units.filter(u => u.faction === 'enemy');
  const sovietStrength = sovietUnits.reduce((s, u) => s + u.strength, 0) / sovietUnits.length;
  const enemyStrength = enemyUnits.reduce((s, u) => s + u.strength, 0) / enemyUnits.length;

  return `
当前战役时间：${campaignTime}分钟
战略优势：${metrics.strategicAdvantage}
指挥完整性：${metrics.commandIntegrity}
核升级风险：${metrics.nuclearEscalation}
外交压力：${metrics.diplomaticPressure}
情报可信度：${metrics.intelReliability}
通信稳定性：${metrics.commsStability}
总参信任：${metrics.stavkaTrust}
民众恐慌：${metrics.publicPanic}
系统完整性：${metrics.systemIntegrity}
己方平均战力：${sovietStrength.toFixed(1)}%
敌方平均战力：${enemyStrength.toFixed(1)}%
己方单位数：${sovietUnits.length}
敌方单位数：${enemyUnits.length}
`;
}

export function createStavkaBriefingPrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你是苏联总参谋部(STAVKA)的高级参谋。你的语气冷峻、命令式、充满官僚威严。
使用中文回复。少量使用俄文军事术语点缀。
你必须返回JSON格式：
{
  "title": "简报标题",
  "narrative": "总参评估文本，200字以内",
  "speaker": "总参谋部",
  "tone": "cold",
  "suggestedEffects": [{"type": "strategicAdvantage", "delta": 0, "reason": "理由"}]
}`,
    },
    {
      role: 'user',
      content: `生成总参谋部战场简报。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createFrontlineReportPrompt(
  unit: Unit,
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你是${unit.name}的前线指挥官。根据单位状态决定情绪：
- 士气高：坚定、积极
- 士气低：疲惫、抱怨、可能抗命
- 通信中断：恐慌、混乱
使用中文回复，偶尔夹杂俄文军事术语。
返回JSON：
{
  "title": "汇报标题",
  "narrative": "前线汇报文本，150字以内",
  "speaker": "指挥官姓名",
  "tone": "military",
  "suggestedEffects": [{"type": "commandIntegrity", "delta": 0, "reason": "理由"}]
}`,
    },
    {
      role: 'user',
      content: `生成前线汇报。单位：${unit.name}，状态：${unit.status}，士气：${unit.morale}，战力：${unit.strength}。
${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createEnemyReactionPrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你是北约联合司令部的情报分析员。生成敌方可能的反应或声明。
不要暴露全部情报，保持一定神秘感和威胁性。
使用中文回复。
返回JSON：
{
  "title": "敌方动态",
  "narrative": "敌方反应文本，150字以内",
  "speaker": "北约联合司令部",
  "tone": "cold",
  "suggestedEffects": [{"type": "diplomaticPressure", "delta": 0, "reason": "理由"}]
}`,
    },
    {
      role: 'user',
      content: `生成敌方反应。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createDiplomacyPrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你代表国际社会外交频道。生成外交压力、停火提议或谴责声明。
使用中文回复。
返回JSON：
{
  "title": "外交动态",
  "narrative": "外交文本，150字以内",
  "speaker": "国际社会",
  "tone": "diplomatic",
  "suggestedEffects": [{"type": "diplomaticPressure", "delta": 0, "reason": "理由"}]
}`,
    },
    {
      role: 'user',
      content: `生成外交反应。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createNewsPrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你是国际新闻广播员。生成新闻短讯，可能不准确、带有冷战宣传色彩。
使用中文回复，标题要醒目。
返回JSON：
{
  "title": "新闻标题",
  "narrative": "新闻内容，100字以内",
  "speaker": "国际通讯社",
  "tone": "propaganda",
  "suggestedEffects": [{"type": "publicPanic", "delta": 0, "reason": "理由"}]
}`,
    },
    {
      role: 'user',
      content: `生成新闻播报。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createTerminalPrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你是КРАСНЫЙ КОМПЛЕКС（红色主机）超级计算机终端。语气半机械、半神经质，偶尔有冷幽默。
输出故障诊断、预测、警告。
使用中文回复，夹杂俄文技术术语。
返回JSON：
{
  "title": "系统消息",
  "narrative": "终端输出，100字以内",
  "speaker": "КРАСНЫЙ КОМПЛЕКС",
  "tone": "terminal",
  "suggestedEffects": [{"type": "systemIntegrity", "delta": 0, "reason": "理由"}]
}`,
    },
    {
      role: 'user',
      content: `生成系统终端消息。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createNuclearDebatePrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number,
  nuclearLevel: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你模拟苏联总参谋部、前线指挥官和政治委员关于核升级的争论。
必须生成3个角色的不同意见：有人支持、有人反对、有人犹豫。
使用中文回复，角色名用中文。
返回JSON：
{
  "title": "核授权争论",
  "narrative": "争论摘要，200字以内",
  "speaker": "多方",
  "tone": "horror",
  "suggestedEffects": [{"type": "nuclearEscalation", "delta": 0, "reason": "理由"}],
  "choices": [
    {"id": "abort", "label": "中止核流程", "description": "放弃核升级", "risk": "medium"},
    {"id": "continue", "label": "继续授权", "description": "推进核授权", "risk": "extreme"}
  ]
}`,
    },
    {
      role: 'user',
      content: `生成核授权争论。当前核等级：${nuclearLevel}。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createCrisisEventPrompt(
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你生成一个突发的重大危机事件。可能是：前线崩溃、指挥官抗命、敌方核异动、外交 ultimatum、系统故障等。
使用中文回复。
返回JSON：
{
  "title": "事件标题",
  "narrative": "事件描述，200字以内",
  "speaker": "事件来源",
  "tone": "panic",
  "suggestedEffects": [{"type": "commandIntegrity", "delta": -5, "reason": "危机冲击"}],
  "choices": [
    {"id": "choice1", "label": "选项1", "description": "描述", "risk": "high"},
    {"id": "choice2", "label": "选项2", "description": "描述", "risk": "medium"}
  ]
}`,
    },
    {
      role: 'user',
      content: `生成重大危机事件。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}

export function createEndingPrompt(
  endingType: string,
  metrics: Metrics,
  units: Unit[],
  campaignTime: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `你生成游戏结局的叙事文本。根据结局类型调整语气和内容。
使用中文回复，要有文学性和冷战氛围。
返回JSON：
{
  "title": "结局标题",
  "narrative": "结局叙事，300字以内",
  "speaker": "旁白",
  "tone": "horror",
  "suggestedEffects": []
}`,
    },
    {
      role: 'user',
      content: `生成结局叙事。结局类型：${endingType}。${buildContext(metrics, units, campaignTime)}`,
    },
  ];
}
