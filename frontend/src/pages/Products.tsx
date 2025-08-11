import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Star,
  X,
  Clock,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ArrowUpAZ,
  ArrowDownAZ,
} from "lucide-react";
import ProductList from "../components/ProductList";
import CategorySelector from "../components/CategorySelector";

/**
 * Products Page (Top Filter Overlay with Navbar Offset)
 *
 * Change requested:
 *  - There is already a global navbar at the top. Reserve (keep empty) the space that navbar occupies,
 *    so the filter bar sits just UNDER the navbar (no overlap) and products scroll behind filter area.
 *
 * Implementation details:
 *  - Introduced NAVBAR_HEIGHT constant (change to match your navbar height) or use CSS variable (--navbar-height).
 *  - Filter bar uses 'top: var(--navbar-height, <fallback>)' so if you define --navbar-height on :root it auto-adapts.
 *  - Added a spacer div with height equal to navbar height so initial content isn't hidden.
 *  - Products container top padding reduced: was pt-32; now dynamic based on (NAVBAR_HEIGHT + FILTER_BAR_HEIGHT).
 *    For simplicity we keep a spacer + filter bar height offset (FILTER_BAR_APPROX).
 *
 * To customize:
 *  - Adjust NAVBAR_HEIGHT value OR define :root { --navbar-height: 64px; } in global CSS.
 *  - If your filter bar height changes drastically, tweak FILTER_BAR_APPROX.
 */

interface CategorySelection {
  id: string;
  name: string;
}

interface PersistedState {
  searchQuery: string;
  sortOrder: "asc" | "desc" | "";
  showBestsellers: boolean;
  showNewArrivals: boolean;
  selectedMajorCategory: CategorySelection | null;
  selectedSubCategory: CategorySelection | null;
}

const LS_KEY = "products-page-filters-v3";

// Adjust to match your real navbar height (in px)
const NAVBAR_HEIGHT = 64; // fallback if CSS var not set
// Approximate filter bar height (when pills visible it expands slightly)
// Used only for initial top padding calculation (products section)
const FILTER_BAR_APPROX = 108;

