import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, PushPin, WarningCircle, X } from "@phosphor-icons/react";
import { Spark } from "./charts.jsx";
import { ageLabel, compactUsd, px, signedPct, tone } from "./format.js";
import { Badge, Monogram, TileMark } from "./ui.jsx";

function place(rect, height, sheet) {
  if (sheet) return { left: 10, top: 10 };
  const width = 360;
  let left = rect.left + 188;
  let top = rect.top - 6;
  if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
  if (left < 12) left = 12;
  if (top + height > window.innerHeight - 12) top = window.innerHeight - height - 12;
  if (top < 12) top = 12;
  return { left, top };
}

export function InspectCard({ token, pinned, anchor, sheet, onPin, onClose, onEnter, onLeave }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState(() => place(anchor, 480, sheet));

  useLayoutEffect(() => {
    const height = cardRef.current?.offsetHeight || 480;
    setPos(place(anchor, height, sheet));
  }, [anchor, sheet, token.id]);

  return createPortal(
    <aside
      ref={cardRef}
      className={`inspect glass${sheet ? " is-sheet" : ""}`}
      style={sheet ? undefined : { left: pos.left, top: pos.top }}
      role={pinned ? "dialog" : "complementary"}
      aria-label={`${token.symbol} scan card`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="inspect-head">
        <div className="token">
          <Monogram token={token} />
          <div className="who">
            <span className="sym">{token.symbol}</span>
            <span className="name">{token.name}</span>
          </div>
        </div>
        <div className="inspect-side">
          <div className="px">
            <span className="num">${px(token.price)}</span>
            <span className={`chg ${tone(token.ch24h)}`}>{signedPct(token.ch24h)}</span>
          </div>
          <div className="inspect-tools">
            <button type="button" className={pinned ? "is-on" : ""} aria-pressed={pinned} aria-label={pinned ? "Unpin scan card" : "Pin scan card"} onClick={onPin}>
              <PushPin size={14} weight={pinned ? "fill" : "regular"} />
            </button>
            <button type="button" aria-label="Close scan card" onClick={onClose}><X size={14} /></button>
          </div>
        </div>
      </div>
      <Spark seed={token.seed} up={token.ch24h >= 0} />
      <dl className="stat-grid">
        <div><dt>24h volume</dt><dd className="num">{compactUsd(token.vol)}</dd></div>
        <div><dt>Market cap</dt><dd className="num">{compactUsd(token.mcap)}</dd></div>
        <div><dt>Liquidity</dt><dd className="num">{compactUsd(token.liq)}</dd></div>
        <div><dt>Low</dt><dd className="num">${px(token.low)}</dd></div>
        <div><dt>High</dt><dd className="num">${px(token.high)}</dd></div>
        <div><dt>Age</dt><dd className="num">{ageLabel(token.ageH)}</dd></div>
      </dl>
      <div className="hood-label">Hood scan <Badge score={token.score} /></div>
      {token.checks.map(([key, label, detail, ok]) => (
        <div className="check-row" key={key}>
          <span className="check-label">
            {ok
              ? <CheckCircle className="pass" size={15} weight="light" />
              : <WarningCircle className="fail" size={15} weight="light" />}
            {label}
          </span>
          <span className={`num ${ok ? "pass" : "fail"}`}>{detail}</span>
        </div>
      ))}
      <div className="powered">
        <span>Powered by</span>
        <b style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><TileMark /> HOODSCAN</b>
      </div>
    </aside>,
    document.body,
  );
}
