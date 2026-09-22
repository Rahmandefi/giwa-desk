export function TileMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 16.5c2.1-6.2 5.4-9 7.5-9s5.4 2.8 7.5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.2 16.5c1.3-3.4 3-5.2 4.8-5.2s3.5 1.8 4.8 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Monogram({ token, size = 28 }) {
  return (
    <span className="monogram" style={{ background: token.swatch, width: size, height: size }} aria-hidden="true">
      {token.symbol.slice(0, 2)}
    </span>
  );
}

export function Badge({ score }) {
  const label = score === "verified" ? "Verified"
    : score === "caution" ? "Caution"
    : score === "risk" ? "High risk"
    : "Too new";
  return <span className={`badge ${score}`}>{label}</span>;
}
