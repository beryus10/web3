type CoinGeckoSearchResult = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2) return Response.json([]);

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { headers: { accept: "application/json" }, next: { revalidate: 60 } },
    );
    if (!response.ok) {
      return Response.json({ error: "Market search is temporarily unavailable." }, { status: 503 });
    }

    const searchData = (await response.json()) as { coins?: CoinGeckoSearchResult[] };
    const coins = (searchData.coins || []).slice(0, 12).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      rank: coin.market_cap_rank,
      image: coin.thumb,
    }));
    return Response.json(coins, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch {
    return Response.json({ error: "Could not connect to the market data provider." }, { status: 502 });
  }
}
