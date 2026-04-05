"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import SearchBox from "./SearchBox";

const TOP_CITIES = [
  { slug: "seoul", name: "Seoul" },
  { slug: "busan", name: "Busan" },
  { slug: "jeju", name: "Jeju" },
  { slug: "incheon", name: "Incheon" },
];

const MAJOR_CITIES = [
  { slug: "seoul", name: "Seoul" },
  { slug: "busan", name: "Busan" },
  { slug: "incheon", name: "Incheon" },
  { slug: "daegu", name: "Daegu" },
  { slug: "gwangju", name: "Gwangju" },
  { slug: "daejeon", name: "Daejeon" },
  { slug: "ulsan", name: "Ulsan" },
];

const REGIONS = [
  { slug: "gyeonggi", name: "Gyeonggi" },
  { slug: "gangwon", name: "Gangwon" },
  { slug: "gyeongbuk", name: "Gyeongbuk" },
  { slug: "gyeongnam", name: "Gyeongnam" },
  { slug: "jeonbuk", name: "Jeonbuk" },
  { slug: "jeonnam", name: "Jeonnam" },
  { slug: "chungbuk", name: "Chungbuk" },
  { slug: "chungnam", name: "Chungnam" },
  { slug: "sejong", name: "Sejong" },
  { slug: "jeju", name: "Jeju" },
];

interface MarketData {
  usdKrw: number | null;
  btcUsd: number | null;
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [market, setMarket] = useState<MarketData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/market")
      .then((res) => res.json())
      .then((data) => setMarket(data))
      .catch(() => {});
  }, []);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      {market && (market.usdKrw || market.btcUsd) && (
        <div className="bg-muted/50 border-b text-xs">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-1 text-muted-foreground">
            {market.usdKrw && (
              <span>$1 = ₩{Math.round(market.usdKrw).toLocaleString()}</span>
            )}
            {market.btcUsd && (
              <span>BTC ${(market.btcUsd / 1000).toFixed(1)}K</span>
            )}
          </div>
        </div>
      )}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Explore Korea
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {TOP_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/en/${city.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {city.name}
            </Link>
          ))}
          <SearchBox />
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              More <ChevronDown className="h-3 w-3" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-white p-4 shadow-lg">
                <div className="mb-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Major Cities</p>
                  <div className="grid grid-cols-2 gap-1">
                    {MAJOR_CITIES.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/en/${city.slug}`}
                        className="rounded px-2 py-1 text-sm hover:bg-muted transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Regions</p>
                  <div className="grid grid-cols-2 gap-1">
                    {REGIONS.map((region) => (
                      <Link
                        key={region.slug}
                        href={`/en/${region.slug}`}
                        className="rounded px-2 py-1 text-sm hover:bg-muted transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {region.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4">
          <div className="mb-4">
            <SearchBox />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Major Cities</p>
          <div className="grid grid-cols-2 gap-1 mb-4">
            {MAJOR_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/en/${city.slug}`}
                className="rounded px-2 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {city.name}
              </Link>
            ))}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Regions</p>
          <div className="grid grid-cols-2 gap-1">
            {REGIONS.map((region) => (
              <Link
                key={region.slug}
                href={`/en/${region.slug}`}
                className="rounded px-2 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {region.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
