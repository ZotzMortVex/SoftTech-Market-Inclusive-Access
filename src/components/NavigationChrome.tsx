import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  PackageCheck,
  PackagePlus,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { ActiveView, UserRole } from "../types";
import { BrandSymbol } from "./BrandSymbol";

interface NavigationChromeProps {
  currentView: ActiveView;
  userRole: UserRole;
  isAdminAuthenticated: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (view: ActiveView) => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onLogout: () => void;
  onRequestProduct: () => void;
}

export function NavigationChrome({
  currentView,
  userRole,
  isAdminAuthenticated,
  canGoBack,
  canGoForward,
  onNavigate,
  onNavigateBack,
  onNavigateForward,
  onLogout,
  onRequestProduct,
}: NavigationChromeProps) {
  const [isTopPinned, setIsTopPinned] = useState(true);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSideHovered, setIsSideHovered] = useState(false);
  const topMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const topHoverRailRef = useRef<HTMLDivElement>(null);
  const topNavigationRef = useRef<HTMLElement>(null);
  const sideMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreTopTriggerFocusRef = useRef(false);
  const restoreSideTriggerFocusRef = useRef(false);
  const sideHoverRailRef = useRef<HTMLDivElement>(null);
  const sideNavigationRef = useRef<HTMLElement>(null);
  const isTopVisible = isTopPinned || isTopHovered;
  const isSideMenuVisible = isSideMenuOpen || isSideHovered;
  const currentMode =
    userRole === "admin"
      ? "Administrador"
      : userRole === "user"
        ? "Usuario"
        : "Visitante";
  const currentModeColor =
    userRole === "admin"
      ? "bg-[#8a5c00]"
      : userRole === "user"
        ? "bg-[#34a273]"
        : "bg-[#00e3fd]";

  useEffect(() => {
    if (!isTopVisible && restoreTopTriggerFocusRef.current) {
      topMenuTriggerRef.current?.focus();
      restoreTopTriggerFocusRef.current = false;
    }
  }, [isTopVisible]);

  useEffect(() => {
    if (!isSideMenuVisible && restoreSideTriggerFocusRef.current) {
      sideMenuTriggerRef.current?.focus();
      restoreSideTriggerFocusRef.current = false;
    }
  }, [isSideMenuVisible]);

  const navigate = (view: ActiveView) => {
    onNavigate(view);
    setIsTopPinned(true);
    closeSideMenu();
  };

  const closeSideMenu = () => {
    restoreSideTriggerFocusRef.current = true;
    setIsSideMenuOpen(false);
    setIsSideHovered(false);
  };

  const closeTopBanner = () => {
    restoreTopTriggerFocusRef.current = true;
    setIsTopPinned(false);
    setIsTopHovered(false);
  };

  const handleTopPointerLeave = (event: ReactMouseEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    const remainsInTopArea =
      nextTarget instanceof Node &&
      (topMenuTriggerRef.current?.contains(nextTarget) ||
        topHoverRailRef.current?.contains(nextTarget) ||
        topNavigationRef.current?.contains(nextTarget));

    if (!remainsInTopArea && !isTopPinned) setIsTopHovered(false);
  };

  const handleSidePointerLeave = (event: ReactMouseEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    const remainsInSideArea =
      nextTarget instanceof Node &&
      (sideMenuTriggerRef.current?.contains(nextTarget) ||
        sideHoverRailRef.current?.contains(nextTarget) ||
        sideNavigationRef.current?.contains(nextTarget));

    if (!remainsInSideArea) setIsSideHovered(false);
  };

  return (
    <>
      <div
        ref={topHoverRailRef}
        className="fixed inset-x-0 top-0 z-[70] h-2"
        aria-hidden="true"
        onMouseEnter={() => setIsTopHovered(true)}
        onMouseLeave={handleTopPointerLeave}
      />

      <div
        ref={sideHoverRailRef}
        className="fixed bottom-0 left-0 top-0 z-[75] w-3"
        aria-hidden="true"
        onMouseEnter={() => setIsSideHovered(true)}
        onMouseLeave={handleSidePointerLeave}
      />

      <header
        ref={topNavigationRef}
        className={`store-navigation-header premium-nav-shell fixed inset-x-0 top-0 z-[70] w-full text-white transition-transform duration-300 ${isTopVisible ? "translate-y-0" : "-translate-y-full"}`}
        onMouseEnter={() => setIsTopHovered(true)}
        onMouseLeave={handleTopPointerLeave}
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onNavigateBack}
            disabled={!canGoBack}
            aria-label="Ir a la pantalla anterior"
            title="Ir atrás"
            className="store-history-arrow store-history-arrow-back"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Atrás</span>
          </button>
          <span className="sm:hidden">
            <BrandSymbol size={38} />
          </span>
          <span className="hidden sm:block">
            <BrandSymbol size={42} showText textTone="inverse" />
          </span>
          <nav
            className="flex shrink-0 items-center justify-end gap-1 sm:gap-2"
            aria-label="Navegación superior"
          >
            <span
              role="status"
              aria-live="polite"
              aria-label={`Modo ${currentMode}`}
              className={`${userRole === "admin" ? "admin-mode-indicator" : "premium-status-pill"} inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-black`}
            >
              <span
                className={`h-2 w-2 rounded-full ${userRole === "admin" ? "admin-mode-indicator__dot" : currentModeColor}`}
                aria-hidden="true"
              />
              <span className={`admin-mode-indicator__label ${userRole === "admin" ? "" : "hidden lg:inline"}`}>
                Modo {currentMode}
              </span>
            </span>
              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigate("admin")}
                  aria-label="Ir a la administración"
                  aria-current={currentView === "admin" ? "page" : undefined}
                  className="premium-nav-option"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">ADMIN</span>
                </button>
              )}
              {userRole === "user" && (
                <button
                  type="button"
                  onClick={() => navigate("order_history")}
                  aria-label="Ver mis pedidos"
                  aria-current={currentView === "order_history" ? "page" : undefined}
                  className="premium-nav-option"
                >
                  <PackageCheck className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Mis pedidos</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("welcome")}
              aria-label="Ir al inicio"
              className="premium-nav-option"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Inicio</span>
            </button>
            {userRole === "visitor" ? (
              <button
                type="button"
                onClick={() => navigate("login")}
                aria-label="Iniciar sesión"
                className="premium-nav-option"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                aria-label="Cerrar sesión"
                className="premium-nav-option"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">Cerrar sesión</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRequestProduct}
              aria-label="Solicitar producto no encontrado"
              className="premium-nav-option"
            >
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden xl:inline">
                Solicitar producto no encontrado
              </span>
            </button>
          </nav>
          <button
            type="button"
            onClick={closeTopBanner}
            aria-label="Cerrar banner superior"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNavigateForward}
            disabled={!canGoForward}
            aria-label="Ir a la pantalla siguiente"
            title="Ir adelante"
            className="store-history-arrow store-history-arrow-forward"
          >
            <span className="hidden sm:inline">Adelante</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        className={`shrink-0 transition-[height] duration-300 ${isTopVisible ? "h-16" : "h-0"}`}
      />

      <div className="fixed right-3 top-2 z-[80] flex flex-col items-end">
        {!isTopVisible && (
          <button
            type="button"
            ref={topMenuTriggerRef}
            onClick={() => setIsTopPinned(true)}
            aria-label="Mostrar banner superior"
            aria-expanded={false}
            className="navigation-menu-trigger relative flex h-14 w-14 items-center justify-center rounded-xl border-2 border-cyan-300 text-white shadow-xl shadow-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <BrandSymbol size={30} />
            <Menu
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#f7c948] p-0.5 text-[#172332]"
              aria-hidden="true"
            />
          </button>
        )}
        {!isTopVisible && (
          <span
            role="status"
            aria-live="polite"
            className={`${userRole === "admin" ? "admin-mode-indicator" : "premium-status-pill"} mt-1 inline-flex min-h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-black shadow-md`}
          >
            <span
              className={`h-2 w-2 rounded-full ${userRole === "admin" ? "admin-mode-indicator__dot" : currentModeColor}`}
              aria-hidden="true"
            />
            <span className="admin-mode-indicator__label">Modo {currentMode}</span>
          </span>
        )}
      </div>

      {!isSideMenuVisible && (
        <button
          type="button"
          ref={sideMenuTriggerRef}
          onClick={() => setIsSideMenuOpen(true)}
          onMouseLeave={handleSidePointerLeave}
          aria-label="Abrir navegación lateral"
          aria-expanded={false}
          aria-controls="accessible-side-navigation"
          className="navigation-menu-trigger fixed left-3 top-20 z-[80] flex h-14 w-14 items-center justify-center gap-0.5 rounded-2xl border-2 border-cyan-300 text-white shadow-[0_14px_28px_rgba(2,18,30,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          <BrandSymbol size={30} />
          <Menu
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#f7c948] p-0.5 text-[#172332]"
            aria-hidden="true"
          />
        </button>
      )}

      {isSideMenuOpen && (
        <button
          type="button"
          onClick={closeSideMenu}
          className="fixed inset-0 z-[85] cursor-default bg-black/35"
          aria-label="Cerrar menú lateral"
        />
      )}

      <aside
        ref={sideNavigationRef}
        id="accessible-side-navigation"
        aria-label="Navegación accesible"
        aria-hidden={!isSideMenuVisible}
        inert={!isSideMenuVisible}
        onMouseEnter={() => setIsSideHovered(true)}
        onMouseLeave={handleSidePointerLeave}
        className={`fixed bottom-0 left-0 top-0 z-[90] flex w-[min(20rem,88vw)] flex-col border-r border-cyan-700/70 bg-gradient-to-b from-[#0b3550] via-[#0a4055] to-[#0b2d40] px-5 pb-6 pt-20 text-white shadow-2xl transition-transform duration-300 ${isSideMenuVisible ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/15 pb-5">
          <BrandSymbol size={42} showText textTone="inverse" />
          <button
            type="button"
            onClick={closeSideMenu}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Cerrar navegación lateral"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="grid gap-2" aria-label="Secciones principales">
          <button
            type="button"
            onClick={() => navigate("auth_register")}
            className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-white/10"
          >
            <UserPlus className="h-5 w-5 text-[#f7c948]" aria-hidden="true" />
            Registro
          </button>
          <button
            type="button"
            onClick={() => navigate("catalog")}
            className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-white/10 ${currentView === "catalog" ? "bg-white/10" : ""}`}
          >
            <PackagePlus
              className="h-5 w-5 text-[#f7c948]"
              aria-hidden="true"
            />
            Catálogo de productos
          </button>
          {userRole === "user" && (
            <button
              type="button"
              onClick={() => navigate("order_history")}
              aria-current={currentView === "order_history" ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-white/10 ${currentView === "order_history" ? "bg-white/10" : ""}`}
            >
              <PackageCheck className="h-5 w-5 text-[#f7c948]" aria-hidden="true" />
              Mis pedidos
            </button>
          )}
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("admin")}
              aria-current={currentView === "admin" ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-white/10 ${currentView === "admin" ? "bg-white/10" : ""}`}
            >
              <ShieldCheck
                className="h-5 w-5 text-[#f7c948]"
                aria-hidden="true"
              />
              ADMIN
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("accessibility")}
            className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-white/10 ${currentView === "accessibility" ? "bg-white/10" : ""}`}
          >
            <Accessibility
              className="h-5 w-5 text-[#f7c948]"
              aria-hidden="true"
            />
            Centro de ajuste de accesibilidad
          </button>
          <button
            type="button"
            onClick={() => navigate("contact_support")}
            className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-white/10 ${currentView === "contact_support" ? "bg-white/10" : ""}`}
          >
            <MessageSquareText
              className="h-5 w-5 text-[#f7c948]"
              aria-hidden="true"
            />
            Contacto y soporte sin barrera auditiva
          </button>
        </nav>
        {userRole !== "visitor" && (
          <div className="mt-4 border-t border-white/15 pt-4">
            <button
              type="button"
              onClick={() => {
                closeSideMenu();
                onLogout();
              }}
              className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left font-semibold text-[#ffb4a8] hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
