import { Layers } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  /** Si true, muestra como lista vertical (panel lateral). Si false, muestra horizontal (chips). */
  vertical?: boolean;
}

/** Emojis representativos para cada categoría — identificación visual sin dependencia de color */
const CATEGORY_ICONS: Record<string, string> = {
  Todos: "🔲",
  Laptops: "💻",
  Monitores: "🖥️",
  Periféricos: "⌨️",
  "Audio Visual": "🎞️",
  Accesorios: "🔌",
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  vertical = false,
}: CategoryFilterProps) {
  if (vertical) {
    return (
      <div className="space-y-2.5">
        {/* Encabezado de sección */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg bg-[#002f52] flex items-center justify-center"
            aria-hidden="true"
          >
            <Layers className="w-3.5 h-3.5 text-[#00e3fd]" />
          </div>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Categoría
          </span>
        </div>

        {/* Lista vertical de categorías con aria-pressed */}
        <div
          role="group"
          aria-label="Filtrar por categoría de producto"
          className="flex flex-col gap-1.5"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            const icon = CATEGORY_ICONS[cat] ?? "📦";

            return (
              <button
                key={cat}
                type="button"
                role="button"
                aria-pressed={isSelected}
                aria-label={`${cat}: ${count} producto${count !== 1 ? "s" : ""}${isSelected ? " — filtro activo" : ""}`}
                onClick={() => onSelectCategory(cat)}
                className={[
                  "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold",
                  "transition-all duration-200 text-left border-2",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001629]",
                  "active:scale-[0.98]",
                  isSelected
                    ? "bg-[#003f69] border-[#00a8cc] text-white shadow-md shadow-[#00a8cc]/20"
                    : "bg-[#00182b] border-[#002540] text-slate-300 hover:border-[#004875] hover:bg-[#00243e] hover:text-white",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">{icon}</span>
                  <span>{cat}</span>
                </span>
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
      </div>
    );
  }

  // ── Modo horizontal (chips): se usa en vista compacta sin panel lateral ──
  return (
    <div
      role="group"
      aria-label="Filtrar por categoría de producto"
      className="flex items-center gap-2 flex-wrap"
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat] ?? 0;
        const icon = CATEGORY_ICONS[cat] ?? "📦";

        return (
          <button
            key={cat}
            type="button"
            role="button"
            aria-pressed={isSelected}
            aria-label={`${cat}: ${count} producto${count !== 1 ? "s" : ""}${isSelected ? " — filtro activo" : ""}`}
            onClick={() => onSelectCategory(cat)}
            className={[
              "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap",
              "transition-all duration-200 flex items-center gap-1.5 border-2",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001629]",
              "active:scale-[0.98]",
              isSelected
                ? "bg-[#00e3fd] text-[#001629] border-[#00e3fd] shadow-md shadow-[#00e3fd]/20"
                : "bg-[#00223b] text-slate-300 border-[#003c66] hover:bg-[#002f52] hover:text-white hover:border-[#005580]",
            ].join(" ")}
          >
            <span aria-hidden="true">{icon}</span>
            <span>{cat}</span>
            <span
              className={[
                "catalog-filter-count px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                isSelected
                  ? "bg-[#001629] text-[#00e3fd]"
                  : "bg-[#001729] text-slate-400",
              ].join(" ")}
              aria-hidden="true"
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
