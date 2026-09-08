import { Unit } from './units';
import { NuclearState } from './nuclear';
import { GameEvent, TerminalLog } from './events';

export type GamePhase =
  | 'boot'
  | 'api-test'
  | 'initializing'
  | 'operational'
  | 'paused'
  | 'crisis'
  | 'nuclear-protocol'
  | 'ending';

export type Speed = 0 | 1 | 2 | 4;

export type Metrics = {
  commandIntegrity: number;
  strategicAdvantage: number;
  nuclearEscalation: number;
  diplomaticPressure: number;
  intelReliability: number;
  commsStability: number;
  stavkaTrust: number;
  publicPanic: number;
  systemIntegrity: number;
};

export type APIConfig = {
  baseUrl: string;
  apiKey: string;
  modelId: string;
  connected: boolean;
  rememberSession: boolean;
};

export type GameState = {
  phase: GamePhase;
  apiConfig: APIConfig;
  campaignTime: number;
  speed: Speed;
  metrics: Metrics;
  nuclear: NuclearState;
  units: Unit[];
  events: GameEvent[];
  logs: TerminalLog[];
  selectedUnitId?: string;
  selectedTargetId?: string;
  isLLMLoading: boolean;
  endingType?: EndingType;
  gameStarted: boolean;
};

export type EndingType =
  | 'conventional-victory'
  | 'pyrrhic-victory'
  | 'ceasefire'
  | 'tactical-nuclear-victory'
  | 'nuclear-winter'
  | 'coup'
  | 'system-takeover'
  | 'command-collapse';
