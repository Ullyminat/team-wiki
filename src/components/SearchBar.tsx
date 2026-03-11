"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, FileText } from "lucide-react";
import { searchDocuments } from "@/app/actions/document";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            const doc = results[selectedIndex];
            router.push(`/dashboard/doc/${doc.id}`);
            setIsOpen(false);
            setQuery("");
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        setSelectedIndex(-1);
    }, [results]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                setIsSearching(true);
                try {
                    const docs = await searchDocuments(query);
                    setResults(docs);
                    setIsOpen(true);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all placeholder-zinc-600"
                />
                {(isSearching || query) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {isSearching ? (
                            <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                        ) : (
                            <button onClick={() => setQuery("")}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
                        )}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                        {results.length > 0 ? (
                            results.map((doc, index) => (
                                <Link
                                    key={doc.id}
                                    href={`/dashboard/doc/${doc.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg transition-colors group
                                        ${index === selectedIndex ? "bg-white/10 text-white" : "hover:bg-white/5"}
                                    `}
                                >
                                    <span className="text-xl shrink-0">{doc.emoji || "📄"}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                        <p className="text-[10px] text-zinc-500 truncate">{doc.workspace?.name}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-zinc-500 text-xs">
                                Ничего не найдено по запросу "{query}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
