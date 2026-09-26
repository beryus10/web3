const timeframes = {
  "1H": { days: 1, windowMs: 60 * 60 * 1000 },
  "24H": { days: 1, windowMs: 24 * 60 * 60 * 1000 },
  "7D": { days: 7, windowMs: 7 * 24 * 60 * 60 * 1000 },
  "30D": { days: 30, windowMs: 30 * 24 * 60 * 60 * 1000 },
} as const;

type CoinGeckoMarketChart = {
  prices?: [number, number][];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const timeframe = new URL(request.url).searchParams.get("range") || "24H";
  if (!/^[a-zA-Z0-9-]+$/.test(id) || !Object.hasOwn(timeframes, timeframe)) {
    return Response.json({ error: "Invalid market symbol or timeframe." }, { status: 400 });
  }

  try {
    const selectedRange = timeframes[timeframe as keyof typeof timeframes];
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${selectedRange.days}`,
      { headers: { accept: "application/json" }, next: { revalidate: 60 } },
    );
    if (!response.ok) {
      return Response.json({ error: "Price history is temporarily unavailable." }, { status: response.status });
    }

    const payload = (await response.json()) as CoinGeckoMarketChart;
    const startTime = Date.now() - selectedRange.windowMs;
    const points = (payload.prices || [])
      .filter(([timestamp]) => timestamp >= startTime)
      .map(([time, price]) => ({ time, price }));
    if (points.length < 2) {
      return Response.json({ error: "Not enough price history is available." }, { status: 404 });
    }

    const first = points[0].price;
    const latest = points[points.length - 1].price;
    return Response.json(
      {
        points,
        currentPrice: latest,
        changePercent: first === 0 ? 0 : ((latest - first) / first) * 100,
        updatedAt: Date.now(),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch {
    return Response.json({ error: "Could not connect to the market data provider." }, { status: 502 });
  }
}
