import React, { useState } from 'react';
import { STANDARD_PERFORMANCE_DATA } from '../data/resultsMockData';

const ResultGraph = ({ data = STANDARD_PERFORMANCE_DATA }) => {
  const [activePoint, setActivePoint] = useState(null);

  // SVG dimensions for smooth vector scaling
  const width = 900;
  const height = 300;
  const paddingX = 50;
  const paddingY = 40;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates for points (Standard 1 to 10)
  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    // Map score 0-100 to y position (100% at top, 0% at bottom)
    const y = paddingY + chartHeight - (item.avgScore / 100) * chartHeight;
    return { ...item, x, y, index };
  });

  // Construct SVG Path String for smooth area curve
  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    // Catmull-Rom or cubic bezier smoothing for premium curve
    const prev = points[index - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, '');

  // Closed path string for area gradient fill
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const bottomY = paddingY + chartHeight;
  const areaD = `${pathD} L ${lastPt.x} ${bottomY} L ${firstPt.x} ${bottomY} Z`;

  return (
    <div className="area-chart-card">
      <div className="area-chart-header">
        <div>
          <h3 className="area-chart-title">English Performance by Standard</h3>
          <p className="area-chart-subtitle">
            Average English score of students from Standard 1 to Standard 10.
          </p>
        </div>
        <div className="chart-legend-badge">
          <span className="legend-accent-dot" />
          <span>Average English Score (%)</span>
        </div>
      </div>

      <div className="svg-chart-container">
        {/* Y-Axis Labels */}
        <div className="y-axis-labels-column">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <div className="svg-wrapper">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="analytics-svg"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Area fill linear gradient */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#818cf8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>

              {/* Glowing stroke shadow */}
              <filter id="strokeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const lineY = paddingY + chartHeight * ratio;
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={lineY}
                  x2={width - paddingX}
                  y2={lineY}
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area Gradient Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Smooth Curve Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#strokeGlow)"
            />

            {/* Data Point Circles */}
            {points.map((pt) => {
              const isHovered = activePoint === pt.index;
              return (
                <g key={pt.standard} className="chart-node-group">
                  {/* Outer pulse ring on hover */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="#6366f1"
                      fillOpacity="0.2"
                      className="pulse-ring"
                    />
                  )}
                  {/* Inner Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? '6.5' : '4.5'}
                    fill="#ffffff"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    className="point-node"
                    onMouseEnter={() => setActivePoint(pt.index)}
                    onMouseLeave={() => setActivePoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {activePoint !== null && (
            <div
              className="chart-tooltip-bubble"
              style={{
                left: `${(points[activePoint].x / width) * 100}%`,
                top: `${(points[activePoint].y / height) * 100}%`,
              }}
            >
              <div className="tooltip-std-name">{points[activePoint].standard}</div>
              <div className="tooltip-score-value">{points[activePoint].avgScore}% Avg Score</div>
            </div>
          )}
        </div>

        {/* X-Axis Labels Row */}
        <div className="x-axis-labels-row">
          {data.map((item) => (
            <span key={item.standard} className="x-axis-item">
              <span className="full-name">{item.standard}</span>
              <span className="short-name">{item.shortName}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultGraph;
