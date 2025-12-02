import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    campaigns: any[];
    onSelect: (item: any) => void;
}

export function SearchBar({ campaigns, onSelect }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        return campaigns.filter((c) =>
            c.title.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, campaigns]);

    return (
        <>
            {/* OVERLAY PRETO TRANSLÚCIDO */}
            {focused && (
                <div
                    className="fixed inset-0 bg-black/50 z-10"
                    onClick={() => setFocused(false)}
                />
            )}

            <div className="relative z-20">
                {/* INPUT */}
                <div
                    style={{
                        marginTop: "-40px",
                        marginBottom: "-30px",
                    }}
                    className="
          flex items-center gap-3
          bg-card
          border border-border
          rounded-[10px]
          px-4 py-[18px]
          shadow-sm
        "
                >
                    <Search className="text-muted-foreground w-5 h-5" />

                    <input
                        type="text"
                        value={query}
                        onFocus={() => setFocused(true)}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquise..."
                        className="
            w-full bg-transparent outline-none
            text-sm text-white placeholder:text-muted-foreground
          "
                    />
                </div>

                {/* DROPDOWN (agora mais para baixo) */}
                {focused && results.length > 0 && (
                    <div
                        className="
      absolute left-0 right-0 
      rounded-[10px]
      mt-[40px]
      border border-border 
      shadow-xl
      max-h-64 overflow-y-auto
      bg-card-elevated
    "
                    >
                        {results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onSelect(item);
                                    setQuery("");
                                    setFocused(false);
                                }}
                                className="
          w-full text-left px-4 py-3
          hover:bg-card
          transition-all
          flex flex-col
        "
                            >
                                <span className="text-white font-medium">{item.title}</span>
                                <span className="text-muted-foreground text-xs">
                                    {(item.description || "").slice(0, 50)}...
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
