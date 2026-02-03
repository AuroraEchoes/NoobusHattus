export interface LogsTfResponse {
  version: number;
  teams: {
    Red: TeamStats;
    Blue: TeamStats;
  };
  length: number;
  players: Record<string, Player>;
  names: Record<string, string>;
  rounds: Round[];
  healspread: Record<string, Record<string, number>>;
  classkills: Record<string, Record<string, number>>;
  classdeaths: Record<string, Record<string, number>>;
  classkillassists: Record<string, Record<string, number>>;
  chat: ChatMessage[];
  info: MatchInfo;
  killstreaks: Killstreak[];
  success: boolean;
}

export interface TeamStats {
  score: number;
  kills: number;
  deaths: number;
  dmg: number;
  charges: number;
  drops: number;
  firstcaps: number;
  caps: number;
}

export interface Player {
  team: "Red" | "Blue";
  class_stats: ClassStat[];
  kills: number;
  deaths: number;
  assists: number;
  suicides: number;
  kapd: string;
  kpd: string;
  dmg: number;
  dmg_real: number;
  dt: number;
  dt_real: number;
  hr: number;
  lks: number;
  as: number;
  dapd: number;
  dapm: number;
  ubers: number;
  ubertypes: Record<string, number>;
  drops: number;
  medkits: number;
  medkits_hp: number;
  backstabs: number;
  headshots: number;
  headshots_hit: number;
  sentries: number;
  heal: number;
  cpc: number;
  ic: number;
  medicstats?: MedicStats;
}

export interface ClassStat {
  type: string;
  kills: number;
  assists: number;
  deaths: number;
  dmg: number;
  weapon: Record<string, WeaponStats>;
  total_time: number;
}

export interface WeaponStats {
  kills: number;
  dmg: number;
  avg_dmg: number;
  shots: number;
  hits: number;
}

export interface MedicStats {
  advantages_lost: number;
  biggest_advantage_lost: number;
  deaths_with_95_99_uber: number;
  deaths_within_20s_after_uber: number;
  avg_time_before_healing: number;
  avg_time_to_build: number;
  avg_time_before_using: number;
  avg_uber_length: number;
}

export interface Round {
  start_time: number;
  winner: "Red" | "Blue";
  team: {
    Blue: RoundTeamStats;
    Red: RoundTeamStats;
  };
  events: RoundEvent[];
  players: Record<string, RoundPlayerStats>;
  firstcap: "Red" | "Blue";
  length: number;
}

export interface RoundTeamStats {
  score: number;
  kills: number;
  dmg: number;
  ubers: number;
}

export type RoundEvent =
  | PointCapEvent
  | ChargeEvent
  | MedicDeathEvent
  | RoundWinEvent;

export interface PointCapEvent {
  type: "pointcap";
  time: number;
  team: "Red" | "Blue";
  point: number;
}

export interface ChargeEvent {
  type: "charge";
  medigun: string;
  time: number;
  steamid: string;
  team: "Red" | "Blue";
}

export interface MedicDeathEvent {
  type: "medic_death";
  time: number;
  team: "Red" | "Blue";
  steamid: string;
  killer: string;
}

export interface RoundWinEvent {
  type: "round_win";
  time: number;
  team: "Red" | "Blue";
}

export interface RoundPlayerStats {
  team: "Red" | "Blue";
  kills: number;
  dmg: number;
}

export interface ChatMessage {
  steamid: string;
  name: string;
  msg: string;
}

export interface MatchInfo {
  map: string;
  supplemental: boolean;
  total_length: number;
  hasRealDamage: boolean;
  hasWeaponDamage: boolean;
  hasAccuracy: boolean;
  hasHP: boolean;
  hasHP_real: boolean;
  hasHS: boolean;
  hasHS_hit: boolean;
  hasBS: boolean;
  hasCP: boolean;
  hasSB: boolean;
  hasDT: boolean;
  hasAS: boolean;
  hasHR: boolean;
  hasIntel: boolean;
  AD_scoring: boolean;
  notifications: any[];
  title: string;
  date: number;
  uploader: {
    id: string;
    name: string;
    info: string;
  };
}

export interface Killstreak {
  steamid: string;
  streak: number;
  time: number;
}
