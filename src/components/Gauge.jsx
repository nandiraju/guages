import { useEffect, useRef, useState } from 'react';
import './Gauge.css';

const COLOR_THEMES = {
  red: {
    primary: '#ff2244',
    secondary: '#ff6680',
    glow: 'rgba(255, 34, 68, 0.7)',
    glowSoft: 'rgba(255, 34, 68, 0.2)',
    needle: '#ff2244',
    tickActive: '#ff4466',
    arcGradientStart: '#ff2244',
    arcGradientEnd: '#ff6680',
    rimStart: '#3a0a10',
    rimEnd: '#8b1a2e',
  },
  blue: {
    primary: '#00aaff',
    secondary: '#44ccff',
    glow: 'rgba(0, 170, 255, 0.7)',
    glowSoft: 'rgba(0, 170, 255, 0.2)',
    needle: '#00aaff',
    tickActive: '#33bbff',
    arcGradientStart: '#0077ff',
    arcGradientEnd: '#44ccff',
    rimStart: '#001a33',
    rimEnd: '#003366',
  },
  green: {
    primary: '#00ff88',
    secondary: '#44ffaa',
    glow: 'rgba(0, 255, 136, 0.7)',
    glowSoft: 'rgba(0, 255, 136, 0.2)',
    needle: '#00ff88',
    tickActive: '#33ffaa',
    arcGradientStart: '#00cc66',
    arcGradientEnd: '#44ffaa',
    rimStart: '#001a0d',
    rimEnd: '#003319',
  },
  orange: {
    primary: '#ff7700',
    secondary: '#ffaa44',
    glow: 'rgba(255, 119, 0, 0.7)',
    glowSoft: 'rgba(255, 119, 0, 0.2)',
    needle: '#ff7700',
    tickActive: '#ff9933',
    arcGradientStart: '#ff5500',
    arcGradientEnd: '#ffaa44',
    rimStart: '#1a0a00',
    rimEnd: '#4d2200',
  },
  yellow: {
    primary: '#ffdd00',
    secondary: '#ffee66',
    glow: 'rgba(255, 221, 0, 0.7)',
    glowSoft: 'rgba(255, 221, 0, 0.2)',
    needle: '#ffdd00',
    tickActive: '#ffee44',
    arcGradientStart: '#ffaa00',
    arcGradientEnd: '#ffee66',
    rimStart: '#1a1500',
    rimEnd: '#4d3d00',
  },
};

/**
 * Gauge Component - Skeumorphic 3D Glass Gauge
 *
 * @param {object} props
 * @param {number} props.value          - Current value (default: 0)
 * @param {number} props.min            - Minimum value (default: 0)
 * @param {number} props.max            - Maximum value (default: 100)
 * @param {'red'|'blue'|'green'|'orange'|'yellow'} props.color - Color theme
 * @param {string} props.label          - Label text shown below value
 * @param {string} props.unit           - Unit string (e.g. "km/h", "RPM")
 * @param {number} props.size           - Diameter in px (default: 280)
 * @param {boolean} props.animated      - Animate needle on mount (default: true)
 * @param {number} props.dangerZone     - Value at which ticks turn color (0 = none)
 * @param {number} props.tickCount      - Number of major tick marks (default: 11)
 */
