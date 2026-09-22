export const ETH_USD = 3284.6;
export const DESK_FEE = 0.003;

function trimNum(value, digits) {
  return value.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function compactUsd(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${trimNum(abs / 1_000_000_000, 2)}B`;
  if (abs >= 1_000_000) return `${sign}$${trimNum(abs / 1_000_000, 2)}M`;
  if (abs >= 1_000) return `${sign}$${trimNum(abs / 1_000, 1)}k`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function usd(n, digits = 2) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function px(n) {
  if (n >= 1000) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (n >= 1) return trimNum(n, 3);
  if (n >= 0.01) return trimNum(n, 4);
  const precise = n.toPrecision(3);
  const shown = precise.includes("e") ? n.toFixed(8) : precise;
  return shown.replace(/(\.\d*?)0+$/, "$1");
}

export function signedPct(n) {
  const body = Math.abs(n).toFixed(1);
  if (n > 0) return `+${body}%`;
  if (n < 0) return `-${body}%`;
  return "0.0%";
}

export function signedUsd(n) {
  const body = usd(Math.abs(n));
  if (n > 0) return `+${body}`;
  if (n < 0) return `-${body}`;
  return body;
}

export function ageLabel(hours) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function tone(n) {
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

export function scoreLabel(score) {
  if (score === "verified") return "Verified";
  if (score === "caution") return "Caution";
  if (score === "risk") return "High risk";
  return "Too new";
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function series(seed, count = 48) {
  const rand = mulberry32(seed);
  let price = 1 + rand();
  const candles = [];
  for (let i = 0; i < count; i += 1) {
    const drift = (rand() - 0.48) * 0.045;
    const open = price;
    const close = Math.max(0.15, open * (1 + drift));
    const high = Math.max(open, close) * (1 + rand() * 0.018);
    const low = Math.min(open, close) * (1 - rand() * 0.018);
    const volume = 0.25 + rand();
    candles.push({ open, high, low, close, volume });
    price = close;
  }
  const last = candles[candles.length - 1].close;
  return candles.map((c) => ({
    open: c.open / last,
    high: c.high / last,
    low: c.low / last,
    close: c.close / last,
    volume: c.volume,
  }));
}
