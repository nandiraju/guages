import { useState, useEffect } from 'react';
import Gauge from './components/Gauge';
import VerticalSlider from './components/VerticalSlider';
import './App.css';

const DEMO_SCENARIOS = [
  {
    id: 'dashboard',
    label: '🚗 Vehicle Dashboard',
    gauges: [
      { color: 'red',    label: 'RPM',   unit: 'x1000', min: 0,  max: 9,    value: 3.2, dangerZone: 7   },
      { color: 'blue',   label: 'Speed', unit: 'km/h',  min: 0,  max: 260,  value: 120, dangerZone: 200 },
      { color: 'orange', label: 'Fuel',  unit: '%',     min: 0,  max: 100,  value: 68,  dangerZone: 20  },
      { color: 'green',  label: 'Temp',  unit: '°C',    min: 60, max: 130,  value: 92,  dangerZone: 110 },
    ],
  },
  {
    id: 'server',
    label: '🖥️ Server Monitor',
    gauges: [
      { color: 'blue',   label: 'CPU',     unit: '%',    min: 0, max: 100,  value: 45,  dangerZone: 80  },
      { color: 'green',  label: 'Memory',  unit: 'GB',   min: 0, max: 64,   value: 28,  dangerZone: 52  },
      { color: 'yellow', label: 'Disk I/O',unit: 'MB/s', min: 0, max: 500,  value: 180, dangerZone: 420 },
      { color: 'orange', label: 'Network', unit: 'Mbps', min: 0, max: 1000, value: 340, dangerZone: 850 },
    ],
  },
  {
    id: 'power',
    label: '⚡ Power Station',
    gauges: [
      { color: 'yellow', label: 'Voltage',    unit: 'kV', min: 0, max: 500,  value: 220, dangerZone: 420 },
      { color: 'orange', label: 'Current',    unit: 'A',  min: 0, max: 1000, value: 650, dangerZone: 850 },
      { color: 'red',    label: 'Load',       unit: 'MW', min: 0, max: 200,  value: 148, dangerZone: 170 },
      { color: 'green',  label: 'Efficiency', unit: '%',  min: 0, max: 100,  value: 92,  dangerZone: 0   },
    ],
  },
];

const COLOR_LABELS = { red: 'Red', blue: 'Blue', green: 'Green', orange: 'Orange', yellow: 'Yellow' };

const SLIDER_DEMOS = [
  { color: 'orange', label: 'Volume',     icon: 'volume',      value: 65 },
  { color: 'blue',   label: 'Bass',       icon: 'bass',        value: 40 },
  { color: 'green',  label: 'Brightness', icon: 'brightness',  value: 80 },
  { color: 'red',    label: 'Treble',     icon: 'treble',      value: 30 },
  { color: 'yellow', label: 'Temp',       icon: 'temperature', value: 55 },
];

