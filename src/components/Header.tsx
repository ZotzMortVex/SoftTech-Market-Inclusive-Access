import {
  ActiveView,
  UserRole,
  AccessibilitySettings,
  UserAccount,
} from "../types";
import {
  ShoppingBag,
  ShieldCheck,
  UserRound,
  Sliders,
  Menu,
  X,
  PackageCheck,
  Check,
  Sun,
  Moon,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import { useState } from "react";
import {
  FONT_SCALE_BUTTON_STEP,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
} from "../utils/accessibilityScale";

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartCount: number;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  accessibility: AccessibilitySettings;
  onUpdateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  currentUser: UserAccount | null;
  onTriggerFlash: () => void;
  onLogout?: () => void;
}

export function Header({
  currentView,
  onNavigate,
  cartCount,
  userRole,
  onRoleChange,
  accessibility,
  onUpdateAccessibility,
  currentUser,
  onTriggerFlash,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleIncreaseFont = () => {
    const nextSize = Math.min(
      MAX_FONT_SCALE,
      accessibility.fontSize + FONT_SCALE_BUTTON_STEP,
    );
    onUpdateAccessibility({ fontSize: nextSize });
    onTriggerFlash();
  };

  const handleDecreaseFont = () => {
    const nextSize = Math.max(
      MIN_FONT_SCALE,
      accessibility.fontSize - FONT_SCALE_BUTTON_STEP,
    );
    onUpdateAccessibility({ fontSize: nextSize });
    onTriggerFlash();
  };

  const cycleContrast = () => {
    const nextMode =
      accessibility.contrastMode === "dark_deep"
        ? "light_mode"
        : accessibility.contrastMode === "light_mode"
          ? "high_contrast"
          : "dark_deep";
    onUpdateAccessibility({
      contrastMode: nextMode,
      highContrast: nextMode === "high_contrast",
    });
    onTriggerFlash();
  };

  const roleLabels = {
    visitor: "Visitante (Solo Catálogo)",
    user: "Usuario Registrado",
    admin: "Administrador de Plataforma",
  };

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#001729]/95 backdrop-blur-md border-b-2 border-[#003459] text-white">
      {/* Top Accessibility & Role Bar */}
      <div className="bg-[#000f1c] border-b border-[#002744] px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Inclusive Guarantee Status */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00e3fd]/15 text-[#00e3fd] font-medium border border-[#00e3fd]/40">
              <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
              100% Visual · Cero Audio WCAG 2.1 AAA
            </span>
            <span className="hidden md:inline text-slate-400">
              Comunicación escrita y avisos lumínicos certificados
            </span>
          </div>

          {/* Right: Accessibility Controls & Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Visual Text Scaling: A- / Indicator / A+ */}
            <div className="flex items-center rounded-lg border border-slate-600 bg-[#001e36] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={accessibility.fontSize <= MIN_FONT_SCALE}
                title="Disminuir tamaño de texto (A-)"
                aria-label="Disminuir tamaño de texto"
                className="px-1.5 py-0.5 rounded hover:bg-[#002b4d] text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
              >
                A-
              </button>
              <span className="px-1.5 text-[#00e3fd] font-mono font-bold">
                {accessibility.fontSize}%
              </span>
              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={accessibility.fontSize >= MAX_FONT_SCALE}
                title="Aumentar tamaño de texto (A+)"
                aria-label="Aumentar tamaño de texto"
                className="px-1.5 py-0.5 rounded hover:bg-[#002b4d] text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
              >
                A+
              </button>
            </div>

            {/* Quick Contrast / Theme Button */}
            <button
              onClick={cycleContrast}
              title="Alternar entre Modo Oscuro, Modo Claro y Alto Contraste"
              aria-label="Alternar esquema de color y contraste"
              className="px-2 py-1 rounded-lg border border-slate-600 bg-[#001e36] hover:bg-[#002b4d] text-slate-200 font-semibold transition-colors flex items-center gap-1.5 text-[11px]"
            >
              {accessibility.contrastMode === "light_mode" ? (
                <Sun className="w-3.5 h-3.5 text-[#00e3fd]" />
              ) : accessibility.contrastMode === "high_contrast" ? (
                <Sparkles className="w-3.5 h-3.5 text-[#ffc038]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#00e3fd]" />
              )}
              <span className="hidden sm:inline">Modo:</span>
              <span className="text-[#ffc038] uppercase font-bold text-[10px]">
                {accessibility.contrastMode === "dark_deep"
                  ? "Oscuro"
                  : accessibility.contrastMode === "high_contrast"
                    ? "Alto Contraste"
                    : "Claro"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("admin_login")}
              aria-label="Iniciar sesión"
              title="Iniciar sesión; el correo determina el rol de acceso"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#ffc038]/70 bg-[#2a1a00] text-[#ffc038] hover:bg-[#3d2500] font-bold text-[11px] transition-colors"
            >
              <UserRound className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>

            {/* Role Switcher Pill — EXCLUSIVO PARA ADMINISTRADOR */}
            {userRole === "admin" && (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#ffc038]/60 bg-[#2a1a00] hover:bg-[#3d2500] text-white text-xs font-medium transition-all"
                  aria-expanded={roleMenuOpen}
                  title="Selector de Rol — Solo visible para Administradores"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffc038]" />
                  <span className="text-slate-300">Rol:</span>
                  <span className="font-bold text-[#ffc038]">
                    {roleLabels[userRole].split(" ")[0]}
                  </span>
                </button>

                {roleMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-64 rounded-xl bg-[#001d36] border-2 border-[#004a7a] shadow-2xl p-2 z-50 text-xs"
                    onClick={() => setRoleMenuOpen(false)}
                  >
                    <div className="px-2 py-1 text-slate-400 font-semibold border-b border-[#003254] mb-1">
                      Cambiar Modo de Rol Simulado:
                    </div>
                    {(["visitor", "user", "admin"] as UserRole[]).map(
                      (role) => (
                        <button
                          key={role}
                          onClick={() => {
                            onRoleChange(role);
                            onTriggerFlash();
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                            userRole === role
                              ? "bg-[#00e3fd] text-[#001629] font-bold"
                              : "text-slate-200 hover:bg-[#002b4d]"
                          }`}
                        >
                          <span>{roleLabels[role]}</span>
                          {userRole === role && <Check className="w-4 h-4" />}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo Brand */}
          <button
            onClick={() => handleNavClick("catalog")}
            className="flex items-center gap-3 text-left focus:outline-none group"
            aria-label="Ir al catálogo principal de SoftTech Market"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#006875] to-[#002b49] border-2 border-[#00e3fd] flex items-center justify-center shadow-lg shadow-[#00e3fd]/10 group-hover:border-white transition-all">
              <span className="text-[#00e3fd] font-black text-xl tracking-tighter">
                ST
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#00e3fd] transition-colors">
                  SoftTech Market
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  INCLUSIVO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Tecnología 100% Visual · Sin Barreras Sonoras
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNavClick("catalog")}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === "catalog" || currentView === "product_detail"
                  ? "bg-[#002b49] text-[#00e3fd] border border-[#00e3fd]/40 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-[#00223b]"
              }`}
            >
              Catálogo Tecnológico
            </button>

            {userRole === "user" && (
              <button
                onClick={() => handleNavClick("order_history")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentView === "order_history" ||
                  currentView === "order_confirmation"
                    ? "bg-[#002b49] text-[#00e3fd] border border-[#00e3fd]/40 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-[#00223b]"
                }`}
              >
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Mis Pedidos</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick("admin_login")}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border border-[#ffc038]/60 bg-[#2a1a00] text-[#ffc038] hover:bg-[#3d2500]"
            >
              <UserRound className="w-4 h-4 text-[#ffc038]" />
              <span>Ingresar</span>
            </button>

            <button
              onClick={() => handleNavClick("accessibility")}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === "accessibility"
                  ? "bg-[#002b49] text-[#00e3fd] border border-[#00e3fd]/40 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-[#00223b]"
              }`}
            >
              <Sliders className="w-4 h-4 text-[#00e3fd]" />
              <span>Accesibilidad</span>
            </button>

            <button
              onClick={() => handleNavClick("contact_support")}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === "contact_support" || currentView === "support"
                  ? "bg-[#002b49] text-[#00e3fd] border border-[#00e3fd]/40 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-[#00223b]"
              }`}
            >
              <MessageSquareText className="w-4 h-4 text-[#00e3fd]" />
              <span>Soporte Escrito</span>
            </button>
          </nav>

          {/* Right Actions: Cart & User Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <button
              onClick={() => handleNavClick("cart")}
              className={`relative p-2.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all flex items-center gap-2 ${
                currentView === "cart"
                  ? "bg-[#00e3fd] text-[#001629] border-[#00e3fd] font-bold shadow-lg shadow-[#00e3fd]/20"
                  : "bg-[#00243e] border-[#004772] text-white hover:border-[#00e3fd]"
              }`}
              aria-label={`Ver carrito de compras, ${cartCount} artículos`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-semibold">
                Carrito
              </span>
              {cartCount > 0 && (
                <span className="cart-count-badge absolute -top-1.5 -right-1.5 sm:static flex items-center justify-center min-w-5 h-5 rounded-full text-xs font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {userRole === "visitor" ? (
              <button
                onClick={() => handleNavClick("cart")}
                className="px-3 py-2 rounded-xl border border-[#00e3fd]/40 hover:bg-[#002b49] text-[#00e3fd] font-medium text-xs sm:text-sm transition-colors"
              >
                Explorar catálogo
              </button>
            ) : (
              <button
                onClick={() => handleNavClick("profile")}
                className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all ${
                  currentView === "profile" ||
                  currentView === "register" ||
                  currentView === "login"
                    ? "bg-[#002b49] border-[#00e3fd] text-[#00e3fd]"
                    : "bg-[#00223b] border-[#003e63] text-slate-200 hover:border-slate-400"
                }`}
                title="Ir a mi perfil y configuración de usuario"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  {currentUser?.name ? currentUser.name.charAt(0) : "U"}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-bold text-white truncate max-w-[110px]">
                    {currentUser?.name || "Mi Perfil"}
                  </p>
                  <p className="text-[10px] text-emerald-400">Verificado</p>
                </div>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#00243e] border border-[#003e63] text-slate-200 hover:text-white"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#001a30] border-t border-[#003459] px-4 py-4 space-y-2 animate-fadeIn">
          <button
            onClick={() => handleNavClick("catalog")}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-200 hover:bg-[#002b4d]"
          >
            Catálogo principal
          </button>
          <button
            onClick={() => handleNavClick("cart")}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-200 hover:bg-[#002b4d] flex items-center justify-between"
          >
            <span>Carrito de Compras</span>
            <span className="cart-count-badge px-2 py-0.5 rounded-full text-xs font-bold">
              {cartCount}
            </span>
          </button>
          {userRole === "user" && (
            <button
              onClick={() => handleNavClick("order_history")}
              className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-200 hover:bg-[#002b4d]"
            >
              Mis pedidos
            </button>
          )}
          {/* Acceso rápido Admin en móvil — el dropdown completo está en desktop */}
          {userRole === "admin" && (
            <button
              onClick={() => handleNavClick("admin")}
              className="w-full text-left px-4 py-2.5 rounded-xl font-semibold flex items-center justify-between bg-[#0f3a47]/50 border border-[#0d9488]/40 text-[#5eead4] hover:bg-[#134e5e]"
              aria-label="Ir al Panel de Control Administrativo"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Panel Administrativo
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#0d9488]/20 border border-[#0d9488]/40 font-bold uppercase tracking-wider">
                Admin
              </span>
            </button>
          )}
          <button
            onClick={() => handleNavClick("accessibility")}
            className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#00e3fd] hover:bg-[#002b4d]"
          >
            Centro de Accesibilidad Universal
          </button>
          <button
            onClick={() => handleNavClick("contact_support")}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 ${
              currentView === "contact_support" || currentView === "support"
                ? "bg-[#002b49] text-[#00e3fd] font-bold"
                : "text-slate-200 hover:bg-[#002b4d]"
            }`}
          >
            <MessageSquareText className="w-4 h-4 text-[#00e3fd]" />
            <span>Contacto & Soporte 100% Escrito</span>
          </button>

          <div className="pt-3 border-t border-[#003459] flex items-center justify-between gap-2">
            <button
              onClick={() => handleNavClick("admin_login")}
              className="w-full py-2 text-center rounded-xl border border-[#ffc038]/60 bg-[#2a1a00] text-[#ffc038] font-bold text-sm"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
