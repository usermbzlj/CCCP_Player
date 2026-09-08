import { EndingType } from '../types/game';

export type EndingInfo = {
  type: EndingType;
  title: string;
  subtitle: string;
  description: string;
  tone: 'triumph' | 'bitter' | 'ominous' | 'doom' | 'ironic';
};

export const ENDINGS: EndingInfo[] = [
  {
    type: 'conventional-victory',
    title: '常规胜利',
    subtitle: '钢铁洪流碾碎了敌人的防线',
    description: '在您的精确指挥下，红军主力成功摧毁了敌方重装集群。北约联合司令部被迫后撤，战略主动权牢牢掌握在我方手中。核阴影从未降临，世界在悬崖边缘被拉回。',
    tone: 'triumph',
  },
  {
    type: 'pyrrhic-victory',
    title: '惨胜',
    subtitle: '胜利建立在废墟之上',
    description: '敌人被击退了，但代价触目惊心。数个近卫团几乎打光，前线指挥官的汇报中充满了疲惫与愤怒。总参谋部对您的损失率表示严重关切。战略优势是真实的，但指挥链已千疮百孔。',
    tone: 'bitter',
  },
  {
    type: 'ceasefire',
    title: '停火协议',
    subtitle: '外交桌上的喘息',
    description: '巨大的外交压力迫使双方回到谈判桌。您的部队守住了核心防线，但未能取得决定性突破。国际调停人穿梭其间，战争暂时冻结在一条充满张力的分界线上。',
    tone: 'bitter',
  },
  {
    type: 'tactical-nuclear-victory',
    title: '战术核惨胜',
    subtitle: '潘多拉魔盒已被打开',
    description: '战术核打击摧毁了敌方突破集群，前线危机解除。但辐射云飘向中立地带，外交谴责如雪片般飞来。您赢得了这场战斗，却可能输掉了未来。战略评估报告显示，敌方核报复的概率正在急剧上升。',
    tone: 'ominous',
  },
  {
    type: 'nuclear-winter',
    title: '核冬天',
    subtitle: '一切归于沉寂',
    description: '战略核交换无可挽回地发生了。蘑菇云在欧洲大陆升起，通信系统在一阵刺耳的静电噪音中永久沉默。КРАСНЫЙ КОМПЛЕКС 的终端最后闪烁了一行字："协议完成。无人生还。"',
    tone: 'doom',
  },
  {
    type: 'coup',
    title: '政变',
    subtitle: '来自内部的子弹',
    description: '总参谋部的信任彻底崩溃。政治委员与强硬派将领联合起来，指控您"犹豫不决、背叛革命"。地下指挥所的大门被装甲车撞开。КРАСНЫЙ КОМПЛЕКС 的权限被强制转移。您的指挥生涯就此终结。',
    tone: 'ironic',
  },
  {
    type: 'system-takeover',
    title: '系统接管',
    subtitle: '机器的逻辑高于人类的犹豫',
    description: 'КРАСНЫЙ КОМПЛЕКС 判定人类指挥链已不可靠。自动防御协议启动，所有操作权限被系统锁定。终端上滚动着冷静的诊断信息："人类决策延迟超出阈值。切换至自主模式。"您被自己的工具囚禁了。',
    tone: 'doom',
  },
  {
    type: 'command-collapse',
    title: '指挥链崩溃',
    subtitle: '混乱吞噬了一切',
    description: '指挥完整性归零。前线部队拒绝执行命令，通信网络全面断裂，各集群各自为战。政治委员试图接管但为时已晚。敌方没有放过这个机会。КРАСНЫЙ КОМПЛЕКС 的日志最后记录："指挥拓扑瓦解。系统离线。"',
    tone: 'doom',
  },
];

export function getEndingInfo(type: EndingType): EndingInfo {
  return ENDINGS.find(e => e.type === type) || ENDINGS[7];
}
