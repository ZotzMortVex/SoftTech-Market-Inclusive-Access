import { ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Layers } from 'lucide-react';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'stock_desc';

interface PriceSortProps {
  currentSort: SortOption;
  onSortChange: (newSort: SortOption) => void;
}

export function PriceSort({ currentSort, onSortChange }: PriceSortProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-[#001729] px-3 py-2 rounded-xl border border-[#002f52]">
        <ArrowUpDown className="w-3.5 h-3.5 text-[#00e3fd]" />
        <span className="hidden sm:inline font-semibold">Ordenar:</span>
      </div>

      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="bg-[#001a30] text-slate-200 text-xs sm:text-sm font-semibold py-2 px-3 rounded-xl border-2 border-[#003860] focus:border-[#00e3fd] focus:outline-none transition-colors cursor-pointer"
        aria-label="Seleccionar orden de catálogo"
      >
        <option value="featured">✨ Destacados Inclusivos</option>
        <option value="price_asc">💵 Precio: Menor a Mayor</option>
        <option value="price_desc">💎 Precio: Mayor a Menor</option>
        <option value="stock_desc">📦 Mayor Disponibilidad</option>
      </select>
    </div>
  );
}
