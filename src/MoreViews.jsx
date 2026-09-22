import { useState } from "react";
import { DESKS, TOKENS } from "./data.js";
import { usd } from "./format.js";

const START = [
  { id: 1, symbol: "HANOK", rule: "24h move beyond 8%", channel: "Telegram" },
  { id: 2, symbol: "CHEONG", rule: "Score moves to High risk", channel: "Telegram" },
  { id: 3, symbol: "NURI", rule: "Liquidity lock confirms", channel: "Desk" },
];

export function AlertsView() {
  const [rows, setRows] = useState(START);
  const [symbol, setSymbol] = useState(TOKENS[0].symbol);
  const [rule, setRule] = useState("24h move beyond 8%");

  return (
    <div className="stack">
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          setRows((cur) => [{ id: Date.now(), symbol, rule, channel: "Telegram" }, ...cur]);
        }}
      >
        <select aria-label="Token" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
          {TOKENS.map((token) => <option key={token.id}>{token.symbol}</option>)}
        </select>
        <select aria-label="Rule" value={rule} onChange={(event) => setRule(event.target.value)}>
          <option>24h move beyond 8%</option>
          <option>Score moves to High risk</option>
          <option>Liquidity lock confirms</option>
          <option>Volume crosses $500k</option>
        </select>
        <button type="submit" className="connect">Arm alert</button>
      </form>
      {rows.length === 0 ? <div className="empty">No alerts armed.</div> : null}
      {rows.map((row) => (
        <div className="alert" key={row.id}>
          <div>
            <b>{row.symbol}</b>
            <div className="muted">{row.rule}</div>
          </div>
          <div className="muted">{row.channel}</div>
          <span className="badge verified">Armed</span>
          <button type="button" className="text-btn" onClick={() => setRows((cur) => cur.filter((item) => item.id !== row.id))}>
            Remove
          </button>
        </div>
      ))}
      <p className="hint">Telegram delivery is a later phase. These rules stay on this desk for now.</p>
    </div>
  );
}

export function DeskView() {
  return (
    <div>
      <div className="desk-intro">
        <p>Signal Desk opens after a wallet clears a stats gate on closed round-trips. The rows below are samples, not live creators.</p>
      </div>
      <div className="gate">
        <span><b>50</b> closed trips</span>
        <span><b>55%</b> win rate on the last 50</span>
        <span><b>1.30</b> profit factor</span>
        <span>Drawdown inside <b>40%</b></span>
      </div>
      <div className="stack">
        {DESKS.map((desk) => (
          <article className="desk-row" key={desk.handle}>
            <div>
              <b>{desk.name}</b>
              <div className="muted">@{desk.handle}</div>
            </div>
            <div className="muted">{desk.note}</div>
            <div className="num">
              {desk.win.toFixed(1)}% win
              <div className="muted">{desk.pf.toFixed(2)} pf · {desk.trips} trips · {desk.dd.toFixed(1)}% dd</div>
            </div>
            <div className="num">
              {usd(desk.price)}/mo
              <div className="muted">{desk.subs} subs</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
