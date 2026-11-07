import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Product, UserRole, ActiveView } from "../types";
import { useToast } from "../context/ToastContext";
import { X, Info, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductCard } from "./catalog/ProductCard";
import { CatalogEmptyState } from "./catalog/CatalogEmptyState";
import { VisualToast } from "./catalog/VisualToast";
import {
  AccessibleSearchFilters,
  FilterState,
} from "./catalog/AccessibleSearchFilters";
import { PRICE_RANGES } from "./catalog/PriceRangeFilter";
import { formatCOP } from "../utils/formatters";
import { useSignLanguage } from "../context/SignLanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const INITIAL_FILTERS: FilterState = {
  searchTerm: "",
  selectedCategory: "Todos",
  selectedPriceRange: "all",
  currentSort: "featured",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface CatalogViewProps {
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  onRetryProducts: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  userRole: UserRole;
  onTriggerFlash: () => void;
  onNavigate?: (view: ActiveView) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CatalogView
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogView({
  products,
  productsLoading,
  productsError,
  onRetryProducts,
  onSelectProduct,
  onAddToCart,
  userRole,
  onTriggerFlash,
  onNavigate,
}: CatalogViewProps) {
  const { showToast } = useToast();
  const { setInterpreterVideo } = useSignLanguage();
  const welcomeShownRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Filtros (estado centralizado) ────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // ── Paginación ────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modales ───────────────────────────────────────────────────────────────
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(
    null,
  );

  // ── Toast de bienvenida (10 s, una vez por sesión) ────────────────────────
  useEffect(() => {
    const KEY = "softtech_welcome_shown";
    if (welcomeShownRef.current || sessionStorage.getItem(KEY)) return;
    welcomeShownRef.current = true;
    sessionStorage.setItem(KEY, "1");

    const msgs: Record<
      UserRole,
      { title: string; message: string; badge: string }
    > = {
      visitor: {
        badge: "👁️ Modo Visitante",
        title: "Bienvenido/a al Catálogo Tecnológico",
        message:
          "Explora el catálogo y añade productos al carrito cuando quieras. Para finalizar tu compra, regístrate o inicia sesión.",
      },
      user: {
        badge: "✅ Usuario Verificado",
        title: "¡Bienvenido/a de vuelta al Catálogo!",
        message:
          "Tu cuenta está activa. Puedes agregar equipos al carrito, seguir pedidos y usar el buzón.",
      },
      admin: {
        badge: "🛡️ Panel Administrador",
        title: "Sesión de Administrador Activa",
        message:
          "Acceso completo al catálogo, incluyendo inactivos. Gestiona inventario, pedidos y usuarios.",
      },
    };

    const m = msgs[userRole];
    showToast({
      type: userRole === "user" ? "success" : "info",
      title: m.title,
      message: m.message,
      badge: m.badge,
      duration: 10000,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actualizar filtros desde el panel ─────────────────────────────────────
  const handleFiltersChange = useCallback(
    (patch: Partial<FilterState>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
      setCurrentPage(1); // resetear paginación cuando cambia cualquier filtro
      setInterpreterVideo(
        import.meta.env.VITE_LSC_CATALOG_FILTER_VIDEO ??
          import.meta.env.VITE_LSC_CATALOG_VIDEO ??
          import.meta.env.VITE_LSC_DEFAULT_VIDEO,
        "Mostrando resultados según los filtros seleccionados.",
      );
    },
    [setInterpreterVideo],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setInterpreterVideo(
      import.meta.env.VITE_LSC_CATALOG_FILTER_VIDEO ??
        import.meta.env.VITE_LSC_CATALOG_VIDEO ??
        import.meta.env.VITE_LSC_DEFAULT_VIDEO,
      "Filtros restablecidos. Mostrando todos los productos.",
    );
    onTriggerFlash();
  }, [onTriggerFlash, setInterpreterVideo]);

  // ── Paso 1: productos visibles según rol ──────────────────────────────────
  const visibleProducts = useMemo(() => {
    if (userRole === "admin") return products;
    return products.filter((p) => p.active !== false);
  }, [products, userRole]);

  // ── Paso 2: aplicar filtros texto + categoría + precio ────────────────────
  const filteredProducts = useMemo(() => {
    const { searchTerm, selectedCategory, selectedPriceRange } = filters;
    const priceRange = PRICE_RANGES.find((r) => r.key === selectedPriceRange);

    return visibleProducts.filter((p) => {
      // Categoría
      if (selectedCategory !== "Todos" && p.category !== selectedCategory)
        return false;

      // Precio COP
      if (priceRange && priceRange.key !== "all") {
        if (p.price < priceRange.min || p.price > priceRange.max) return false;
      }

      // Texto libre
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const haystack = [
          p.name,
          p.code,
          p.brand,
          p.description,
          p.visualAlert,
          p.category,
          p.visualCert,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [visibleProducts, filters]);

  // ── Paso 3: ordenar ───────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (filters.currentSort) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "stock_desc":
        return list.sort((a, b) => b.stockCount - a.stockCount);
      default:
        return list.sort((a, b) => b.rating - a.rating);
    }
  }, [filteredProducts, filters.currentSort]);

  // ── Paso 4: paginar ───────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginated = sortedProducts.slice(pageStart, pageStart + PAGE_SIZE);

  const hasActiveFilters =
    filters.searchTerm !== "" ||
    filters.selectedCategory !== "Todos" ||
    filters.selectedPriceRange !== "all" ||
    filters.currentSort !== "featured";

  // ── Cambiar página ────────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    setInterpreterVideo(
      import.meta.env.VITE_LSC_CATALOG_PAGE_VIDEO ??
        import.meta.env.VITE_LSC_CATALOG_VIDEO ??
        import.meta.env.VITE_LSC_DEFAULT_VIDEO,
      `Cargando página ${clamped} del catálogo.`,
    );
    // Scroll suave al inicio de resultados
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Agregar al carrito ────────────────────────────────────────────────────
  const handleAddToCartAttempt = (product: Product) => {
    onAddToCart(product);
    onTriggerFlash();
    setLastAddedProduct(product);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      id="product-catalog"
      ref={topRef}
      className="scroll-mt-24 space-y-6 animate-fadeIn pb-12 text-left"
    >
      {/* ── HEADER DEL CATÁLOGO ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[#00426b] bg-[linear-gradient(135deg,#001c33_0%,#001729_100%)] p-4 shadow-[0_18px_40px_rgba(0,16,28,0.22)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00e3fd]/12 text-[#00e3fd] ring-1 ring-[#00e3fd]/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="min-w-0 break-words text-lg font-extrabold tracking-tight text-white sm:text-xl">
            CATÁLOGO DE PRODUCTOS TECNOLÓGICOS ({visibleProducts.length}{" "}
            Equipos)
          </h1>
        </div>
        <div
          role="status"
          aria-live="polite"
          className={`catalog-mode-indicator catalog-mode-indicator--${userRole} inline-flex min-h-9 max-w-full shrink-0 items-center gap-2 self-start rounded-lg border px-3 py-2 text-xs font-bold leading-tight sm:self-auto`}
        >
          <span
            className="catalog-mode-indicator__dot h-2 w-2 shrink-0 rounded-full"
            aria-hidden="true"
          />
          <span className="catalog-mode-indicator__label">
            Modo{" "}
            {userRole === "admin"
              ? "Administrador"
              : userRole === "user"
                ? "Usuario"
                : "Visitante"}
          </span>
        </div>
        {userRole === "visitor" && (
          <div
            role="note"
            data-notification-type="info"
            className="app-visual-notification catalog-visitor-notice flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs sm:text-sm"
          >
            <span
              className="catalog-visitor-notice-dot mt-1.5 h-2 w-2 shrink-0 rounded-full"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              <strong className="catalog-visitor-notice-title">
                Modo Visitante:
              </strong>{" "}
              puedes explorar el catálogo y añadir productos al carrito. Para
              finalizar una compra debes registrarte o iniciar sesión.
            </p>
          </div>
        )}
      </div>

      {productsLoading && (
        <p
          role="status"
          className="rounded-xl border border-[#005580] bg-[#001c33] px-4 py-3 text-sm text-slate-200"
        >
          Cargando productos del catálogo…
        </p>
      )}

      {productsError && (
        <div
          role="alert"
          className="catalog-load-error flex flex-col gap-3 rounded-xl border border-[#a8473b] bg-[#321914] px-4 py-3 text-sm text-[#ffe0dc] sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            {productsError} Puedes reintentar la conexión para cargar los datos
            más recientes.
          </p>
          <button
            type="button"
            onClick={onRetryProducts}
            disabled={productsLoading}
            className="rounded-lg border border-[#ff8a7a] px-3 py-2 font-bold hover:bg-[#54231c] disabled:cursor-wait disabled:opacity-60"
          >
            Reintentar
          </button>
        </div>
      )}

      {/*
        ── LAYOUT PRINCIPAL: sidebar de filtros (lg) + grilla de productos ──
      */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ━━ PANEL DE FILTROS ACCESIBLES (sidebar lg / acordeón móvil) ━━━━ */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <AccessibleSearchFilters
            allProducts={visibleProducts}
            filteredCount={sortedProducts.length}
            userRole={userRole}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* ━━ ÁREA PRINCIPAL DE RESULTADOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex-1 min-w-0 space-y-5" ref={resultsRef}>
          {/* ── Barra de estado de resultados (aria-live visible) ─────────── */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#001629] border border-[#002f52] text-xs"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles
                className="w-3.5 h-3.5 text-[#00e3fd] shrink-0"
                aria-hidden="true"
              />
              {hasActiveFilters ? (
                <span className="text-white font-semibold">
                  Se encontraron{" "}
                  <strong className="text-[#00e3fd]">
                    {sortedProducts.length} producto
                    {sortedProducts.length !== 1 ? "s" : ""}
                  </strong>{" "}
                  con los filtros aplicados
                  {totalPages > 1 && (
                    <span className="text-slate-400 font-normal">
                      {" "}
                      — Página {safePage} de {totalPages}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-300">
                  Mostrando{" "}
                  <strong className="text-white">{paginated.length}</strong> de{" "}
                  <strong className="text-white">
                    {visibleProducts.length}
                  </strong>{" "}
                  productos
                  {totalPages > 1 && (
                    <span className="text-slate-400">
                      {" "}
                      — Página {safePage} de {totalPages}
                    </span>
                  )}
                </span>
              )}

              {/* Chips de filtros activos */}
              {filters.selectedCategory !== "Todos" && (
                <span className="px-2 py-0.5 rounded-md bg-[#002f52] text-[#00e3fd] font-medium">
                  {filters.selectedCategory}
                </span>
              )}
              {filters.selectedPriceRange !== "all" && (
                <span className="px-2 py-0.5 rounded-md bg-[#002f52] text-[#90cdf4] font-medium">
                  {
                    PRICE_RANGES.find(
                      (r) => r.key === filters.selectedPriceRange,
                    )?.label
                  }
                </span>
              )}
              {filters.searchTerm && (
                <span className="px-2 py-0.5 rounded-md bg-[#002f52] text-white font-medium">
                  "{filters.searchTerm}"
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className={[
                  "text-xs text-[#ff8a7a] hover:text-[#ffb3a7] font-bold shrink-0 flex items-center gap-1.5",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] rounded-md px-1",
                ].join(" ")}
                aria-label="Limpiar todos los filtros de búsqueda"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* ── Grilla de productos o estado vacío ───────────────────────── */}
          {productsLoading ? null : sortedProducts.length ===
            0 ? (
            <CatalogEmptyState
              searchTerm={filters.searchTerm}
              selectedCategory={filters.selectedCategory}
              onReset={handleResetFilters}
            />
          ) : (
            <>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                aria-label={`Página ${safePage} de productos — ${paginated.length} artículo${paginated.length !== 1 ? "s" : ""}`}
              >
                {paginated.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userRole={userRole}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={handleAddToCartAttempt}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>

              {/* ── PAGINACIÓN ACCESIBLE ──────────────────────────────────── */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginación del catálogo de productos"
                  className="flex items-center justify-center gap-2 pt-4"
                >
                  {/* Botón: Anterior */}
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    aria-label="Ir a la página anterior"
                    className={[
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1527]",
                      safePage === 1
                        ? "border-[#002030] text-slate-600 cursor-not-allowed bg-[#001020]"
                        : "border-[#003060] text-slate-200 bg-[#001c33] hover:border-[#005580] hover:text-white active:scale-[0.97]",
                    ].join(" ")}
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1" role="list">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const isActive = page === safePage;
                        // Mostrar máx. 5 páginas visibles centradas en la actual
                        const distFromActive = Math.abs(page - safePage);
                        if (
                          totalPages > 7 &&
                          distFromActive > 2 &&
                          page !== 1 &&
                          page !== totalPages
                        ) {
                          if (distFromActive === 3) {
                            return (
                              <span
                                key={`ellipsis-${page}`}
                                className="text-slate-500 px-1"
                                aria-hidden="true"
                              >
                                …
                              </span>
                            );
                          }
                          if (distFromActive > 3) return null;
                        }

                        return (
                          <button
                            key={page}
                            type="button"
                            role="listitem"
                            onClick={() => goToPage(page)}
                            aria-label={`Ir a la página ${page}${isActive ? " — página actual" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                            className={[
                              "w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1527]",
                              isActive
                                ? "bg-[#00a8cc] border-[#00a8cc] text-[#001629] shadow-md shadow-[#00a8cc]/25"
                                : "border-[#002f52] text-slate-300 bg-[#001629] hover:border-[#005580] hover:text-white active:scale-[0.97]",
                            ].join(" ")}
                          >
                            {page}
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* Botón: Siguiente */}
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    aria-label="Ir a la página siguiente"
                    className={[
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1527]",
                      safePage === totalPages
                        ? "border-[#002030] text-slate-600 cursor-not-allowed bg-[#001020]"
                        : "border-[#003060] text-slate-200 bg-[#001c33] hover:border-[#005580] hover:text-white active:scale-[0.97]",
                    ].join(" ")}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Toast visual al agregar al carrito ───────────────────────────── */}
      <VisualToast
        product={lastAddedProduct}
        onClose={() => setLastAddedProduct(null)}
        onNavigateToCart={() => onNavigate?.("cart")}
      />

      {/* ── Modal de Vista Rápida ─────────────────────────────────────────── */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickview-title"
        >
          <div className="relative w-full max-w-2xl bg-[#001e36] border-2 border-[#00528a] rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#003860] pb-4">
              <div>
                <span className="text-xs font-bold text-[#00e3fd] uppercase font-mono tracking-wider">
                  {quickViewProduct.code} · Vista Rápida Accesible
                </span>
                <h2
                  id="quickview-title"
                  className="text-xl font-black text-white mt-1"
                >
                  {quickViewProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#002f52] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2]"
                aria-label="Cerrar vista rápida"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img
                src={quickViewProduct.images.primary}
                alt={quickViewProduct.name}
                className="rounded-2xl w-full h-48 object-cover border border-[#003860] bg-[#001221]"
              />
              <div className="space-y-2.5 text-xs flex flex-col justify-between">
                <div>
                  <p className="text-slate-300 leading-relaxed">
                    {quickViewProduct.description}
                  </p>
                  <div className="p-3 mt-2 rounded-xl bg-[#001426] border border-[#002f52] space-y-1">
                    <span className="font-bold text-[#00e3fd] block">
                      Certificación Visual:
                    </span>
                    <p className="text-slate-300">
                      {quickViewProduct.visualCert}
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex items-baseline justify-between border-t border-[#003357]">
                  <span className="text-xs text-slate-400">Importe:</span>
                  <div className="text-xl font-extrabold text-white">
                    {formatCOP(quickViewProduct.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Especificaciones Clave:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {quickViewProduct.specs.slice(0, 4).map((spec, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#001629] border border-[#002b4d]"
                  >
                    <span className="text-slate-400 block text-[10px] font-semibold">
                      {spec.label}
                    </span>
                    <span className="font-semibold text-white">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#003860]">
              <button
                onClick={() => {
                  const p = quickViewProduct;
                  setQuickViewProduct(null);
                  onSelectProduct(p);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#002b4d] hover:bg-[#003b69] text-[#00e3fd] text-xs font-semibold border border-[#004e80] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2]"
              >
                Ver Ficha Completa
              </button>
              <button
                onClick={() => {
                  const p = quickViewProduct;
                  setQuickViewProduct(null);
                  handleAddToCartAttempt(p);
                }}
                disabled={
                  !quickViewProduct.inStock || quickViewProduct.stockCount <= 0
                }
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6fb3d2] ${
                  !quickViewProduct.inStock || quickViewProduct.stockCount <= 0
                    ? "bg-[#002847] text-slate-500 cursor-not-allowed border border-[#003860]"
                    : "bg-[#00e3fd] hover:bg-[#3de9ff] text-[#001629]"
                }`}
              >
                {!quickViewProduct.inStock || quickViewProduct.stockCount <= 0
                  ? "Agotado"
                  : "Agregar al Carrito"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
