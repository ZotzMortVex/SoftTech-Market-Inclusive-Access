import { useState } from 'react';
import { Search, X, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { CategoryFilter } from './CategoryFilter';
import { PriceRangeFilter, PriceRangeKey, PRICE_RANGES } from './PriceRangeFilter';
import { SortOption } from './PriceSort';
import { Product, UserRole } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterState {
  searchTerm: string;
  selectedCategory: string;
  selectedPriceRange: PriceRangeKey;
  currentSort: SortOption;
}

interface AccessibleSearchFiltersProps {
  /** Lista completa de productos visibles (ya filtrados por rol) */
  allProducts: Product[];
  /** Lista de productos que quedan DESPUÉS de aplicar todos los filtros */
  filteredCount: number;
  userRole: UserRole;

  // Valores actuales de filtros controlados desde el padre
  filters: FilterState;
  onFiltersChange: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

const CATEGORIES = ['Todos', 'Laptops', 'Monitores', 'Periféricos', 'Audio Visual', 'Accesorios'];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: calcular conteos por categoría sobre el subconjunto visibles
// ─────────────────────────────────────────────────────────────────────────────
function buildCategoryCounts(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = { Todos: products.length };
  CATEGORIES.forEach((cat) => {
    if (cat !== 'Todos') {
      counts[cat] = products.filter((p) => p.category === cat).length;
    }
  });
  return counts;
}

function buildRangeCounts(products: Product[]): Record<PriceRangeKey, number> {
  const counts = {} as Record<PriceRangeKey, number>;
  PRICE_RANGES.forEach((range) => {
    counts[range.key] = products.filter(
      (p) => p.price >= range.min && p.price <= range.max
    ).length;
  });
  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AccessibleSearchFilters({
  allProducts,
  filteredCount,
  userRole,
  filters,
  onFiltersChange,
  onResetFilters,
}: AccessibleSearchFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categoryCounts = buildCategoryCounts(allProducts);
  const rangeCounts = buildRangeCounts(allProducts);

  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.selectedCategory !== 'Todos' ||
    filters.selectedPriceRange !== 'all' ||
    filters.currentSort !== 'featured';

  const activeFilterCount = [
    filters.searchTerm !== '',
    filters.selectedCategory !== 'Todos',
    filters.selectedPriceRange !== 'all',
    filters.currentSort !== 'featured',
  ].filter(Boolean).length;

  return (
    <>
      {/*
        ════════════════════════════════════════════════════════════
        BOTÓN DE APERTURA EN MÓVIL (visible solo en pantallas < lg)
        ════════════════════════════════════════════════════════════
      */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          aria-expanded={isMobileOpen}
          aria-controls="filter-panel"
          onClick={() => setIsMobileOpen((v) => !v)}
          className={[
            'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001629]',
            hasActiveFilters
              ? 'bg-[#003f69] border-[#00a8cc] text-white'
              : 'bg-[#001c33] border-[#003060] text-slate-200',
          ].join(' ')}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>
              Filtros de Búsqueda
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#00a8cc] text-[#001629] text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </span>
          {isMobileOpen
            ? <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
            : <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
          }
        </button>
      </div>

      {/*
        ════════════════════════════════════════════════════════════
        PANEL DE FILTROS — visible siempre en lg+; toggle en móvil
        ════════════════════════════════════════════════════════════
      */}
      <aside
        id="filter-panel"
        aria-label="Filtros de productos del catálogo"
        className={[
          'w-full space-y-6 lg:block',
          isMobileOpen ? 'block' : 'hidden lg:block',
        ].join(' ')}
      >
        {/* ── Panel contenedor ── */}
        <div className="rounded-2xl bg-[#001629] border border-[#002f52] p-4 sm:p-5 shadow-xl space-y-6">

          {/* 1. BUSCADOR DE TEXTO ──────────────────────────────────────────── */}
          <div
            role="search"
            aria-label="Buscador de productos por texto"
            className="space-y-2"
          >
            <label
              htmlFor="catalog-search"
              className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider"
            >
              <Search className="w-3.5 h-3.5 text-[#00e3fd]" aria-hidden="true" />
              Buscar
            </label>

            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="search"
                autoComplete="off"
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                placeholder="Nombre, código, marca…"
                aria-label="Buscar productos por nombre, código o marca"
                className={[
                  'w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#00111f] border-2 text-sm text-white',
                  'placeholder-slate-500 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-1 focus-visible:ring-offset-[#001629]',
                  filters.searchTerm
                    ? 'border-[#00a8cc]'
                    : 'border-[#002540] focus:border-[#006fa8]',
                ].join(' ')}
              />
              {filters.searchTerm && (
                <button
                  type="button"
                  onClick={() => onFiltersChange({ searchTerm: '' })}
                  aria-label="Limpiar búsqueda de texto"
                  className={[
                    'absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400',
                    'hover:text-white hover:bg-[#002f52] transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2]',
                  ].join(' ')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-[#002540]" aria-hidden="true" />

          {/* 2. FILTRO POR CATEGORÍA ──────────────────────────────────────── */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={filters.selectedCategory}
            onSelectCategory={(cat) => onFiltersChange({ selectedCategory: cat })}
            categoryCounts={categoryCounts}
            vertical={true}
          />

          {/* Divider */}
          <hr className="border-[#002540]" aria-hidden="true" />

          {/* 3. FILTRO POR RANGO DE PRECIO (COP) ─────────────────────────── */}
          <PriceRangeFilter
            selectedRange={filters.selectedPriceRange}
            onSelectRange={(range) => onFiltersChange({ selectedPriceRange: range })}
            rangeCounts={rangeCounts}
          />

          {/* Divider */}
          <hr className="border-[#002540]" aria-hidden="true" />

          {/* 4. ORDENAR POR ───────────────────────────────────────────────── */}
          <div className="space-y-2.5">
            <label
              htmlFor="catalog-sort"
              className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00e3fd]" aria-hidden="true" />
              Ordenar por
            </label>
            <select
              id="catalog-sort"
              value={filters.currentSort}
              onChange={(e) => onFiltersChange({ currentSort: e.target.value as SortOption })}
              aria-label="Seleccionar criterio de ordenamiento del catálogo"
              className={[
                'w-full bg-[#00111f] text-slate-200 text-xs font-semibold py-2.5 px-3.5 rounded-xl border-2 cursor-pointer',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-1 focus-visible:ring-offset-[#001629]',
                filters.currentSort !== 'featured'
                  ? 'border-[#00a8cc]'
                  : 'border-[#002540] focus:border-[#006fa8]',
              ].join(' ')}
            >
              <option value="featured">✨ Destacados Inclusivos</option>
              <option value="price_asc">💚 Precio: Menor a Mayor</option>
              <option value="price_desc">💎 Precio: Mayor a Menor</option>
              <option value="stock_desc">📦 Mayor Disponibilidad</option>
            </select>
          </div>

          {/* Divider */}
          <hr className="border-[#002540]" aria-hidden="true" />

          {/* 5. BOTÓN LIMPIAR FILTROS ─────────────────────────────────────── */}
          <div>
            <button
              type="button"
              onClick={onResetFilters}
              aria-label={
                hasActiveFilters
                  ? 'Restablecer todos los filtros de búsqueda al estado original'
                  : 'No hay filtros activos que limpiar'
              }
              aria-disabled={!hasActiveFilters}
              className={[
                'catalog-reset-filters',
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001629]',
                'active:scale-[0.98]',
              ].join(' ')}
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Restablecer filtros
            </button>
          </div>
        </div>

        {/*
          ── Región ARIA live: notifica el conteo de resultados ──
          Esta región es leída automáticamente por lectores de pantalla
          cuando cambia el número de productos filtrados.
        */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {hasActiveFilters
            ? `Se encontraron ${filteredCount} producto${filteredCount !== 1 ? 's' : ''} con los filtros aplicados.`
            : `Mostrando ${filteredCount} producto${filteredCount !== 1 ? 's' : ''} en el catálogo.`
          }
        </div>
      </aside>
    </>
  );
}
