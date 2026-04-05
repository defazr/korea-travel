"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  contentId: number;
  title: string;
  slug: string;
  city: string;
  category: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setOpen(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    setQuery("");
    setOpen(false);
    router.push(`/en/${result.city}/${result.category}/${result.slug}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
        <input
          type="text"
          placeholder="Search places..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-40 lg:w-56"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border bg-white shadow-lg overflow-hidden z-50">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.contentId}
                onClick={() => handleSelect(result)}
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium truncate">{result.title}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {result.city} / {result.category}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
