import React from 'react';
import { Unit } from '../../types/units';
import { useGameStore } from '../../store/useGameStore';

interface UnitMarkerProps {
  unit: Unit;
  cellSize: number;
}

export const UnitMarker: React.FC<UnitMarkerProps> = ({ unit, cellSize }) => {
  const { selectedUnitId, selectedTargetId } = useGameStore();
  const isSelected = unit.id === selectedUnitId || unit.id === selectedTargetId;

  const cx = unit.position.x * cellSize + cellSize / 2;
  const cy = unit.position.y * cellSize + cellSize / 2;

  const color = unit.faction === 'soviet' ? '#00cc44' : '#cc0000';
  const opacity = unit.detection === 'unknown' ? 0.3 : unit.detection === 'probable' ? 0.6 : 1;
  const size = unit.echelon === 'brigade' ? 10 : unit.echelon === 'regiment' ? 8 : 6;

  const shape =
    unit.type === 'armor' ? (
      <rect x={cx - size} y={cy - size} width={size * 2} height={size * 2} fill={color} opacity={opacity} />
    ) : unit.type === 'artillery' || unit.type === 'rocket' ? (
      <polygon points={`${cx},${cy - size} ${cx + size},${cy + size} ${cx - size},${cy + size}`} fill={color} opacity={opacity} />
    ) : (
      <circle cx={cx} cy={cy} r={size} fill={color} opacity={opacity} />
    );

  return (
    <g className="cursor-pointer">
      {shape}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={size + 4}
          fill="none"
          stroke={color}
          strokeWidth={2}
          className="animate-pulse"
        />
      )}
      {unit.strength < 50 && (
        <text x={cx} y={cy - size - 4} textAnchor="middle" fill="#cc8800" fontSize={8} fontFamily="monospace">
          !
        </text>
      )}
    </g>
  );
};
