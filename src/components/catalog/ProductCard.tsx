import React from "react";
import { Product, UserRole } from "../../types";
import {
  Eye,
  ShoppingBag,
  Star,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatCOP } from "../../utils/formatters";
import { useSignLanguage } from "../../context/SignLanguageContext";

interface ProductCardProps {
  key?: string;
  product: Product;
  userRole: UserRole;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export function ProductCard({
  product,
  userRole,
  onSelectProduct,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const { triggerLscVideo, setIsMinimized } = useSignLanguage();
  const isOutOfStock = !product.inStock || product.stockCount <= 0;
  const activateProductInterpreter = () => {
    triggerLscVideo(
      product.lscVideoUrl,
      `Señas del producto: ${product.name}`,
    );
  };
  const minimizeInterpreterWhenFocusLeaves = (
    event: React.FocusEvent<HTMLElement>,
  ) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setIsMinimized(true);
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[1.7rem] border border-[#003d69] bg-[linear-gradient(180deg,#001d33_0%,#001729_100%)] shadow-[0_20px_44px_rgba(2,12,24,0.34)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00e3fd] hover:shadow-[0_26px_52px_rgba(0,227,253,0.12)] text-left"
      aria-label={`Producto: ${product.name}`}
      onMouseEnter={activateProductInterpreter}
      onMouseLeave={() => setIsMinimized(true)}
      onFocusCapture={activateProductInterpreter}
      onBlurCapture={minimizeInterpreterWhenFocusLeaves}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#001221]">
        <img
          src={product.images.primary}
          alt={`Fotografía de ${product.name}`}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-[#00e3fd]/40 bg-[#001629]/90 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00e3fd] shadow-sm backdrop-blur">
            {product.code}
          </span>
          <span className="rounded-md border border-[#004273] bg-[#002847]/90 px-2 py-0.5 text-[10px] font-medium text-slate-200 backdrop-blur">
            {product.category}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5449]/40 bg-[#1f0d10]/95 px-2.5 py-1 text-[10px] font-bold text-[#ff5449] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ff5449]" />
              Agotado ({product.stockCount || 0})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-[#001a30]/95 px-2.5 py-1 text-[10px] font-bold text-emerald-300 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Stock: {product.stockCount} un.
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#001629] via-[#001629]/85 to-transparent p-3 pt-6">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00e3fd]">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{product.visualAlert}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-[#ffc038]">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold">{product.rating}</span>
              <span className="font-medium text-slate-400">
                ({product.reviewsCount})
              </span>
            </div>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="line-clamp-2 cursor-pointer text-base font-black text-white transition-colors duration-200 group-hover:text-[#00e3fd]"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">
            {product.description}
          </p>
        </div>

        <div className="space-y-3 border-t border-[#003459] pt-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="block text-[10px] font-medium text-slate-400">
                Precio accesible:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  {formatCOP(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-[11px] font-medium text-slate-400 line-through">
                    {formatCOP(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              Envío $0 Cero Audio
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#004e80] bg-[#002b4d] px-3 py-2.5 text-[11px] font-bold text-[#00e3fd] transition-all duration-200 hover:bg-[#003865] active:scale-95"
              aria-label={`Ver especificaciones y ficha técnica de ${product.name}`}
            >
              <span>Ficha Técnica</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-black transition-all duration-200 active:scale-95 ${
                isOutOfStock
                  ? "cursor-not-allowed border border-[#003860] bg-[#002847] text-slate-500"
                  : "bg-[#00e3fd] text-[#001629] shadow-[0_10px_24px_rgba(0,227,253,0.22)] hover:bg-[#3ce9ff]"
              }`}
              aria-label={
                isOutOfStock
                  ? `Producto ${product.name} agotado`
                  : `Agregar ${product.name} al carrito`
              }
            >
              {isOutOfStock ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Agotado</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="flex w-full items-center justify-center gap-1 py-1 text-center text-[11px] text-slate-400 transition-colors duration-200 hover:text-white"
          >
            <Info className="h-3 w-3 text-[#00e3fd]" />
            <span>Vista rápida accesible</span>
          </button>
        </div>
      </div>
    </article>
  );
}
