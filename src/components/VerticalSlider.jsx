import { useRef, useState, useEffect, useCallback } from 'react';
import './VerticalSlider.css';

/* ─── Colour themes ──────────────────────────────────────────────────────── */
const SLIDER_THEMES = {
  red: {
    fillTop: '#ff4455',
    fillBottom: '#ff0022',
    glow: 'rgba(255,34,68,0.5)',
    glowSoft: 'rgba(255,34,68,0.15)',
    tickActive: '#ff4455',
  },
  blue: {
    fillTop: '#44bbff',
    fillBottom: '#0055ff',
    glow: 'rgba(0,170,255,0.5)',
    glowSoft: 'rgba(0,170,255,0.15)',
    tickActive: '#44bbff',
  },
  green: {
    fillTop: '#44ffaa',
    fillBottom: '#00aa55',
    glow: 'rgba(0,255,136,0.5)',
    glowSoft: 'rgba(0,255,136,0.15)',
    tickActive: '#44ffaa',
  },
  orange: {
    fillTop: '#ff8800',
    fillBottom: '#ffdd00',
    glow: 'rgba(255,136,0,0.5)',
    glowSoft: 'rgba(255,136,0,0.15)',
    tickActive: '#ff9933',
  },
  yellow: {
    fillTop: '#ffcc00',
    fillBottom: '#ffe866',
    glow: 'rgba(255,204,0,0.5)',
    glowSoft: 'rgba(255,204,0,0.15)',
    tickActive: '#ffcc00',
  },
};

