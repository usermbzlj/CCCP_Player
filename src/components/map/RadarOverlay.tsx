import React from 'react';

interface RadarOverlayProps {
  width: number;
  height: number;
}

export const RadarOverlay: React.FC<RadarOverlayProps> = ({ width, height }) => {
  return (
    <>
      {/* Radar sweep line */}
      <line
        x1={width / 2}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="rgba(0, 170, 170, 0.15)"
        strokeWidth={width / 2}
        className="origin-center"
        style={{
          transformOrigin: `${width / 2}px ${height / 2}px`,
          animation: 'radar-sweep 4s linear infinite',
        }}
      />
      {/* Range circles */}
      {[0.25, 0.5, 0.75].map((r) => (
        <circle
          key={r}
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) * r}
          fill="none"
          stroke="rgba(0, 170, 170, 0.08)"
          strokeWidth={1}
        />
      ))}
    </>
  );
};
