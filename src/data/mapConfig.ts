export const MAP_WIDTH = 24;
export const MAP_HEIGHT = 16;

export type TerrainType = 'plain' | 'forest' | 'urban' | 'river' | 'hill';

export type MapCell = {
  x: number;
  y: number;
  terrain: TerrainType;
  name?: string;
};

export const TERRAIN_GRID: TerrainType[][] = Array.from({ length: MAP_HEIGHT }, (_, y) =>
  Array.from({ length: MAP_WIDTH }, (_, x) => {
    // Simple procedural terrain
    if (x === 10 || x === 11) return 'river';
    if ((x + y) % 7 === 0) return 'hill';
    if ((x * 3 + y * 2) % 11 === 0) return 'urban';
    if ((x + y * 3) % 5 === 0) return 'forest';
    return 'plain';
  })
);

export const KEY_LOCATIONS = [
  { x: 4, y: 8, name: '北方集群指挥部', faction: 'soviet' as const },
  { x: 6, y: 6, name: '第7近卫坦克团集结地', faction: 'soviet' as const },
  { x: 5, y: 10, name: '摩托化步兵前进阵地', faction: 'soviet' as const },
  { x: 18, y: 7, name: '敌方战区司令部', faction: 'enemy' as const },
  { x: 16, y: 5, name: '装甲战斗群突破口', faction: 'enemy' as const },
  { x: 17, y: 11, name: '敌方远程火力阵地', faction: 'enemy' as const },
];

export function getTerrainAt(x: number, y: number): TerrainType {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 'plain';
  return TERRAIN_GRID[y][x];
}

export function getTerrainDefenseBonus(terrain: TerrainType): number {
  switch (terrain) {
    case 'urban': return 0.3;
    case 'hill': return 0.2;
    case 'forest': return 0.15;
    case 'river': return -0.1;
    default: return 0;
  }
}
