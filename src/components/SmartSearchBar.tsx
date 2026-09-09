import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, MicOff, Sparkles, Command, X, ArrowLeft, Tag, Store } from "lucide-react";
import { StoreBrand, CouponItem } from "../types";
import { executeSmartSearch } from "../utils/arabicSearchEngine";
import { POPULAR_CATEGORIES } from "../data/couponsData";
import { LazyBrandLogo } from "./common/LazyBrandLogo";

interface SmartSearchBarProps {
  onOpenModal: (initialQuery?: string) => void;
  brands: StoreBrand[];
  onSelectBrand?: (brand: StoreBrand) => void;
  placeholder?: string;
  className?: string;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onOpenModal,
  brands,
  onSelectBrand,
  placeholder = "ابحث في أكثر من 15 متجر و100+ كود خصم...",
  className = ""
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenModal]);

  // Execute quick search for the dropdown preview
  const searchResult = executeSmartSearch(query, brands, POPULAR_CATEGORIES);

  const handleVoiceSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onOpenModal();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-SA";
      recognition.continuous = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          onOpenModal(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      onOpenModal();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      
      {/* Search Input Box */}
      <div 
        onClick={() => onOpenModal(query)}
        className="relative flex items-center w-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-emerald-500 rounded-2xl p-1.5 sm:p-2 transition-all shadow-xs cursor-text group focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500"
      >
        <div className="p-2 text-emerald-600">
          <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium px-1"
        />

        {/* Action icons (Clear / Voice / Shortcut badge) */}
        <div className="flex items-center gap-1 pl-1">
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery("");
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-1.5 rounded-xl transition-colors ${
              isListening ? "bg-rose-500 text-white animate-pulse" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title="بحث صوتي عربي"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Shortcut badge */}
          <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-500 font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Quick Instant Results Dropdown (When focused and query typed) */}
      {isFocused && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-3 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Autocorrect */}
          {searchResult.correctedQuery && (
            <div className="mb-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>هل تقصد: <strong>{searchResult.correctedQuery}</strong>؟</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (searchResult.correctedQuery) {
                    setQuery(searchResult.correctedQuery);
                    onOpenModal(searchResult.correctedQuery);
                  }
                }}
                className="font-bold underline text-emerald-700"
              >
                تطبيق
              </button>
            </div>
          )}

          {/* Stores Preview */}
          {searchResult.groupedResults.stores.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Store className="w-3 h-3" />
                <span>المتاجر المطابقة</span>
              </div>
              <div className="space-y-1">
                {searchResult.groupedResults.stores.slice(0, 3).map((item) => {
                  const brand = item.rawBrand!;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectBrand) onSelectBrand(brand);
                        setIsFocused(false);
                      }}
                      className="w-full text-right p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LazyBrandLogo
                          logoUrl={brand.logoUrl}
                          logoText={brand.logoText?.slice(0, 2) || brand.name.slice(0, 2)}
                          logoBg={brand.logoBg || "bg-slate-900 text-white"}
                          brandName={brand.arabicName}
                          size="xs"
                        />
                        <span>{brand.arabicName}</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {brand.coupons.length} كوبونات
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coupons Preview */}
          {searchResult.groupedResults.coupons.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>أبرز الكوبونات</span>
              </div>
              <div className="space-y-1">
                {searchResult.groupedResults.coupons.slice(0, 2).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onOpenModal(query);
                    }}
                    className="w-full text-right p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs text-slate-700"
                  >
                    <span className="font-medium truncate">{item.title}</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex-shrink-0 mr-2">
                      {item.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Search Action Button */}
          <button
            onClick={() => {
              onOpenModal(query);
              setIsFocused(false);
            }}
            className="mt-2.5 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>عرض جميع نتائج البحث ({searchResult.totalCount})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
