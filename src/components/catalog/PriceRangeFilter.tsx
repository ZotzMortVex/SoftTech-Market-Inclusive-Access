import { Tag, SlidersHorizontal } from "lucide-react";
import { formatCOPCompact } from "../../utils/formatters";

/**
 * Rangos de precio para el catálogo (valores en COP)
 * Basados en los precios reales del inventario de 20 productos.
 */
export type PriceRangeKey =
  | "all"
  | "under_1m"
  | "1m_to_3m"
  | "3m_to_6m"
  | "over_6m";

export interface PriceRange {
  key: PriceRangeKey;
  label: string;
  min: number;
  max: number;
  emoji: string;
  description: string;
}

export const PRICE_RANGES: PriceRange[] = [
  {
    key: "all",
    label: "Todos los precios",
    min: 0,
    max: Infinity,
    emoji: "🏷️",
    description: "Mostrar todos los productos sin filtro de precio",
  },
  {
    key: "under_1m",
    label: "Menos de $1'000.000",
    min: 0,
    max: 999999,
    emoji: "💚",
    description:
      "Productos hasta $999.999 COP — Accesorios y periféricos esenciales",
  },
  {
    key: "1m_to_3m",
    label: "$1'000.000 — $3'000.000",
    min: 1000000,
    max: 3000000,
    emoji: "💙",
    description:
      "Rango medio — Monitores, periféricos avanzados y audio visual",
  },
  {
    key: "3m_to_6m",
    label: "$3'000.000 — $6'000.000",
    min: 3000001,
    max: 6000000,
    emoji: "🔷",
    description: "Gama alta — Laptops y monitores premium certificados",
  },
  {
    key: "over_6m",
    label: "Más de $6'000.000",
    min: 6000001,
    max: Infinity,
    emoji: "💎",
    description: "Gama ultra premium — Workstations y equipos de alta gama",
  },
];

interface PriceRangeFilterProps {
  selectedRange: PriceRangeKey;
  onSelectRange: (range: PriceRangeKey) => void;
  /** Cantidad de productos que coinciden con cada rango (calculada externamente) */
  rangeCounts: Record<PriceRangeKey, number>;
}

export function PriceRangeFilter({
  selectedRange,
  onSelectRange,
  rangeCounts,
}: PriceRangeFilterProps) {
  return (
    <div className="space-y-2.5">
      {/* Encabezado de sección */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg bg-[#002f52] flex items-center justify-center"
          aria-hidden="true"
        >
          <Tag className="w-3.5 h-3.5 text-[#00e3fd]" />
        </div>
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Precio (COP)
        </span>
      </div>

      {/* Botones de rango de precio — totalmente operables por teclado */}
      <div
        role="group"
        aria-label="Filtrar por rango de precio en Pesos Colombianos"
        className="flex flex-col gap-1.5"
      >
        {PRICE_RANGES.map((range) => {
          const isSelected = selectedRange === range.key;
          const count = rangeCounts[range.key] ?? 0;

          return (
            <button
              key={range.key}
              type="button"
              role="button"
              aria-pressed={isSelected}
              aria-label={`${range.description}. ${count} producto${count !== 1 ? "s" : ""} disponible${count !== 1 ? "s" : ""}`}
              onClick={() => onSelectRange(range.key)}
              className={[
                "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold",
                "transition-all duration-200 text-left border-2",
                /* Indicador de foco visible y elegante para navegación por teclado */
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001629]",
                "active:scale-[0.98]",
                isSelected
                  ? "bg-[#003f69] border-[#00a8cc] text-white shadow-md shadow-[#00a8cc]/20"
                  : "bg-[#00182b] border-[#002540] text-slate-300 hover:border-[#004875] hover:bg-[#00243e] hover:text-white",
              ].join(" ")}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="shrink-0" aria-hidden="true">
                  {range.emoji}
                </span>
                <span className="truncate leading-snug">{range.label}</span>
              </span>

              {/* Contador de productos en este rango */}
              <span
                className={[
                  "catalog-filter-count shrink-0 min-w-[1.5rem] text-center px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                  isSelected
                    ? "bg-[#00a8cc]/25 text-[#00e3fd]"
                    : "bg-[#001629] text-slate-400",
                ].join(" ")}
                aria-hidden="true"
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Indicador textual del rango activo (para lectores de pantalla) */}
      {selectedRange !== "all" && (
        <div role="status" aria-live="polite" className="sr-only">
          {`Filtro de precio activo: ${PRICE_RANGES.find((r) => r.key === selectedRange)?.label}`}
        </div>
      )}
    </div>
  );
}
