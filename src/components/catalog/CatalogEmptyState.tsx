import { SlidersHorizontal, RotateCcw, SearchX } from 'lucide-react';

interface CatalogEmptyStateProps {
  searchTerm: string;
  selectedCategory: string;
  onReset: () => void;
}

export function CatalogEmptyState({
  searchTerm,
  selectedCategory,
  onReset
}: CatalogEmptyStateProps) {
  return (
    <div 
      className="text-center py-16 px-6 sm:px-12 rounded-3xl bg-[#001729] border-2 border-dashed border-[#003d69] space-y-4 shadow-xl animate-fadeIn"
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#001f38] border border-[#004e80] flex items-center justify-center text-[#00e3fd] mx-auto shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <span className="px-3 py-1 rounded-full bg-[#ffc038]/15 border border-[#ffc038]/40 text-[#ffc038] text-[11px] font-bold uppercase tracking-wider inline-block">
          Sin Coincidencias Ópticas
        </span>
        <h3 className="text-xl font-extrabold text-white">
          No se encontraron equipos certificados
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {searchTerm ? (
            <>
              No existen productos que contengan <strong className="text-[#00e3fd]">"{searchTerm}"</strong>
              {selectedCategory !== 'Todos' && (
                <> en la categoría <strong className="text-white">"{selectedCategory}"</strong></>
              )}.
            </>
          ) : (
            <>No hay equipos disponibles en la categoría seleccionada actualmente.</>
          )}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e3fd] hover:bg-[#3de9ff] text-[#001629] text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer Filtros y Búsqueda</span>
        </button>
      </div>
    </div>
  );
}
