"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // Rediriger vers la page de recherche avec le query
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, un commerçant..."
            className="w-full h-10 pl-10 pr-4 rounded-l-full border-0 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-principale-500"
          />
        </div>
        <Button
          type="submit"
          className="h-10 px-6 rounded-r-full bg-principale-400 hover:bg-principale-500 text-white"
        >
          <Search />
        </Button>
      </form>
    </div>
  );
}
