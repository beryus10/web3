"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  rank: number | null;
};

type Timeframe = "1H" | "24H" | "7D" | "30D";
type ChartPoint = { time: number; price: number; volume: number };
type MarketHistory = {
  points: ChartPoint[];
  currentPrice: number;
  changePercent: number;
  updatedAt: number;
};
type ApiError = { error: string };

const initialCoin: Coin = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "BTC",
  rank: 1,
};
const timeframes: Timeframe[] = ["1H", "24H", "7D", "30D"];

function isApiError(payload: unknown): payload is ApiError {
  return typeof payload === "object" && payload !== null && "error" in payload;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

export function MarketChart() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<Coin[]>([]);
  const [coin, setCoin] = useState<Coin>(initialCoin);
  const [timeframe, setTimeframe] = useState<Timeframe>("24H");
  const [history, setHistory] = useState<MarketHistory | null>(null);
  const [searchError, setSearchError] = useState("");
  const [chartError, setChartError] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingChart, setLoadingChart] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (deferredQuery.length < 2) {
      setResults([]);
      setSearchError("");
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearchError("");
    const debounce = window.setTimeout(() => {
      fetch(`/api/market/search?q=${encodeURIComponent(deferredQuery)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload: unknown = await response.json();
          if (!response.ok || isApiError(payload)) {
            throw new Error(isApiError(payload) ? payload.error : "Search failed.");
          }
          setResults(payload as Coin[]);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSearchError(error instanceof Error ? error.message : "Search failed.");
          setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 350);

    return () => {
      window.clearTimeout(debounce);
      controller.abort();
    };
  }, [deferredQuery]);

  useEffect(() => {
    const controller = new AbortController();
    let hasLoaded = false;
    let initialRequest = true;
    setLoadingChart(true);
    setChartError("");
    setHistory(null);

    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/market/${encodeURIComponent(coin.id)}?range=${timeframe}`, {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();
        if (!response.ok || isApiError(payload)) {
          throw new Error(isApiError(payload) ? payload.error : "Price history failed to load.");
        }
        setHistory(payload as MarketHistory);
        setChartError("");
        hasLoaded = true;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!hasLoaded) setChartError(error instanceof Error ? error.message : "Price history failed to load.");
      } finally {
        if (initialRequest && !controller.signal.aborted) {
          setLoadingChart(false);
          initialRequest = false;
        }
      }
    };

    void loadHistory();
    const refreshInterval = window.setInterval(() => void loadHistory(), 60_000);

    return () => {
      window.clearInterval(refreshInterval);
      controller.abort();
    };
  }, [coin.id, timeframe, reload]);

  const chooseCoin = (selected: Coin) => {
    setCoin(selected);
    setQuery("");
    setResults([]);
    setMenuOpen(false);
  };

  const trendColor = (history?.changePercent ?? 0) >= 0 ? "#20d9a6" : "#ff6675";

  return (
    <section className="dashboard-market" aria-label="Live cryptocurrency market chart">
      <div className="market-toolbar">
        <div className="market-title-block">
          <p className="dashboard-kicker">Live market</p>
          <h2>Crypto prices <span className="market-live-indicator live"><i />CoinGecko</span></h2>
        </div>
        <div className="market-controls">
          <div className="market-search-wrap">
            <label className="market-search-label" htmlFor="market-search">Search assets</label>
            <input
              autoComplete="off"
              id="market-search"
              onFocus={() => setMenuOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setMenuOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setMenuOpen(false);
              }}
              placeholder="Search coin or ticker"
              role="combobox"
              aria-expanded={menuOpen && (results.length > 0 || searching)}
              aria-controls="market-search-results"
              value={query}
            />
            {menuOpen && query.trim().length >= 2 && (
              <div className="market-search-results" id="market-search-results" role="listbox">
                {searching && <p className="market-search-message">Searching live markets...</p>}
                {searchError && <p className="market-search-message market-error">{searchError}</p>}
                {!searching && !searchError && results.length === 0 && <p className="market-search-message">No matching assets found.</p>}
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => chooseCoin(result)}
                    role="option"
                    aria-selected={coin.id === result.id}
                    type="button"
                  >
                    <span className="market-result-mark" aria-hidden="true">{result.symbol.slice(0, 1)}</span>
                    <span><strong>{result.name}</strong><small>{result.symbol}{result.rank ? ` · Rank #${result.rank}` : ""}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="market-timeframes" role="group" aria-label="Chart timeframe">
            {timeframes.map((range) => (
              <button
                aria-pressed={timeframe === range}
                className={timeframe === range ? "active" : ""}
                key={range}
                onClick={() => setTimeframe(range)}
                type="button"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="market-asset-summary">
        <div className="market-selected-asset"><span className="market-asset-symbol">{coin.symbol.slice(0, 1)}</span><div><strong>{coin.name}</strong><small>{coin.symbol} / USD · CoinGecko</small></div></div>
        <div className="market-price-summary">
          <strong>{history ? currency(history.currentPrice) : loadingChart ? "Loading..." : "--"}</strong>
          {history && <span className={history.changePercent >= 0 ? "market-positive" : "market-negative"}>{history.changePercent >= 0 ? "+" : ""}{history.changePercent.toFixed(2)}% <small>{timeframe}</small></span>}
        </div>
      </div>
      <div className="market-chart-frame">
        {loadingChart && <div className="market-chart-state">Loading crypto market history...</div>}
        {!loadingChart && chartError && <div className="market-chart-state market-error">{chartError}<button onClick={() => setReload((value) => value + 1)} type="button">Retry</button></div>}
        {!loadingChart && history && <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={history.points} margin={{ top: 12, right: 18, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="market-area-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity={0.27} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0.015} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2c3d56" strokeDasharray="3 5" vertical={false} />
            <XAxis axisLine={false} dataKey="time" tick={{ fill: "#8298b5", fontSize: 10 }} tickLine={false} tickFormatter={(value: number) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} minTickGap={32} />
            <YAxis axisLine={false} domain={["auto", "auto"]} orientation="right" tick={{ fill: "#8298b5", fontSize: 10 }} tickFormatter={(value: number) => currency(value)} tickLine={false} width={82} />
            <Tooltip contentStyle={{ background: "#17263c", border: "1px solid #344761", borderRadius: 8, color: "#f4f7fb", fontSize: 12 }} labelFormatter={(value) => new Date(Number(value)).toLocaleString()} formatter={(value) => [currency(Number(value)), `${coin.symbol} price`]} />
            <Area activeDot={{ r: 4, fill: trendColor, stroke: "#10203b", strokeWidth: 2 }} dataKey="price" dot={false} isAnimationActive={false} stroke={trendColor} strokeWidth={2.25} type="monotone" fill="url(#market-area-fill)" />
            <Brush
              ariaLabel="Drag to select and pan across chart history"
              dataKey="time"
              height={34}
              stroke="#536981"
              fill="#142137"
              travellerWidth={10}
              tickFormatter={(value: number) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })}
            />
          </AreaChart>
        </ResponsiveContainer>}
      </div>
      <div className="market-chart-footer"><span>Drag the range handles below to compare history</span><span>CoinGecko · Refreshes every 60s · Updated {history ? new Date(history.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "--"}</span></div>
    </section>
  );
}
