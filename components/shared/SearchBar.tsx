'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface SearchResult {
  slug: string;
  name: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(trimmed)}&pageSize=5`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : { products: [] }))
        .then((data) => {
          setResults(data.products.map((p: SearchResult) => ({ slug: p.slug, name: p.name })));
          setOpen(true);
        })
        .catch(() => {});
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length > 0) {
      setOpen(false);
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Rechercher une épice..."
          aria-label="Rechercher un produit"
          className="w-full rounded-md border border-border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>
      {open && results.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          {results.map((result) => (
            <li key={result.slug}>
              <Link
                href={`/produits/${result.slug}`}
                className="block px-3 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {result.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={`/boutique?q=${encodeURIComponent(query.trim())}`}
              className="block px-3 py-2 text-sm font-medium text-terracotta hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Voir tous les résultats
            </Link>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