export default function App() {
  const [activeScenario, setActiveScenario]   = useState(0);
  const [gaugeValues, setGaugeValues]         = useState({});
  const [isLive, setIsLive]                   = useState(true);
  const [customColor, setCustomColor]         = useState('blue');
  const [customValue, setCustomValue]         = useState(50);
  const [isDark, setIsDark]                   = useState(true);
  const [sliderValues, setSliderValues]       = useState(() =>
    Object.fromEntries(SLIDER_DEMOS.map((s, i) => [i, s.value]))
  );

  const scenario = DEMO_SCENARIOS[activeScenario];

  useEffect(() => {
    const vals = {};
    scenario.gauges.forEach((g, i) => { vals[i] = g.value; });
    setGaugeValues(vals);
  }, [activeScenario]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setGaugeValues(prev => {
        const next = { ...prev };
        scenario.gauges.forEach((g, i) => {
          const range = g.max - g.min;
          const delta = (Math.random() - 0.5) * range * 0.08;
          next[i] = parseFloat(Math.max(g.min, Math.min(g.max, (next[i] ?? g.value) + delta)).toFixed(2));
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive, activeScenario, scenario.gauges]);

  const gaugeSize = typeof window !== 'undefined' && window.innerWidth < 480 ? 170 : 220;

  return (
    <div className="app" data-theme={isDark ? 'dark' : 'light'}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">⚙</div>
          <div>
            <h1 className="header-title">GlassDial</h1>
            <p className="header-subtitle">Skeumorphic 3D Instrument Components</p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-badge">React · Canvas · CSS3</div>
          <button
            id="btn-theme-toggle"
            className="theme-toggle"
            onClick={() => setIsDark(v => !v)}
            aria-label="Toggle colour theme"
          >
            <span>{isDark ? '🌙' : '☀️'}</span>
            <div className="theme-switch">
              <div className="theme-switch-knob" />
            </div>
            <span>{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </header>

      {/* ── Scenario Tabs ────────────────────────────────────────── */}
      <nav className="scenario-nav">
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            id={`tab-${s.id}`}
            className={`tab-btn ${i === activeScenario ? 'tab-active' : ''}`}
            onClick={() => setActiveScenario(i)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* ── Live Toggle ──────────────────────────────────────────── */}
      <div className="controls-row">
        <div className="live-badge">
          <span className={`live-dot ${isLive ? 'live-dot--active' : ''}`} />
          <span>{isLive ? 'Live Simulation' : 'Static Values'}</span>
        </div>
        <button
          id="btn-toggle-live"
          className={`toggle-btn ${isLive ? 'toggle-btn--active' : ''}`}
          onClick={() => setIsLive(v => !v)}
        >
          {isLive ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>

      {/* ── Gauge Grid ───────────────────────────────────────────── */}
      <section className="gauge-section">
        <h2 className="section-title">{scenario.label}</h2>
        <div className="gauge-grid">
          {scenario.gauges.map((g, i) => (
            <div key={i} className="gauge-card">
              <Gauge
                value={gaugeValues[i] ?? g.value}
                min={g.min} max={g.max}
                color={g.color} label={g.label} unit={g.unit}
                size={gaugeSize} dangerZone={g.dangerZone} animated
                isDark={isDark}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Vertical Slider Demo ─────────────────────────────────── */}
      <section className="slider-section">
        <h2 className="section-title">🎚️ Vertical Fader — Skeumorphic Slider</h2>
        <p className="section-desc">Drag any fader to interact. Each uses a different color theme.</p>
        <div className="slider-grid">
          {SLIDER_DEMOS.map((s, i) => (
            <VerticalSlider
              key={i}
              value={sliderValues[i]}
              onChange={val => setSliderValues(prev => ({ ...prev, [i]: val }))}
              color={s.color}
              label={s.label}
              icon={s.icon}
              width={140}
              height={400}
              isDark={isDark}
            />
          ))}
        </div>
      </section>

      {/* ── Gauge Playground ─────────────────────────────────────── */}
      <section className="playground-section">
        <h2 className="section-title">🎨 Gauge Playground</h2>
        <p className="section-desc">Try the color parameter and value live.</p>
        <div className="playground-layout">
          <div className="playground-controls">
            <div className="control-group">
              <label className="control-label">Color Theme</label>
              <div className="color-pills">
                {Object.entries(COLOR_LABELS).map(([key, name]) => (
                  <button
                    key={key}
                    id={`color-pill-${key}`}
                    className={`color-pill color-pill--${key} ${customColor === key ? 'color-pill--selected' : ''}`}
                    onClick={() => setCustomColor(key)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label className="control-label">Value: <strong>{customValue}</strong></label>
              <input
                id="slider-value" type="range" min={0} max={100} step={1}
                value={customValue}
                onChange={e => setCustomValue(Number(e.target.value))}
                className="value-slider"
                style={{ '--slider-color': `var(--theme-${customColor})` }}
              />
              <div className="slider-labels"><span>0</span><span>50</span><span>100</span></div>
            </div>
            <div className="code-snippet">
              <span className="code-label">Usage</span>
              <pre className="code-block">{`<Gauge
  color="${customColor}"
  value={${customValue}}
  min={0} max={100}
  unit="%" label="Custom"
/>`}</pre>
            </div>
          </div>
          <div className="playground-preview">
            <Gauge
              value={customValue} min={0} max={100}
              color={customColor} label="Custom" unit="%"
              size={typeof window !== 'undefined' && window.innerWidth < 480 ? 200 : 260}
              dangerZone={80} animated isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* ── Slider Playground ─────────────────────────────────────── */}
      <section className="playground-section">
        <h2 className="section-title">🎛️ Fader Playground</h2>
        <p className="section-desc">Use the same color prop as the Gauge component.</p>
        <div className="playground-layout">
          <div className="playground-controls">
            <div className="control-group">
              <label className="control-label">Color Theme</label>
              <div className="color-pills">
                {Object.entries(COLOR_LABELS).map(([key, name]) => (
                  <button
                    key={key}
                    id={`slider-color-pill-${key}`}
                    className={`color-pill color-pill--${key} ${customColor === key ? 'color-pill--selected' : ''}`}
                    onClick={() => setCustomColor(key)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="code-snippet">
              <span className="code-label">Usage · Available Icons</span>
              <pre className="code-block">{`<VerticalSlider
  color="${customColor}"
  value={${customValue}}
  label="Volume"
  onChange={setVal}

  // icon prop — pick one:
  icon="volume"      // 🔊 speaker
  icon="bass"        // 𝄢  low-freq
  icon="treble"      // 𝄞  high-freq
  icon="temperature" // 🌡 thermometer
  icon="brightness"  // ☀️  sun burst
  icon={null}        //    no icon
/>`}</pre>
            </div>
          </div>
          <div className="playground-preview">
            <VerticalSlider
              value={customValue}
              onChange={setCustomValue}
              color={customColor}
              label="Volume"
              icon="volume"
              width={150}
              height={380}
              isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* ── Gauge Showcase ───────────────────────────────────────── */}
      <section className="showcase-section">
        <h2 className="section-title">🎭 Gauge — All Themes at 75%</h2>
        <div className="showcase-grid">
          {['red', 'blue', 'green', 'orange', 'yellow'].map(col => (
            <div key={col} className="showcase-item">
              <Gauge
                value={75} min={0} max={100}
                color={col} label={COLOR_LABELS[col]} unit="%"
                size={typeof window !== 'undefined' && window.innerWidth < 480 ? 150 : 180}
                animated isDark={isDark}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="app-footer">
        <p>GlassDial · Gauge + Vertical Fader · Built with React + Canvas API</p>
      </footer>
    </div>
  );
}
