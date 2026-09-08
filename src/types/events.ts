import { Tone } from './llm';

export type LogCategory =
  | 'stavka'
  | 'frontline'
  | 'enemy'
  | 'diplomacy'
  | 'news'
  | 'system'
  | 'nuclear';

export type TerminalLog = {
  id: string;
  timestamp: number;
  category: LogCategory;
  title: string;
  content: string;
  speaker?: string;
  tone?: Tone;
  important?: boolean;
};

export type GameEvent = {
  id: string;
  timestamp: number;
  type:
    | 'combat'
    | 'command'
    | 'diplomacy'
    | 'nuclear'
    | 'internal'
    | 'random'
    | 'llm';
  title: string;
  description: string;
  resolved: boolean;
  autoPause: boolean;
};
