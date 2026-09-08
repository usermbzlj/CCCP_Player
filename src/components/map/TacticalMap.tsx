import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { MAP_WIDTH, MAP_HEIGHT, getTerrainAt } from '../../data/mapConfig';
import { UnitMarker } from './UnitMarker';
import { RadarOverlay } from './RadarOverlay';

const CELL_SIZE = 28;

export const TacticalMap: React.FC = () => {
  const { units, selectedUnitId, setSelectedUnit, setSelectedTarget } = useGameStore();

  const width = MAP_WIDTH * CELL_SIZE;
  const height = MAP_HEIGHT * CELL_SIZE;

  const handleCellClick = (x: number, y: number) => {
    const unit = units.find((u) => u.position.x === x && u.position.y === y);
    if (unit) {
      if (unit.faction === 'soviet') {
        setSelectedUnit(unit.id);
        setSelectedTarget(undefined);
      } else {
        setSelectedTarget(unit.id);
      }
    } else {
      setSelectedUnit(undefined);
      setSelectedTarget(undefined);
    }
  };

  return (
    <div className="w-full h-full bg-soviet-black relative overflow-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute top-0 left-0"
      >
        {/* Grid */}
        {Array.from({ length: MAP_HEIGHT }).map((_, y) =>
          Array.from({ length: MAP_WIDTH }).map((_, x) => {
            const terrain = getTerrainAt(x, y);
            const fill =
              terrain === 'forest'
                ? '#0d2b1a'
                : terrain === 'urban'
                ? '#2a2a1a'
                : terrain === 'hill'
                ? '#1a1a0d'
                : terrain === 'river'
                ? '#0a1a2a'
                : '#0f0f0f';

            return (
              <rect
                key={`${x}-${y}`}
                x={x * CELL_SIZE}
                y={y * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={fill}
                stroke="#1a1a1a"
                strokeWidth={0.5}
                onClick={() => handleCellClick(x, y)}
                className="cursor-pointer hover:stroke-soviet-gray/50"
              />
            );
          })
        )}

        {/* Front line (abstract) */}
        <line
          x1={11 * CELL_SIZE}
          y1={0}
          x2={11 * CELL_SIZE}
          y2={height}
          stroke="#cc0000"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.4}
        />

        {/* Units */}
        {units.map((unit) => (
          <UnitMarker key={unit.id} unit={unit} cellSize={CELL_SIZE} />
        ))}

        {/* Radar overlay */}
        <RadarOverlay width={width} height={height} />
      </svg>
    </div>
  );
};
