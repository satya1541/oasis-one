"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}


export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search full address, locality, or city (e.g. Patia, Bhubaneswar)...",
  className,
  label = "Base location in Odisha / Diaspora",
  required = false,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal input state with external value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Debounced fetch to Google Places Autocomplete API
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/autocomplete?input=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setPredictions(data.predictions || []);
        }
      } catch (err) {
        console.error("Failed to fetch location autocomplete:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedAddress: string) => {
    setQuery(selectedAddress);
    onChange(selectedAddress);
    setIsOpen(false);
    setPredictions([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setPredictions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
        e.preventDefault();
        handleSelect(predictions[highlightedIndex].description);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-2", className)}>
      {label && (
        <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Field with Pin and Clear/Loading Controls */}
      <div className="relative flex items-center rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all shadow-xs">
        <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
          <MapPin className="w-4 h-4 text-[var(--accent)]" />
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
        />

        <div className="flex items-center gap-1.5 pr-3">
          {isLoading && <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
              title="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-3)] py-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--muted)] font-mono flex items-center justify-between border-b border-[var(--border)]/60 mb-1">
            <span>Google Places Suggestions</span>
            <span className="text-[9px] text-[var(--muted)]/70">Powered by Google</span>
          </div>

          {predictions.map((p, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = value === p.description;

            return (
              <button
                key={p.placeId || index}
                type="button"
                onClick={() => handleSelect(p.description)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors cursor-pointer",
                  isHighlighted ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]/60",
                  isSelected && "text-[var(--accent)]"
                )}
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[var(--text)] truncate">
                    {p.mainText}
                  </div>
                  {p.secondaryText && (
                    <div className="text-[11px] text-[var(--muted)] truncate">
                      {p.secondaryText}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 mt-1 text-[var(--brand-gold)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
