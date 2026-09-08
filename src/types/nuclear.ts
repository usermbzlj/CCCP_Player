export type NuclearLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type AuthorizationStage =
  | 'none'
  | 'warning'
  | 'target-package'
  | 'stavka-review'
  | 'dual-confirmation'
  | 'final-window'
  | 'executed'
  | 'aborted';

export type NuclearTarget = {
  id: string;
  name: string;
  description: string;
  type: 'enemy-cluster' | 'breakthrough-zone' | 'warning-burst' | 'strategic';
};

export type NuclearTargetPackage = {
  targets: NuclearTarget[];
  selectedTargetId?: string;
};

export type StavkaOpinion = {
  role: string;
  name: string;
  stance: 'support' | 'oppose' | 'hesitate';
  argument: string;
};

export type NuclearState = {
  level: NuclearLevel;
  protocolActive: boolean;
  authorizationStage: AuthorizationStage;
  countdown?: number;
  targetPackage?: NuclearTargetPackage;
  irreversible: boolean;
  lastAction?: string;
  stavkaOpinions?: StavkaOpinion[];
};

export type NuclearStrikeType =
  | 'tactical'
  | 'area-denial'
  | 'warning-burst'
  | 'strategic';
