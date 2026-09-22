import { useEffect, useRef, useState } from "react";
import {
  ArrowsLeftRight,
  Bell,
  Broadcast,
  ChartLineUp,
  List,
  MagnifyingGlass,
  ArrowClockwise,
  CrosshairSimple,
  SidebarSimple,
} from "@phosphor-icons/react";
import { DESKS, TOKENS, findToken } from "./data.js";
import { InspectCard } from "./InspectCard.jsx";
import { AlertsView, DeskView } from "./MoreViews.jsx";
import { BookView } from "./BookView.jsx";
import { ScanView } from "./ScanView.jsx";
import { TradeView } from "./TradeView.jsx";
import { TileMark } from "./ui.jsx";

const NAV = [
  ["scan", "Scan", CrosshairSimple],
  ["trade", "Trade", ArrowsLeftRight],
  ["book", "Book", ChartLineUp],
  ["alerts", "Alerts", Bell],
  ["desk", "Signal Desk", Broadcast],
];

function useNow(every = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(id);
  }, [every]);
  return now;
}

function useSheet() {
  const [sheet, setSheet] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 860px), (hover: none)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px), (hover: none)");
    const apply = () => setSheet(media.matches);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return sheet;
}

export default function App() {
  const [view, setView] = useState("scan");
  const [railOpen, setRailOpen] = useState(() =>
    typeof window === "undefined" ? true : !window.matchMedia("(max-width: 860px)").matches,
  );
  const [connected, setConnected] = useState(false);
  const [activeId, setActiveId] = useState(TOKENS[0].id);
  const [openIds, setOpenIds] = useState([TOKENS[0].id, TOKENS[3].id]);
  const [inspect, setInspect] = useState(null);
  const [query, setQuery] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const [toast, setToast] = useState("");
  const now = useNow();
  const sheet = useSheet();
  const closeTimer = useRef(0);
  const pinnedRef = useRef(false);
  pinnedRef.current = Boolean(inspect?.pinned);

  const token = findToken(activeId);
  const seconds = Math.max(0, Math.round((now - refreshedAt) / 1000));

  useEffect(() => {
    const onKey = (event) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (event.key === "Escape") document.activeElement.blur();
        return;
      }
      if (event.key === "[") setRailOpen((open) => !open);
      if (event.key === "Escape") setInspect(null);
    };
    const onToast = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(""), 2400);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("giwa-toast", onToast);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("giwa-toast", onToast);
    };
  }, []);

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }
  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      if (!pinnedRef.current) setInspect(null);
    }, 180);
  }
  function showInspect(item, el, pinned) {
    cancelClose();
    const rect = el.getBoundingClientRect();
    setInspect({ id: item.id, pinned, top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }
  function openToken(id) {
    setActiveId(id);
    setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id].slice(-6)));
    setView("trade");
    setInspect(null);
  }

  const titles = {
    scan: ["Scan", "Hood results on GIWA"],
    trade: [token.symbol, token.name],
    book: ["Book", "Sample holdings and closed PnL"],
    alerts: ["Alerts", "Rules for later Telegram delivery"],
    desk: ["Signal Desk", `${DESKS.length} sample desks`],
  };
  const [title, sub] = titles[view];
  const inspectToken = inspect ? findToken(inspect.id) : null;

  return (
    <div className="app">
      <aside className={`rail glass${railOpen ? " is-open" : ""}`} aria-label="Primary">
        <button type="button" className="brand" onClick={() => setView("scan")}>
          <span className="brand-mark"><TileMark /></span>
          <span className="brand-copy">
            <strong>GIWA</strong>
            <span>Desk</span>
          </span>
        </button>
        <nav className="nav">
          {NAV.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={`nav-btn${view === id ? " is-active" : ""}`}
              aria-current={view === id ? "page" : undefined}
              title={railOpen ? undefined : label}
              onClick={() => {
                setView(id);
                setInspect(null);
                if (sheet) setRailOpen(false);
              }}
            >
              <span className="nav-ico"><Icon size={20} weight={view === id ? "regular" : "light"} /></span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-foot">
          <button type="button" onClick={() => setRailOpen((open) => !open)} aria-expanded={railOpen}>
            <span className="nav-ico"><SidebarSimple size={20} weight="light" /></span>
            <span className="foot-label">{railOpen ? "Collapse" : "Open"}</span>
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button type="button" className="icon-btn menu-fab" aria-label="Open navigation" onClick={() => setRailOpen(true)}>
            <List size={18} />
          </button>
          <div className="top-title">
            <h1>{title}</h1>
            <p>{sub}</p>
          </div>
          {view === "scan" ? (
            <label className="search">
              <MagnifyingGlass size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a name"
                aria-label="Search a name"
              />
            </label>
          ) : <span />}
          <div className="top-actions">
            <span className="chip">Sample · <b>GIWA</b></span>
            <button type="button" className="icon-btn" aria-label="Refresh sample clock" onClick={() => setRefreshedAt(Date.now())}>
              <ArrowClockwise size={16} />
            </button>
            <span className="muted">Updated {seconds}s</span>
            <button type="button" className={`connect${connected ? " is-on" : ""}`} onClick={() => setConnected((on) => !on)}>
              {connected ? "0x4c2a…91e" : "Connect"}
            </button>
          </div>
        </header>
        <main className="view">
          {view === "scan" ? (
            <ScanView
              tokens={TOKENS}
              query={query}
              hotId={inspect?.id}
              onOpen={openToken}
              onHover={(item, el) => {
                if (sheet || pinnedRef.current) return;
                showInspect(item, el, false);
              }}
              onLeave={scheduleClose}
              onPin={(item, el) => showInspect(item, el, true)}
              onInspectButton={(item, el) => showInspect(item, el, true)}
            />
          ) : null}
          {view === "trade" ? (
            <TradeView
              token={token}
              openIds={openIds}
              tokens={TOKENS}
              connected={connected}
              onConnect={() => setConnected(true)}
              onSelect={setActiveId}
              onCloseTab={(id) => {
                setOpenIds((ids) => {
                  const next = ids.filter((item) => item !== id);
                  if (id === activeId && next[0]) setActiveId(next[0]);
                  if (next.length === 0) setView("scan");
                  return next;
                });
              }}
            />
          ) : null}
          {view === "book" ? <BookView /> : null}
          {view === "alerts" ? <AlertsView /> : null}
          {view === "desk" ? <DeskView /> : null}
        </main>
      </div>

      {inspect && inspectToken ? (
        <InspectCard
          token={inspectToken}
          pinned={inspect.pinned}
          sheet={sheet}
          anchor={inspect}
          onEnter={cancelClose}
          onLeave={scheduleClose}
          onClose={() => setInspect(null)}
          onPin={() => setInspect((cur) => (cur ? { ...cur, pinned: !cur.pinned } : cur))}
        />
      ) : null}
      {toast ? <div className="toast glass" role="status">{toast}</div> : null}
    </div>
  );
}
