import { useMemo, useState } from "react";
import { Cumulative } from "./charts.jsx";
import { HOLDINGS, SEPTEMBER, findToken } from "./data.js";
import { ETH_USD, signedPct, signedUsd, tone, usd } from "./format.js";
import { Monogram } from "./ui.jsx";

const PERIODS = ["7D", "1M"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function BookView() {
  const [period, setPeriod] = useState("1M");
  const rows = HOLDINGS.map((lot) => {
    const token = findToken(lot.id);
    const value = lot.amount * token.price;
    const pnl = lot.amount * (token.price - lot.cost);
    const pct = ((token.price - lot.cost) / lot.cost) * 100;
    return { token, amount: lot.amount, value, pnl, pct };
  });
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const openPnl = rows.reduce((sum, row) => sum + row.pnl, 0);
  const monthNet = Object.values(SEPTEMBER).reduce((sum, n) => sum + n, 0);

  const cells = useMemo(() => {
    const first = new Date(2026, 8, 1).getDay();
    const days = [];
    for (let i = 0; i < first; i += 1) days.push(null);
    for (let day = 1; day <= 30; day += 1) days.push(day);
    return days;
  }, []);

  const cumulative = useMemo(() => {
    let run = 0;
    const start = period === "7D" ? 16 : 1;
    const values = [];
    for (let day = start; day <= 22; day += 1) {
      run += SEPTEMBER[day] || 0;
      values.push(run);
    }
    return values;
  }, [period]);

  return (
    <div className="book">
      <div className="kpis">
        <div className="kpi">
          <span>Book value</span>
          <b className="num">{usd(total)}</b>
          <small>Sample lots, marked in USD</small>
        </div>
        <div className="kpi">
          <span>Open PnL</span>
          <b className={`num ${tone(openPnl)}`}>{signedUsd(openPnl)}</b>
          <small className={tone(openPnl)}>{signedPct((openPnl / (total - openPnl)) * 100)}</small>
        </div>
        <div className="kpi">
          <span>September net</span>
          <b className={`num ${tone(monthNet)}`}>{signedUsd(monthNet)}</b>
          <small>Closed days through the 22nd</small>
        </div>
      </div>
      <div className="book-grid">
        <section className="book-card">
          <h2>Holdings</h2>
          {rows.map((row) => (
            <div className="hold" key={row.token.id}>
              <Monogram token={row.token} />
              <div className="grow">
                <b>{row.token.symbol}</b>
                <span className="num">{row.amount.toLocaleString("en-US")} · {usd(row.value)}</span>
              </div>
              <div className="right">
                <div className={`num ${tone(row.pnl)}`}>{signedUsd(row.pnl)}</div>
                <span className={`num ${tone(row.pct)}`}>{signedPct(row.pct)}</span>
              </div>
            </div>
          ))}
          <p className="fee-line">ETH reference {usd(ETH_USD)}. Unrealized only.</p>
        </section>
        <section className="book-card">
          <div className="cal-nav">
            <h2>Daily PnL</h2>
            <div className="periods filter">
              {PERIODS.map((item) => (
                <button key={item} type="button" className={period === item ? "is-on" : ""} onClick={() => setPeriod(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="cal-nav">
            <b>September 2026</b>
            <span className="muted">{period === "7D" ? "Last 7 closed days" : "Closed days through the 22nd"}</span>
          </div>
          <div className="weekdays">
            {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
          </div>
          <div className="cal" style={{ marginTop: 6 }}>
            {cells.map((day, index) => {
              if (!day) return <div key={`e-${index}`} className="day empty" />;
              const value = SEPTEMBER[day];
              const future = day > 22;
              const outside = period === "7D" && day < 16;
              const cls = future || value === undefined || outside ? "future" : value > 0 ? "up" : value < 0 ? "down" : "";
              return (
                <div key={day} className={`day ${cls}`}>
                  <i>{day}</i>
                  {value !== undefined && !future && !outside ? <em className="num">{value > 0 ? `+${Math.round(value)}` : Math.round(value)}</em> : null}
                </div>
              );
            })}
          </div>
          <div className="cal-nav" style={{ marginTop: 16 }}>
            <h2>Cumulative PnL</h2>
            <span className="muted">1 Sep to 22 Sep</span>
          </div>
          <Cumulative values={cumulative} />
        </section>
      </div>
    </div>
  );
}
