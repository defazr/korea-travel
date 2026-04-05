import { NextResponse } from "next/server";

export const revalidate = 300; // 5분 캐시

export async function GET() {
  const result: { usdKrw: number | null; btcUsd: number | null } = {
    usdKrw: null,
    btcUsd: null,
  };

  try {
    const [exchangeRes, btcRes] = await Promise.allSettled([
      fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 300 } }),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", { next: { revalidate: 300 } }),
    ]);

    if (exchangeRes.status === "fulfilled" && exchangeRes.value.ok) {
      const data = await exchangeRes.value.json();
      result.usdKrw = data.rates?.KRW ?? null;
    }

    if (btcRes.status === "fulfilled" && btcRes.value.ok) {
      const data = await btcRes.value.json();
      result.btcUsd = data.bitcoin?.usd ?? null;
    }
  } catch {
    // API 실패 시 null 유지 — 사이트 렌더링에 영향 없음
  }

  return NextResponse.json(result);
}