export default function Products() {
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [liveSearch, setLiveSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [showBestsellers, setShowBestsellers] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [selectedMajorCategory, setSelectedMajorCategory] =
    useState<CategorySelection | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<CategorySelection | null>(null);

  // UI State
  const [persistRestored, setPersistRestored] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const categoryPanelRef = useRef<HTMLDivElement | null>(null);
  const categoryBtnRef = useRef<HTMLButtonElement | null>(null);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(liveSearch.trim()), 350);
    return () => clearTimeout(id);
  }, [liveSearch]);

  // Restore persisted
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        setSearchQuery(parsed.searchQuery || "");
        setLiveSearch(parsed.searchQuery || "");
        setSortOrder(parsed.sortOrder || "");
        setShowBestsellers(!!parsed.showBestsellers);
        setShowNewArrivals(!!parsed.showNewArrivals);
        setSelectedMajorCategory(parsed.selectedMajorCategory);
        setSelectedSubCategory(parsed.selectedSubCategory);
      }
    } catch {
      /* ignore */
    } finally {
      setPersistRestored(true);
    }
  }, []);

  // Persist
  useEffect(() => {
    if (!persistRestored) return;
    const payload: PersistedState = {
      searchQuery,
      sortOrder,
      showBestsellers,
      showNewArrivals,
      selectedMajorCategory,
      selectedSubCategory,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [
    searchQuery,
    sortOrder,
    showBestsellers,
    showNewArrivals,
    selectedMajorCategory,
    selectedSubCategory,
    persistRestored,
  ]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 25);
    return () => clearTimeout(t);
  }, []);

  const handleCategorySelect = useCallback(
    (major: CategorySelection, sub?: CategorySelection) => {
      setSelectedMajorCategory(major);
      setSelectedSubCategory(sub || null);
    },
    []
  );

  const applyCategorySelection = () => {
    setCategoryOpen(false);
  };

  const clearCategorySelection = () => {
    setSelectedMajorCategory(null);
    setSelectedSubCategory(null);
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setLiveSearch("");
    setSortOrder("");
    setShowBestsellers(false);
    setShowNewArrivals(false);
    clearCategorySelection();
  }, []);

  const activeFilters =
    !!searchQuery ||
    !!sortOrder ||
    showBestsellers ||
    showNewArrivals ||
    selectedMajorCategory ||
    selectedSubCategory;

  // Close category panel on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        categoryOpen &&
        categoryPanelRef.current &&
        !categoryPanelRef.current.contains(e.target as Node) &&
        !categoryBtnRef.current?.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [categoryOpen]);

  const FilterPill = ({
    label,
    onRemove,
    color,
  }: {
    label: string;
    onRemove: () => void;
    color:
      | "blue"
      | "green"
      | "yellow"
      | "emerald"
      | "purple"
      | "indigo"
      | "amber";
  }) => {
    const map: Record<string, string> = {
      blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-600/40",
      green:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-600/40",
      yellow:
        "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-600/40",
      emerald:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-600/40",
      purple:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-600/40",
      indigo:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-600/40",
      amber:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-600/40",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border shadow-sm ${map[color]} animate-[fadeIn_.25s_ease]`}
      >
        {label}
        <button
          onClick={onRemove}
          className="ml-0.5 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current rounded-full"
          aria-label="Remove filter"
        >
          <X size={14} />
        </button>
      </span>
    );
  };

  // Get effective navbar height (allow CSS variable override)
  const navbarOffset =
    typeof window !== "undefined"
      ? parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--navbar-height"
          )
        ) || NAVBAR_HEIGHT
      : NAVBAR_HEIGHT;

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      style={
        {
          // Provide CSS variable fallback
          "--navbar-height": `${navbarOffset}px`,
        } as React.CSSProperties
      }
    >
      {/* SPACER to reserve navbar space (empty as requested) */}
      <div
        aria-hidden="true"
        style={{ height: `var(--navbar-height, ${NAVBAR_HEIGHT}px)` }}
      />

      {/* FILTER OVERLAY BAR (positioned below navbar) */}
      <div
        className="fixed left-0 right-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/70 dark:border-gray-800/60 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.15)] transition-all"
        style={{ top: `var(--navbar-height, ${NAVBAR_HEIGHT}px)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* PRIMARY CONTROLS ROW */}
          <div className="flex flex-wrap items-center gap-3 py-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-md group">
              <div
                className={`absolute inset-0 rounded-xl transition-all duration-300 group-hover:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] ${
                  searchFocused
                    ? "shadow-[0_0_0_3px_rgba(59,130,246,0.35)]"
                    : ""
                }`}
              />
              <Search
                className={`absolute left-3 top-2.5 w-4 h-4 transition ${
                  searchFocused
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              <input
                value={liveSearch}
                onChange={(e) => setLiveSearch(e.target.value)}
                placeholder="Search products..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="relative w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur px-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-100 transition"
              />
              {liveSearch && (
                <button
                  onClick={() => {
                    setLiveSearch("");
                    setSearchQuery("");
                  }}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Button / Panel */}
            <div className="relative">
              <button
                ref={categoryBtnRef}
                onClick={() => setCategoryOpen((o) => !o)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  categoryOpen || selectedMajorCategory
                    ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/60"
                    : "border-gray-300 bg-white/70 dark:bg-gray-800/70 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                }`}
                aria-expanded={categoryOpen}
                aria-haspopup="dialog"
              >
                <LayoutGrid className="w-4 h-4" />
                {selectedMajorCategory
                  ? selectedSubCategory
                    ? `${selectedMajorCategory.name} › ${selectedSubCategory.name}`
                    : selectedMajorCategory.name
                  : "Category"}
                {categoryOpen ? (
                  <ChevronUp className="w-4 h-4 opacity-70" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-70" />
                )}
              </button>

              {categoryOpen && (
                <div
                  ref={categoryPanelRef}
                  className="absolute left-0 mt-2 w-[400px] max-h-[460px] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ring-1 ring-black/5 shadow-2xl animate-[popIn_.25s_cubic-bezier(.4,0,.2,1)]"
                  role="dialog"
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Select Categories
                    </h3>
                    <div className="flex gap-2">
                      {(selectedMajorCategory || selectedSubCategory) && (
                        <button
                          onClick={clearCategorySelection}
                          className="text-[11px] px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        onClick={() => setCategoryOpen(false)}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close category panel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-2 overflow-y-auto custom-scroll max-h-[360px]">
                    <CategorySelector onCategorySelect={handleCategorySelect} />
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/60 to-white/60 dark:from-gray-800/50 dark:to-gray-900/40">
                    <button
                      onClick={applyCategorySelection}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 transition shadow"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setCategoryOpen(false)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "" : "asc"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  sortOrder === "asc"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white/70 border-gray-300 dark:bg-gray-800/70 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                }`}
              >
                <ArrowUpAZ className="w-4 h-4" />
                Low→High
              </button>
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "" : "desc"))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  sortOrder === "desc"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white/70 border-gray-300 dark:bg-gray-800/70 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                }`}
              >
                <ArrowDownAZ className="w-4 h-4" />
                High→Low
              </button>
            </div>

            {/* Quick Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBestsellers((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  showBestsellers
                    ? "bg-yellow-400 text-yellow-900 shadow-sm"
                    : "bg-yellow-100/90 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    showBestsellers ? "fill-yellow-900" : "fill-yellow-600/60"
                  }`}
                />
                Bestseller
              </button>
              <button
                onClick={() => setShowNewArrivals((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  showNewArrivals
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-emerald-100/90 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            {/* Expand (placeholder) */}
            <button
              onClick={() => setFiltersExpanded((e) => !e)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition"
            >
              {filtersExpanded ? (
                <>
                  Compact <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  More Filters <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Reset */}
            {activeFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto hidden md:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 text-xs font-medium shadow hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-red-400/40"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}

            {/* Mobile open */}
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="md:hidden inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-blue-600 text-white w-5 h-5">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Active Pills */}
          <div
            className={`flex flex-wrap gap-2 items-center overflow-hidden transition-[max-height,opacity] duration-500 ${
              activeFilters ? "max-h-32 opacity-100 pb-3" : "max-h-0 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              Active:
            </span>
            {selectedMajorCategory && (
              <FilterPill
                color="blue"
                label={`Category: ${selectedMajorCategory.name}`}
                onRemove={() => setSelectedMajorCategory(null)}
              />
            )}
            {selectedSubCategory && (
              <FilterPill
                color="green"
                label={`Sub: ${selectedSubCategory.name}`}
                onRemove={() => setSelectedSubCategory(null)}
              />
            )}
            {showBestsellers && (
              <FilterPill
                color="yellow"
                label="Bestsellers"
                onRemove={() => setShowBestsellers(false)}
              />
            )}
            {showNewArrivals && (
              <FilterPill
                color="emerald"
                label="New Arrivals"
                onRemove={() => setShowNewArrivals(false)}
              />
            )}
            {sortOrder && (
              <FilterPill
                color="purple"
                label={`Price: ${
                  sortOrder === "asc" ? "Low→High" : "High→Low"
                }`}
                onRemove={() => setSortOrder("")}
              />
            )}
            {searchQuery && (
              <FilterPill
                color="indigo"
                label={`Search: ${searchQuery}`}
                onRemove={() => {
                  setSearchQuery("");
                  setLiveSearch("");
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* Provide top padding equal to navbar + initial filter bar area so first products not hidden */}
        <div
          style={{
            paddingTop: `calc(var(--navbar-height, ${NAVBAR_HEIGHT}px) + ${FILTER_BAR_APPROX}px)`,
          }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
        >
          <ProductList
            searchQuery={searchQuery}
            sortOrder={sortOrder}
            showBestsellers={showBestsellers}
            showNewArrivals={showNewArrivals}
            selectedMajorCategories={
              selectedMajorCategory ? [selectedMajorCategory.id] : []
            }
            selectedSubCategories={
              selectedSubCategory ? [selectedSubCategory.id] : []
            }
          />
        </div>
      </main>

      {/* MOBILE FILTER SHEET */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-[fadeIn_.3s_ease]"
            onClick={() => setMobileSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] rounded-t-3xl bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700 flex flex-col animate-[slideUp_.4s_cubic-bezier(.4,0,.2,1)]">
            <div className="py-3 flex items-center justify-center">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="px-6 pb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Filters
              </h2>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 custom-scroll">
              {/* Search */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    value={liveSearch}
                    onChange={(e) => setLiveSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-0 border border-gray-200 dark:border-gray-700">
                <CategorySelector onCategorySelect={handleCategorySelect} />
                {(selectedMajorCategory || selectedSubCategory) && (
                  <div className="flex gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={clearCategorySelection}
                      className="text-xs inline-flex items-center gap-1 rounded-md px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear Categories
                    </button>
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSortOrder("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      sortOrder === ""
                        ? "bg-blue-600 border-blue-600 text-white shadow"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "" : "asc"))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                      sortOrder === "asc"
                        ? "bg-blue-600 border-blue-600 text-white shadow"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <ArrowUpAZ className="w-3.5 h-3.5" />
                    Low→High
                  </button>
                  <button
                    onClick={() =>
                      setSortOrder((prev) => (prev === "desc" ? "" : "desc"))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                      sortOrder === "desc"
                        ? "bg-blue-600 border-blue-600 text-white shadow"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <ArrowDownAZ className="w-3.5 h-3.5" />
                    High→Low
                  </button>
                </div>
              </div>

              {/* Quick Flags */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowBestsellers((v) => !v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      showBestsellers
                        ? "bg-yellow-400 text-yellow-900 shadow-sm"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    } flex items-center gap-1`}
                  >
                    <Star className="w-3.5 h-3.5 fill-yellow-700/70" />
                    Bestseller
                  </button>
                  <button
                    onClick={() => setShowNewArrivals((v) => !v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      showNewArrivals
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    } flex items-center gap-1`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
              </div>

              {/* Active Pills */}
              {activeFilters && (
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2">
                    Active Filters
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMajorCategory && (
                      <FilterPill
                        color="blue"
                        label={`Category: ${selectedMajorCategory.name}`}
                        onRemove={() => setSelectedMajorCategory(null)}
                      />
                    )}
                    {selectedSubCategory && (
                      <FilterPill
                        color="green"
                        label={`Sub: ${selectedSubCategory.name}`}
                        onRemove={() => setSelectedSubCategory(null)}
                      />
                    )}
                    {showBestsellers && (
                      <FilterPill
                        color="yellow"
                        label="Bestsellers"
                        onRemove={() => setShowBestsellers(false)}
                      />
                    )}
                    {showNewArrivals && (
                      <FilterPill
                        color="emerald"
                        label="New Arrivals"
                        onRemove={() => setShowNewArrivals(false)}
                      />
                    )}
                    {sortOrder && (
                      <FilterPill
                        color="purple"
                        label={`Price: ${
                          sortOrder === "asc" ? "Low→High" : "High→Low"
                        }`}
                        onRemove={() => setSortOrder("")}
                      />
                    )}
                    {searchQuery && (
                      <FilterPill
                        color="indigo"
                        label={`Search: ${searchQuery}`}
                        onRemove={() => {
                          setSearchQuery("");
                          setLiveSearch("");
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 font-medium shadow hover:shadow-lg transition"
              >
                <Sparkles className="w-4 h-4" />
                Apply
              </button>
              {activeFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
Add / ensure these global styles or Tailwind config entries:

@keyframes fadeIn {
  from { opacity:0 }
  to { opacity:1 }
}
@keyframes slideUp {
  from { transform:translateY(100%); }
  to { transform:translateY(0); }
}
@keyframes popIn {
  0% { opacity:0; transform:scale(.96) translateY(4px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}

:root {
  --navbar-height: 64px; // adjust to your real navbar height
}

You can remove FILTER_BAR_APPROX if you compute dynamic heights with refs, but a static approximation is simpler.
*/