export default function Gauge({
  value = 0,
  min = 0,
  max = 100,
  color = 'blue',
  label = '',
  unit = '',
  size = 280,
  animated = true,
  dangerZone = 80,
  tickCount = 11,
  isDark = true,
}) {
  const canvasRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(animated ? min : value);
  const animFrameRef = useRef(null);
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;

  // Face colour palette — switches with isDark
  const face = isDark ? {
    outer:         '#0a0a0f',
    c0:            '#2a2a35',
    c1:            '#18181f',
    c2:            '#0d0d12',
    tickInactive:  'rgba(255,255,255,0.25)',
    labelInactive: 'rgba(255,255,255,0.4)',
    needleTail:    'rgba(255,255,255,0.4)',
    hub0:          '#888',
    hub1:          '#444',
    hub2:          '#111',
    hubShadow:     'rgba(0,0,0,0.8)',
  } : {
    outer:         '#b0aaa2',
    c0:            '#d8d4cc',
    c1:            '#e4e0d8',
    c2:            '#f0ece4',
    tickInactive:  'rgba(60,50,40,0.28)',
    labelInactive: 'rgba(50,40,30,0.45)',
    needleTail:    'rgba(60,50,40,0.35)',
    hub0:          '#aaa8a4',
    hub1:          '#888480',
    hub2:          '#555250',
    hubShadow:     'rgba(0,0,0,0.3)',
  };

  // Animate value on change
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const start = displayValue;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = start + (end - start) * easedProgress;
      setDisplayValue(current);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [value]);

  // Draw gauge on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const s = size * dpr;
    canvas.width = s;
    canvas.height = s;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;

    // Gauge arc spans 240 degrees: from 150° to 390° (30° past 360°)
    const startAngle = (150 * Math.PI) / 180;
    const endAngle = (390 * Math.PI) / 180;
    const totalAngle = endAngle - startAngle;

    const norm = (v) => Math.max(0, Math.min(1, (v - min) / (max - min)));

    // ── Background: fill entire canvas circle so no grey bezel shows ────
    // Draw from edge (size*0.5) all the way in, then a darker face on top
    const fullR = size * 0.5;

    // 1. Outer dark annulus fills the gap between face circle and canvas edge
    ctx.beginPath();
    ctx.arc(cx, cy, fullR, 0, 2 * Math.PI);
    ctx.fillStyle = face.outer;
    ctx.fill();

    // 2. Main face gradient (deep-dish bowl)
    const bgGrad = ctx.createRadialGradient(cx, cy * 0.85, radius * 0.05, cx, cy, radius);
    bgGrad.addColorStop(0, face.c0);
    bgGrad.addColorStop(0.6, face.c1);
    bgGrad.addColorStop(1, face.c2);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // ── Active arc (progress) ────────────────────────────────────────────
    const valueAngle = startAngle + norm(displayValue) * totalAngle;
    if (norm(displayValue) > 0) {
      const arcGrad = ctx.createLinearGradient(
        cx - radius, cy,
        cx + radius, cy
      );
      arcGrad.addColorStop(0, theme.arcGradientStart);
      arcGrad.addColorStop(1, theme.arcGradientEnd);

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.82, startAngle, valueAngle);
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = size * 0.04;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow on active arc
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = size * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.82, startAngle, valueAngle);
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = size * 0.012;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ── Tick marks ───────────────────────────────────────────────────────
    const minorTickCount = (tickCount - 1) * 4;
    const totalTicks = minorTickCount + tickCount;

    for (let i = 0; i <= minorTickCount + (tickCount - 1); i++) {
      const isMajor = i % 4 === 0;
      const tickNorm = i / (minorTickCount + tickCount - 1);
      const angle = startAngle + tickNorm * totalAngle;
      const outerR = radius * 0.92;
      const innerR = isMajor ? radius * 0.72 : radius * 0.82;
      const tickValue = min + tickNorm * (max - min);
      const isActive = tickValue <= displayValue;
      const isDanger = dangerZone > 0 && tickValue >= dangerZone;

      const x1 = cx + Math.cos(angle) * outerR;
      const y1 = cy + Math.sin(angle) * outerR;
      const x2 = cx + Math.cos(angle) * innerR;
      const y2 = cy + Math.sin(angle) * innerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (isActive && isDanger) {
        ctx.strokeStyle = theme.primary;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 6;
      } else if (isActive) {
        ctx.strokeStyle = theme.tickActive;
        ctx.shadowColor = theme.glowSoft;
        ctx.shadowBlur = 4;
      } else {
        ctx.strokeStyle = face.tickInactive;
        ctx.shadowBlur = 0;
      }

      ctx.lineWidth = isMajor ? size * 0.007 : size * 0.003;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ── Tick labels ──────────────────────────────────────────────────────
    const labelR = radius * 0.62;
    const step = (max - min) / (tickCount - 1);
    ctx.font = `bold ${size * 0.055}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const angle = startAngle + t * totalAngle;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;
      const labelVal = Math.round(min + t * (max - min));
      const isActive = labelVal <= displayValue;

      ctx.fillStyle = isActive
        ? theme.secondary
        : face.labelInactive;
      ctx.fillText(String(labelVal), lx, ly);
    }

    // ── Needle ───────────────────────────────────────────────────────────
    const needleAngle = startAngle + norm(displayValue) * totalAngle;
    const needleLength = radius * 0.72;
    const needleTailLength = radius * 0.18;

    // Needle shadow
    ctx.save();
    ctx.translate(cx + 3, cy + 3);
    ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(-needleTailLength, 0);
    ctx.lineTo(needleLength, 0);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = size * 0.012;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Needle body
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);

    const needleGrad = ctx.createLinearGradient(-needleTailLength, -size * 0.01, needleLength, size * 0.01);
    needleGrad.addColorStop(0, face.needleTail);
    needleGrad.addColorStop(0.3, theme.needle);
    needleGrad.addColorStop(1, theme.secondary);

    ctx.beginPath();
    ctx.moveTo(-needleTailLength, size * 0.006);
    ctx.lineTo(needleLength * 0.9, size * 0.003);
    ctx.lineTo(needleLength, 0);
    ctx.lineTo(needleLength * 0.9, -size * 0.003);
    ctx.lineTo(-needleTailLength, -size * 0.006);
    ctx.closePath();
    ctx.fillStyle = needleGrad;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = size * 0.05;
    ctx.fill();
    ctx.restore();

    // ── Center hub ────────────────────────────────────────────────────────
    const hubRadius = size * 0.06;
    const hubGrad = ctx.createRadialGradient(cx - hubRadius * 0.3, cy - hubRadius * 0.3, 0, cx, cy, hubRadius);
    hubGrad.addColorStop(0, face.hub0);
    hubGrad.addColorStop(0.4, face.hub1);
    hubGrad.addColorStop(1, face.hub2);
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = face.hubShadow;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hub ring
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hub shine dot
    ctx.beginPath();
    ctx.arc(cx - hubRadius * 0.25, cy - hubRadius * 0.25, hubRadius * 0.25, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

  }, [displayValue, size, theme, face, min, max, dangerZone, tickCount]);

  const roundedValue = Math.round(displayValue);

  return (
    <div
      className="gauge-wrapper"
      style={{
        '--gauge-size': `${size}px`,
        '--gauge-primary': theme.primary,
        '--gauge-glow': theme.glow,
        '--gauge-glow-soft': theme.glowSoft,
        '--gauge-rim-start': theme.rimStart,
        '--gauge-rim-end': theme.rimEnd,
      }}
    >
      {/* Outer chrome bezel */}
      <div className="gauge-bezel">
        {/* Glass dome overlay */}
        <div className="gauge-glass">
          <div className="gauge-glass-shine" />
          <div className="gauge-glass-highlight" />
        </div>

        {/* Canvas — absolutely centred so the chrome rim shows evenly */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${size - 12}px`,
            height: `${size - 12}px`,
            borderRadius: '50%',
            display: 'block',
          }}
        />

        {/* Digital readout */}
        <div className="gauge-readout">
          <span className="gauge-value">{roundedValue}</span>
          {unit && <span className="gauge-unit">{unit}</span>}
        </div>
      </div>

      {/* Label below */}
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}
