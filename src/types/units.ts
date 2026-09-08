export type Faction = 'soviet' | 'enemy';

export type UnitType =
  | 'armor'
  | 'mechanized'
  | 'artillery'
  | 'rocket'
  | 'airDefense'
  | 'engineer'
  | 'electronicWarfare'
  | 'missile'
  | 'command'
  | 'logistics';

export type Echelon = 'battalion' | 'regiment' | 'brigade' | 'group';

export type UnitStatus =
  | 'idle'
  | 'advancing'
  | 'engaged'
  | 'holding'
  | 'retreating'
  | 'comms-lost'
  | 'disrupted'
  | 'disobeying'
  | 'suppressed'
  | 'low-ammo'
  | 'low-fuel'
  | 'awaiting-support'
  | 'jammed'
  | 'command-lost';

export type Detection = 'confirmed' | 'probable' | 'unknown';

export type Position = {
  x: number;
  y: number;
};

export type Commander = {
  name: string;
  loyalty: number;
  aggressiveness: number;
  experience: number;
};

export type Unit = {
  id: string;
  name: string;
  faction: Faction;
  type: UnitType;
  echelon: Echelon;
  position: Position;
  strength: number;
  morale: number;
  supply: number;
  fuel: number;
  ammo: number;
  readiness: number;
  comms: number;
  detection: Detection;
  status: UnitStatus;
  currentOrder?: Order;
  commander?: Commander;
  cooldown: number;
};

export type OrderType =
  | 'advance'
  | 'retreat'
  | 'flank'
  | 'hold'
  | 'regroup'
  | 'artillery'
  | 'rocket'
  | 'missile'
  | 'airSupport'
  | 'electronicWarfare'
  | 'cyber'
  | 'restoreComms'
  | 'politicalOfficer'
  | 'replaceCommander'
  | 'stabilize'
  | 'requestStavka'
  | 'nuclear';

export type OrderRisk = 'low' | 'medium' | 'high' | 'extreme';

export type OrderStatus = 'queued' | 'executing' | 'success' | 'failed' | 'delayed' | 'refused';

export type Order = {
  id: string;
  type: OrderType;
  sourceUnitId?: string;
  targetUnitId?: string;
  targetPosition?: Position;
  issuedAt: number;
  duration: number;
  risk: OrderRisk;
  status: OrderStatus;
  progress: number;
};
