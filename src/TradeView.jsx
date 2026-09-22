import { useMemo, useState } from "react";
import { ArrowsDownUp, X } from "@phosphor-icons/react";
import { CandleChart } from "./charts.jsx";
import { DESK_FEE, ETH_USD, compactUsd, mulberry32, px, signedPct, tone, usd } from "./format.js";
import { Badge, Monogram } from "./ui.jsx";

const FRAMES = ["1m", "5m", "15m", "1h", "4h"];

export function TradeView({ token, openIds, tokens, onSelect, onCloseTab, connected, onConnect }) {
  const [frame, setFrame] = useState("15m");
  const [side, setSide] = useState("buy");
  const [pay, setPay] = useState("0.25");
  const [slip, setSlip] = useState(1);
  const [confirm, setConfirm] = useState(false);

  const amount = Number(pay) || 0;
  const receive = useMemo(() => {
    if (!amount) return 0;
    if (side === "buy") return (amount * ETH_USD / token.price) * (1 - DESK_FEE);
    return (amount * token.price / ETH_USD) * (1 - DESK_FEE);
  }, [amount, side, token.price]);

  const prints = useMemo(() => {
    const rand = mulberry32(token.seed + 9);
    return Array.from({ length: 6 }, (_, i) => {
      const buy = rand() > 0.46;
      const size = 40 + rand() * 900;
      const drift = 1 + (rand() - 0.5) * 0.02;
      return {
        id: i,
        side: buy ? "Buy" : "Sell",
        usd: size,
        price: token.price * drift,
        ago: `${1 + Math.floor(rand() * 48)}m`,
      };
    });
  }, [token]);

  const payLabel = side === "buy" ? "ETH" : token.symbol;
  const recvLabel = side === "buy" ? token.symbol : "ETH";
  const warning = token.score === "risk"
    ? "High risk. The sell sim on this contract failed."
    : token.score === "fresh"
      ? "Too new to score. Treat the check as missing."
      : token.score === "caution"
        ? "Caution. One or more Hood checks are soft."
        : "Verified on the last Hood pass.";

  return (
    <div>
      <div className="pairs" role="tablist" aria-label="Open names">
        {openIds.map((id) => {
          const item = tokens.find((entry) => entry.id === id);
          if (!item) return null;
          return (
            <div key={id} className={`pair${item.id === token.id ? " is-on" : ""}`}>
              <button type="button" onClick={() => onSelect(item.id)} aria-selected={item.id === token.id}>
                <span className="token">
                  <Monogram token={item} size={26} />
                  <span className="meta">
                    <b>{item.symbol}</b>
                    <small>${px(item.price)}</small>
                  </span>
                </span>
              </button>
              <button type="button" className="x" aria-label={`Close ${item.symbol}`} onClick={() => onCloseTab(item.id)}>
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="trade">
        <div>
          <section className="chart-card">
            <div className="chart-top">
              <div className="quote">
                <Monogram token={token} size={40} />
                <div>
                  <div className="who">
                    <b>{token.symbol}</b>
                    <span className="muted"> / ETH</span>
                  </div>
                  <div className="big num">${px(token.price)}</div>
                </div>
              </div>
              <div className="chg-block">
                <span>Change 24h</span>
                <b className={tone(token.ch24h)}>{signedPct(token.ch24h)}</b>
              </div>
            </div>
            <div className="frames">
              {FRAMES.map((item) => (
                <button key={item} type="button" className={`frame${frame === item ? " is-on" : ""}`} onClick={() => setFrame(item)}>
                  {item}
                </button>
              ))}
            </div>
            <CandleChart seed={token.seed} frame={frame} up={token.ch24h >= 0} />
          </section>
          <div className="below">
            <section className="panel">
              <h2>Hood breakdown</h2>
              <Badge score={token.score} />
              <div style={{ marginTop: 8 }}>
                {token.checks.map(([key, label, detail, ok]) => (
                  <div className="check-row" key={key}>
                    <span className="check-label">{label}</span>
                    <span className={ok ? "up" : "down"}>{detail}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel">
              <h2>Recent prints</h2>
              <table className="prints">
                <thead>
                  <tr><th>Side</th><th>Size</th><th>Price</th><th>When</th></tr>
                </thead>
                <tbody>
                  {prints.map((print) => (
                    <tr key={print.id}>
                      <td className={print.side === "Buy" ? "up" : "down"}>{print.side}</td>
                      <td className="num">{compactUsd(print.usd)}</td>
                      <td className="num">${px(print.price)}</td>
                      <td className="num">{print.ago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
        <aside className="swap glass">
          <h2>Swap</h2>
          <div className="swap-side">
            <header>
              <span>You pay</span>
              <span className="asset-pill"><Monogram token={side === "buy" ? { ...token, symbol: "E", swatch: "#c5d4ee" } : token} size={20} /> {payLabel}</span>
            </header>
            <input
              aria-label="Pay amount"
              inputMode="decimal"
              value={pay}
              onChange={(event) => setPay(event.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <button type="button" className="flip" aria-label="Flip side" onClick={() => setSide((cur) => (cur === "buy" ? "sell" : "buy"))}>
            <ArrowsDownUp size={16} />
          </button>
          <div className="swap-side">
            <header>
              <span>You receive</span>
              <span className="asset-pill"><Monogram token={side === "sell" ? { ...token, symbol: "E", swatch: "#c5d4ee" } : token} size={20} /> {recvLabel}</span>
            </header>
            <input readOnly aria-label="Receive amount" value={receive ? receive.toLocaleString("en-US", { maximumFractionDigits: side === "buy" ? 2 : 6 }) : "0"} />
          </div>
          <div className="slip-row" style={{ marginTop: 12 }}>
            <span>Slippage</span>
            <div className="slip">
              {[0.5, 1, 3].map((value) => (
                <button key={value} type="button" className={slip === value ? "is-on" : ""} onClick={() => setSlip(value)}>
                  {value}%
                </button>
              ))}
            </div>
          </div>
          <p className="fee-line">Desk fee 0.30% · ETH reference {usd(ETH_USD)}</p>
          <p className="safety-note"><strong>{warning}</strong> A live desk re-scores this pair before the wallet signature.</p>
          {connected ? (
            <button type="button" className="connect primary" onClick={() => setConfirm(true)}>Review swap</button>
          ) : (
            <button type="button" className="connect primary" onClick={onConnect}>Connect wallet</button>
          )}
        </aside>
      </div>
      {confirm ? (
        <div className="modal-back" onClick={() => setConfirm(false)}>
          <div className="modal glass" role="dialog" aria-label="Review swap" onClick={(event) => event.stopPropagation()}>
            <h2>Review {token.symbol}</h2>
            <p>
              {side === "buy" ? "Buy" : "Sell"} {amount || 0} {payLabel} for about {receive ? receive.toLocaleString("en-US", { maximumFractionDigits: 4 }) : 0} {recvLabel}. Slippage {slip}%. {warning}
            </p>
            <p>This preview does not send a transaction and does not hold a key.</p>
            <div className="modal-actions">
              <button type="button" className="text-btn" onClick={() => setConfirm(false)}>Back</button>
              <button
                type="button"
                className="connect"
                onClick={() => {
                  setConfirm(false);
                  window.dispatchEvent(new CustomEvent("giwa-toast", { detail: "Preview only. Nothing was sent." }));
                }}
              >
                Confirm preview
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
