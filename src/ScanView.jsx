import { useMemo, useState } from "react";
import { CaretDown, CaretUp, Info } from "@phosphor-icons/react";
import { ageLabel, compactUsd, px, signedPct, tone } from "./format.js";
import { Badge, Monogram } from "./ui.jsx";

const FILTERS = [
  ["all", "All"],
  ["verified", "Verified"],
  ["caution", "Caution"],
  ["risk", "High risk"],
  ["fresh", "Too new"],
];

const COLS = [
  ["token", "Token", false],
  ["price", "Price", true],
  ["ch1h", "1h", true],
  ["ch24h", "24h", true],
  ["vol", "Volume", true],
  ["liq", "Liquidity", true],
  ["mcap", "Mkt cap", true],
  ["score", "Hood", false],
  ["ageH", "Age", true],
];

const SCORE_RANK = { verified: 0, caution: 1, fresh: 2, risk: 3 };

export function ScanView({ tokens, query, hotId, onOpen, onHover, onLeave, onPin, onInspectButton }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState({ key: "vol", dir: -1 });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tokens.filter((token) => {
      const matches = !q || token.symbol.toLowerCase().includes(q) || token.name.toLowerCase().includes(q);
      return matches && (filter === "all" || token.score === filter);
    });
    list = [...list].sort((a, b) => {
      const key = sort.key;
      if (key === "token") return a.symbol.localeCompare(b.symbol) * sort.dir;
      if (key === "score") return (SCORE_RANK[a.score] - SCORE_RANK[b.score]) * sort.dir;
      return (a[key] - b[key]) * sort.dir;
    });
    return list;
  }, [tokens, query, filter, sort]);

  function toggleSort(key) {
    setSort((cur) => (cur.key === key ? { key, dir: cur.dir * -1 } : { key, dir: key === "token" || key === "score" ? 1 : -1 }));
  }

  return (
    <div>
      <div className="scan-head">
        <div className="filters filter" role="tablist" aria-label="Score filter">
          {FILTERS.map(([id, label]) => (
            <button key={id} type="button" className={filter === id ? "is-on" : ""} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <p className="hint scan-hint">Hover a name for the scan card. Right-click to pin it.</p>
      </div>
      <div className="table-wrap">
        <table className="scan">
          <thead>
            <tr>
              {COLS.map(([key, label]) => (
                <th key={key} className={key === "ch1h" ? "col-1h" : key === "liq" ? "col-liq" : key === "ageH" ? "col-age" : key === "mcap" ? "col-mcap" : ""}>
                  <button type="button" onClick={() => toggleSort(key)}>
                    {label}
                    {sort.key === key ? (sort.dir < 0 ? <CaretDown size={10} /> : <CaretUp size={10} />) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((token) => (
              <tr
                key={token.id}
                className={hotId === token.id ? "is-hot" : ""}
                tabIndex={0}
                onMouseEnter={(event) => onHover(token, event.currentTarget)}
                onMouseLeave={onLeave}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onPin(token, event.currentTarget);
                }}
                onClick={() => onOpen(token.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onOpen(token.id);
                  if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
                    event.preventDefault();
                    onPin(token, event.currentTarget);
                  }
                }}
              >
                <td>
                  <div className="token">
                    <Monogram token={token} />
                    <div className="who">
                      <span className="sym">{token.symbol}</span>
                      <span className="name">{token.name}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn row-tools"
                      aria-label={`Open ${token.symbol} scan card`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onInspectButton(token, event.currentTarget.closest("tr"));
                      }}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </td>
                <td className="num">${px(token.price)}</td>
                <td className={`num col-1h ${tone(token.ch1h)}`}>{signedPct(token.ch1h)}</td>
                <td className={`num ${tone(token.ch24h)}`}>{signedPct(token.ch24h)}</td>
                <td className="num">{compactUsd(token.vol)}</td>
                <td className="num col-liq">{compactUsd(token.liq)}</td>
                <td className="num col-mcap">{compactUsd(token.mcap)}</td>
                <td><Badge score={token.score} /></td>
                <td className="num col-age">{ageLabel(token.ageH)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty">No names match that filter.</div> : null}
      </div>
    </div>
  );
}