/* ─── Icon components ────────────────────────────────────────────────────── */
const Icons = {
  volume: ({ size = 40, color = '#888' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9v6h4l5 5V4L7 9H3z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
        fill={color}
        opacity="0.55"
      />
    </svg>
  ),
  bass: ({ size = 40, color = '#888' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3h8a5 5 0 0 1 0 10H6V3z" fill={color} opacity="0.85" />
      <path d="M6 13h9a5 5 0 0 1 0 10H6V13z" fill={color} opacity="0.6" />
    </svg>
  ),
  treble: ({ size = 40, color = '#888' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <text x="4" y="20" fontSize="20" fill={color} fontWeight="bold" opacity="0.85">𝄞</text>
    </svg>
  ),
  temperature: ({ size = 40, color = '#888' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2a3 3 0 0 0-3 3v10.27A5 5 0 1 0 15 15V5a3 3 0 0 0-3-3z" fill={color} opacity="0.5" />
      <circle cx="12" cy="17" r="3" fill={color} opacity="0.85" />
      <rect x="11" y="5" width="2" height="8" rx="1" fill={color} opacity="0.85" />
    </svg>
  ),
  brightness: ({ size = 40, color = '#888' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill={color} opacity="0.85" />
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line
          key={i}
          x1={12 + Math.cos((deg * Math.PI) / 180) * 6}
          y1={12 + Math.sin((deg * Math.PI) / 180) * 6}
          x2={12 + Math.cos((deg * Math.PI) / 180) * 9}
          y2={12 + Math.sin((deg * Math.PI) / 180) * 9}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
    </svg>
  ),
};

/**
 * VerticalSlider — Skeumorphic vertical fader/slider
 *
 * @param {number}   value        Current value (controlled). Default: 50
 * @param {Function} onChange     Callback fired with new numeric value when user drags.
 * @param {number}   min          Minimum value. Default: 0
 * @param {number}   max          Maximum value. Default: 100
 * @param {'red'|'blue'|'green'|'orange'|'yellow'} color
 *                                Colour theme — matches the Gauge component themes.
 *                                Default: 'orange'
 * @param {string}   label        Title text shown at the top of the widget. Default: 'Volume'
 *
 * @param {'volume'|'bass'|'treble'|'temperature'|'brightness'|null} icon
 *   Icon displayed below the label. Supported values:
 *   - 'volume'      — Speaker / audio output icon
 *   - 'bass'        — Bold B shape representing low-frequency bass
 *   - 'treble'      — Musical treble clef (𝄞) for high-frequency control
 *   - 'temperature' — Thermometer for heat / climate controls
 *   - 'brightness'  — Sun / light burst for screen or ambient brightness
 *   - null          — No icon rendered
 *   Default: 'volume'
 *
 * @param {string}   unit         Short unit string shown next to the numeric readout
 *                                (e.g. '%', 'dB', '°C'). Default: ''
 * @param {number}   width        Component width in px. Default: 160
 * @param {number}   height       Component height in px. Default: 420
 * @param {number}   tickCount    Number of major tick pairs on each side. Default: 20
 */
export default function VerticalSlider({
  value = 50,
  onChange,
  min = 0,
  max = 100,
  color = 'orange',
  label = 'Volume',
  icon = 'volume',
  unit = '',
  width = 160,
  height = 420,
  tickCount = 20,
  isDark = true,
}) {
  const theme = SLIDER_THEMES[color] || SLIDER_THEMES.orange;
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartVal = useRef(0);

  /* ─── Track geometry constants ─────────────────────────────────────── */
  const HEADER_H = 130;     // space for label + icon
  const THUMB_H = 72;       // thumb pill height
  const THUMB_W = 52;       // thumb pill width
  const TRACK_PAD = THUMB_H / 2; // padding so thumb centre stays within track
  const TRACK_H = height - HEADER_H - 32; // 32px bottom padding
  const FILL_HEIGHT = ((value - min) / (max - min)) * (TRACK_H - THUMB_H);

  /* ─── Drag logic ───────────────────────────────────────────────────── */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const getValueFromY = useCallback((clientY) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const usableH = rect.height - THUMB_H;
    const relY = clientY - rect.top - THUMB_H / 2;
    const ratio = 1 - clamp(relY / usableH, 0, 1);
    return Math.round(min + ratio * (max - min));
  }, [min, max, THUMB_H]);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY ?? e.touches?.[0]?.clientY;
    dragStartVal.current = value;
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
  }, [value]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const newVal = getValueFromY(clientY);
    onChange?.(newVal);
  }, [getValueFromY, onChange]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  /* Click on track to jump value */
  const onTrackClick = useCallback((e) => {
    if (e.target === thumbRef.current || thumbRef.current?.contains(e.target)) return;
    const newVal = getValueFromY(e.clientY);
    onChange?.(newVal);
  }, [getValueFromY, onChange]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  /* ─── Derived positions ────────────────────────────────────────────── */
  const norm = (value - min) / (max - min);
  // thumb top: 0 = top of track, 1 = bottom of track (minus thumb height)
  const thumbTop = (1 - norm) * (TRACK_H - THUMB_H);

  const IconComp = Icons[icon];

  /* ─── Tick marks ───────────────────────────────────────────────────── */
  const ticks = [];
  const totalTicks = tickCount * 2; // major + minor (alternating)
  for (let i = 0; i <= totalTicks; i++) {
    const t = i / totalTicks;
    const topPct = t * 100;
    const isMajor = i % 2 === 0;
    const tickNormVal = 1 - t; // 1 at top, 0 at bottom
    const isActive = tickNormVal <= norm;
    ticks.push({ topPct, isMajor, isActive });
  }

  return (
    <div
      className="vs-shell"
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        '--vs-width': `${width}px`,
        '--vs-height': `${height}px`,
        '--vs-fill-top': theme.fillTop,
        '--vs-fill-bottom': theme.fillBottom,
        '--vs-glow': theme.glow,
        '--vs-glow-soft': theme.glowSoft,
        '--vs-tick-active': theme.tickActive,
        '--vs-thumb-w': `${THUMB_W}px`,
        '--vs-thumb-h': `${THUMB_H}px`,
        '--vs-header-h': `${HEADER_H}px`,
        '--vs-track-h': `${TRACK_H}px`,
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="vs-header">
        <span className="vs-label">{label}</span>
        {IconComp && (
          <div className="vs-icon">
            <IconComp size={36} color="#777" />
          </div>
        )}
      </div>

      {/* ── Slider body ───────────────────────────────────────────── */}
      <div
        className="vs-track-area"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onClick={onTrackClick}
        style={{ height: TRACK_H }}
      >
        {/* Left ticks */}
        <div className="vs-ticks vs-ticks--left">
          {ticks.map((tick, i) => (
            <span
              key={i}
              className={`vs-tick ${tick.isMajor ? 'vs-tick--major' : 'vs-tick--minor'} ${tick.isActive ? 'vs-tick--active' : ''}`}
              style={{ top: `${tick.topPct}%` }}
            />
          ))}
        </div>

        {/* Center groove + fill */}
        <div className="vs-groove-wrap">
          {/* Dark inset groove channel */}
          <div className="vs-groove">
            {/* Colored fill — rises from bottom to thumb */}
            <div
              className="vs-fill"
              style={{ height: FILL_HEIGHT + THUMB_H / 2 }}
            />
          </div>

          {/* Thumb */}
          <div
            ref={thumbRef}
            className="vs-thumb"
            style={{ top: thumbTop }}
            onPointerDown={onPointerDown}
          >
            {/* Thumb grip lines */}
            <div className="vs-thumb-grip">
              <span /><span /><span />
            </div>
          </div>
        </div>

        {/* Right ticks */}
        <div className="vs-ticks vs-ticks--right">
          {ticks.map((tick, i) => (
            <span
              key={i}
              className={`vs-tick ${tick.isMajor ? 'vs-tick--major' : 'vs-tick--minor'} ${tick.isActive ? 'vs-tick--active' : ''}`}
              style={{ top: `${tick.topPct}%` }}
            />
          ))}
        </div>
      </div>

      {/* ── Value readout ──────────────────────────────────────────── */}
      <div className="vs-readout">
        <span className="vs-value">{Math.round(value)}</span>
        {unit && <span className="vs-unit">{unit}</span>}
      </div>
    </div>
  );
}
