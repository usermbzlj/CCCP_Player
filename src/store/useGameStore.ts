import { create } from 'zustand';
import { GameState, GamePhase, Speed, Metrics, EndingType } from '../types/game';
import { Unit, Order } from '../types/units';
import { NuclearState } from '../types/nuclear';
import { GameEvent, TerminalLog } from '../types/events';
import { INITIAL_UNITS } from '../data/initialUnits';

function createInitialMetrics(): Metrics {
  return {
    commandIntegrity: 75,
    strategicAdvantage: 10,
    nuclearEscalation: 5,
    diplomaticPressure: 15,
    intelReliability: 70,
    commsStability: 80,
    stavkaTrust: 70,
    publicPanic: 10,
    systemIntegrity: 90,
  };
}

function createInitialNuclearState(): NuclearState {
  return {
    level: 0,
    protocolActive: false,
    authorizationStage: 'none',
    irreversible: false,
  };
}

const initialState: GameState = {
  phase: 'boot',
  apiConfig: {
    baseUrl: '',
    apiKey: '',
    modelId: '',
    connected: false,
    rememberSession: false,
  },
  campaignTime: 0,
  speed: 1,
  metrics: createInitialMetrics(),
  nuclear: createInitialNuclearState(),
  units: JSON.parse(JSON.stringify(INITIAL_UNITS)),
  events: [],
  logs: [],
  selectedUnitId: undefined,
  selectedTargetId: undefined,
  isLLMLoading: false,
  endingType: undefined,
  gameStarted: false,
};

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  setSpeed: (speed: Speed) => void;
  tick: () => void;
  updateMetrics: (updates: Partial<Metrics>) => void;
  applyMetricDelta: (key: keyof Metrics, delta: number) => void;
  setUnits: (units: Unit[]) => void;
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  setSelectedUnit: (id?: string) => void;
  setSelectedTarget: (id?: string) => void;
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
  addEvent: (event: Omit<GameEvent, 'id' | 'timestamp'>) => void;
  resolveEvent: (id: string) => void;
  setNuclearState: (nuclear: Partial<NuclearState>) => void;
  setLLMLoading: (loading: boolean) => void;
  setEnding: (ending?: EndingType) => void;
  resetGame: () => void;
  startGame: () => void;
}

let logIdCounter = 0;
let eventIdCounter = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setSpeed: (speed) => set({ speed }),

  tick: () =>
    set((state) => {
      if (state.phase !== 'operational' && state.phase !== 'crisis') return state;
      return { campaignTime: state.campaignTime + 1 };
    }),

  updateMetrics: (updates) =>
    set((state) => ({
      metrics: { ...state.metrics, ...updates },
    })),

  applyMetricDelta: (key, delta) =>
    set((state) => {
      const value = state.metrics[key] + delta;
      const clamped = Math.max(0, Math.min(100, value));
      return {
        metrics: { ...state.metrics, [key]: clamped },
      };
    }),

  setUnits: (units) => set({ units }),

  updateUnit: (id, updates) =>
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    })),

  setSelectedUnit: (id) => set({ selectedUnitId: id }),
  setSelectedTarget: (id) => set({ selectedTargetId: id }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...log,
          id: `log-${++logIdCounter}`,
          timestamp: state.campaignTime,
        },
      ],
    })),

  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          id: `evt-${++eventIdCounter}`,
          timestamp: state.campaignTime,
        },
      ],
    })),

  resolveEvent: (id) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, resolved: true } : e)),
    })),

  setNuclearState: (nuclear) =>
    set((state) => ({
      nuclear: { ...state.nuclear, ...nuclear },
    })),

  setLLMLoading: (loading) => set({ isLLMLoading: loading }),

  setEnding: (ending) =>
    set(() => ({
      endingType: ending,
      phase: ending ? 'ending' : 'operational',
    })),

  resetGame: () =>
    set(() => ({
      ...initialState,
      units: JSON.parse(JSON.stringify(INITIAL_UNITS)),
      metrics: createInitialMetrics(),
      nuclear: createInitialNuclearState(),
      logs: [],
      events: [],
    })),

  startGame: () =>
    set(() => ({
      phase: 'operational',
      gameStarted: true,
      campaignTime: 0,
    })),
}));
