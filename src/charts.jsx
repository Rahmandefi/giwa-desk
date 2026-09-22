import { series } from "./format.js";

function bounds(candles) {
  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    min = Math.min(min, c.low);
    max = Math.max(max, c.high);
  }
  if (min === max) {
    min *= 0.98;
    max *= 1.02;
  }
  const pad = (max - min) * 0.08;
  return { min: min - pad, max: max + pad };
}

function alignDirection(candles, up) {
  const rose = candles[candles.length - 1].close >= candles[0].open;
  if (rose !== up) return candles.slice().reverse();
  return candles;
}

export function Spark({ seed, up, width = 300, height = 72 }) {
  const candles = alignDirection(series(seed, 36), up);
  const { min, max } = bounds(candles);
  const step = width / (candles.length - 1);
  const y = (v) => ((max - v) / (max - min)) * (height - 8) + 4;
  const d = candles
    .map((c, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(c.close)}`)
    .join(" ");
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Price path">
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function CandleChart({ seed, frame, up = true }) {
  const count = frame === "1m" ? 64 : frame === "15m" ? 48 : frame === "4h" ? 32 : 42;
  const candles = alignDirection(series(seed + count * 17, count), up);
  const { min, max } = bounds(candles);
  const w = 720;
  const h = 280;
  const volH = 56;
  const gap = 10;
  const slot = w / candles.length;
  const bodyW = Math.max(3, slot * 0.62);
  const y = (v) => ((max - v) / (max - min)) * (h - 16) + 8;
  const grid = [0.25, 0.5, 0.75].map((g) => 8 + g * (h - 16));

  return (
    <svg className="candles" viewBox={`0 0 ${w} ${h + gap + volH}`} role="img" aria-label="Price chart">
      {grid.map((gy) => (
        <line key={gy} x1="0" x2={w} y1={gy} y2={gy} className="grid-line" />
      ))}
      {candles.map((c, i) => {
        const x = i * slot + slot / 2;
        const rising = c.close >= c.open;
        const top = y(Math.max(c.open, c.close));
        const bot = y(Math.min(c.open, c.close));
        const vh = (c.volume / 1.25) * (volH - 6);
        return (
          <g key={i} className={rising ? "up" : "down"}>
            <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} />
            <rect x={x - bodyW / 2} y={top} width={bodyW} height={Math.max(1, bot - top)} rx="1" />
            <rect
              x={x - bodyW / 2}
              y={h + gap + volH - vh}
              width={bodyW}
              height={vh}
              opacity="0.45"
              rx="1"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function Cumulative({ values }) {
  const w = 640;
  const h = 120;
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / Math.max(1, values.length - 1);
  const y = (v) => 8 + ((max - v) / span) * (h - 16);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(v)}`).join(" ");
  const area = `${line} L ${(values.length - 1) * step} ${h} L 0 ${h} Z`;
  return (
    <svg className="cumulative" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Cumulative PnL">
      <path d={area} className="area" />
      <path d={line} className="line" />
    </svg>
  );
}
