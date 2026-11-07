/**
 * AdminDropdown — Menú desplegable exclusivo del Administrador
 *
 * WCAG 2.1 AAA — Patrón ARIA: Navigation Menu Button
 * ─────────────────────────────────────────────────────────────────
 * • Solo se renderiza cuando user.role === 'admin' (renderizado condicional estricto)
 * • aria-haspopup="true" + aria-expanded dinámico en el botón disparador
 * • role="menu" en la lista + role="menuitem" en cada opción
 * • Teclado: Enter/Space → abre · Escape → cierra + devuelve foco · Tab → cierra
 * • Arrow Down/Up navega entre ítems; Home/End saltan al primero/último
 * • Click fuera (onBlur delegado via document listener) → cierra
 * • Paleta ergonómica: acento teal mate y superficie Off-White suave
 * ─────────────────────────────────────────────────────────────────
 */

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import {
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Package,
  Users,
  MessageSquareText,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { ActiveView, AdminPanelSection, UserAccount } from "../../types";

// ─────────────────────────────────────────────────────────────────────────────
// Definición de ítems del menú
// ─────────────────────────────────────────────────────────────────────────────

interface AdminMenuItem {
  id: string;
  label: string;
  description: string;
  icon: ElementType;
  view?: ActiveView;
  adminSection?: AdminPanelSection;
  badge?: string;
  badgeColor?: string;
  dividerBefore?: boolean;
  isDestructive?: boolean;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: "admin-dashboard",
    label: "Panel de Control",
    description: "Resumen ejecutivo de métricas y estado de la tienda",
    icon: LayoutDashboard,
    view: "admin",
    adminSection: "inventory",
    badge: "Admin",
    badgeColor: "bg-teal-700/40 text-teal-300 border-teal-600/50",
  },
  {
    id: "admin-catalog",
    label: "Gestión de Catálogo",
    description:
      "Agregar, editar, certificar y eliminar productos tecnológicos",
    icon: Package,
    view: "admin",
    adminSection: "inventory",
  },
  {
    id: "admin-users",
    label: "Control de Usuarios",
    description:
      "Verificar perfiles, asignar roles y auditar certificaciones de clientes",
    icon: Users,
    view: "admin",
    adminSection: "users",
  },
  {
    id: "admin-support",
    label: "Historial de Soporte Escrito",
    description: "Atender tickets del módulo de soporte inclusivo 100% escrito",
    icon: MessageSquareText,
    view: "contact_support",
  },
  {
    id: "admin-metrics",
    label: "Métricas de Ventas",
    description: "Consultar reportes de ventas y disponibilidad de inventario",
    icon: TrendingUp,
    view: "admin",
    adminSection: "analytics",
    dividerBefore: true,
  },
  {
    id: "admin-accessibility",
    label: "Centro de Accesibilidad",
    description:
      "Configurar parámetros de accesibilidad universal de la plataforma",
    icon: Settings,
    view: "accessibility",
    dividerBefore: true,
  },
  {
    id: "admin-logout",
    label: "Cerrar Sesión Admin",
    description: "Finalizar sesión de administrador de forma segura",
    icon: LogOut,
    isDestructive: true,
    dividerBefore: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AdminDropdownProps {
  /** Solo renderiza si la cuenta autenticada tiene rol explícito de admin */
  currentUser: UserAccount | null;
  currentView: ActiveView;
  onNavigate: (view: ActiveView, adminSection?: AdminPanelSection) => void;
  onLogout: () => void;
  onTriggerFlash: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
  onMenuFocusChange?: (description: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminDropdown({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
  onTriggerFlash,
  onMenuOpenChange,
  onMenuFocusChange,
}: AdminDropdownProps) {
  // ── SEGURIDAD: Renderizado condicional estricto por rol ───────────────────
  if (currentUser?.role !== "admin") return null;

  return (
    <AdminDropdownInner
      currentUser={currentUser}
      currentView={currentView}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onTriggerFlash={onTriggerFlash}
      onMenuOpenChange={onMenuOpenChange}
      onMenuFocusChange={onMenuFocusChange}
    />
  );
}

// ─── Inner component (solo monta cuando userRole === 'admin') ─────────────────

interface AdminDropdownInnerProps {
  currentUser: UserAccount;
  currentView: ActiveView;
  onNavigate: (view: ActiveView, adminSection?: AdminPanelSection) => void;
  onLogout: () => void;
  onTriggerFlash: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
  onMenuFocusChange?: (description: string | null) => void;
}

function AdminDropdownInner({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
  onTriggerFlash,
  onMenuOpenChange,
  onMenuFocusChange,
}: AdminDropdownInnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const totalItems = ADMIN_MENU_ITEMS.length;

  // ── Cerrar menú y devolver foco al botón disparador ───────────────────────
  const closeMenu = useCallback(
    (returnFocus = true) => {
      setIsOpen(false);
      setFocusedIndex(-1);
      onMenuOpenChange?.(false);
      onMenuFocusChange?.(null);
      if (returnFocus) {
        // RAF para garantizar que el DOM actualice antes de re-enfocar
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    },
    [onMenuFocusChange, onMenuOpenChange],
  );

  // ── Abrir menú y mover foco al primer ítem ────────────────────────────────
  const openMenu = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(0);
    onMenuOpenChange?.(true);
  }, [onMenuOpenChange]);

  // Cuando focusedIndex cambia, focalizar el elemento correspondiente
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && focusedIndex < totalItems) {
      requestAnimationFrame(() => {
        itemRefs.current[focusedIndex]?.focus();
        const item = ADMIN_MENU_ITEMS[focusedIndex];
        onMenuFocusChange?.(`${item.label}. ${item.description}`);
      });
    }
  }, [isOpen, focusedIndex, totalItems, onMenuFocusChange]);

  // ── Click fuera → cerrar ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeMenu]);

  // ── Teclado en el botón disparador ───────────────────────────────────────
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        isOpen ? closeMenu() : openMenu();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) openMenu();
        else setFocusedIndex(0);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) openMenu();
        else setFocusedIndex(totalItems - 1);
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          closeMenu();
        }
        break;
    }
  };

  // ── Teclado dentro del menú (Arrow Down/Up, Home, End, Escape, Tab) ───────
  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % totalItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(totalItems - 1);
        break;
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "Tab":
        // Tab fuera del menú → cierra sin devolver foco (deja que el Tab avance)
        closeMenu(false);
        break;
    }
  };

  const handleRootBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      closeMenu(false);
    }
  };

  // ── Ejecutar acción del ítem ──────────────────────────────────────────────
  const handleItemAction = (item: AdminMenuItem) => {
    closeMenu();
    onTriggerFlash();

    if (item.isDestructive) {
      onLogout();
    } else if (item.view) {
      onNavigate(item.view, item.adminSection);
    }
  };

  // ── ¿Algún view asociado es el activo actualmente? ────────────────────────
  const isAdminActive =
    currentView === "admin" ||
    currentView === "contact_support";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`fixed bottom-4 left-4 ${isOpen ? "z-[120]" : "z-[60]"}`}
      id="admin-dropdown-root"
      onBlur={handleRootBlur}
    >
      {/* ━━ BOTÓN DISPARADOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <button
        ref={triggerRef}
        id="admin-menu-trigger"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="admin-dropdown-menu"
        aria-label={`Menú de administrador${isOpen ? " — abierto" : " — cerrado"}. Presiona Enter para ${isOpen ? "cerrar" : "abrir"}`}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={[
          // Layout
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold",
          // Transición + foco
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729]",
          // Estado: activo vs inactivo
          isAdminActive || isOpen
            ? "bg-[#0f766e] border-2 border-[#0f766e] text-white shadow-md shadow-[#0f766e]/20"
            : "bg-[#134e5e] border-2 border-[#0d9488]/60 text-white hover:bg-[#0f766e] hover:border-[#0f766e]",
        ].join(" ")}
      >
        {/* Ícono escudo + avatar inicial */}
        <div
          className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0d9488] to-[#134e5e] flex items-center justify-center shadow-sm shrink-0"
          aria-hidden="true"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>

        {/* Nombre y rol */}
        <div className="hidden sm:block text-left leading-tight">
          <span className="block text-xs font-black text-white truncate max-w-[100px]">
            {currentUser?.name?.split(" ")[0] ?? "Admin"}
          </span>
          <span className="block text-[10px] font-semibold text-[#5eead4] uppercase tracking-wider">
            Administrador
          </span>
        </div>

        {/* Chevron animado */}
        <ChevronDown
          className={[
            "w-4 h-4 shrink-0 transition-transform duration-200",
            isOpen ? "rotate-180 text-[#5eead4]" : "text-[#5eead4]/70",
          ].join(" ")}
          aria-hidden="true"
        />

        {/* Indicador de sesión activa (pulse) */}
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0d9488] border-2 border-[#001729] animate-pulse"
          aria-hidden="true"
          title="Sesión de administrador activa"
        />
      </button>

      {/* ━━ MENÚ DESPLEGABLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isOpen && (
        <div
          ref={menuRef}
          id="admin-dropdown-menu"
          role="menu"
          aria-labelledby="admin-menu-trigger"
          aria-orientation="vertical"
          onKeyDown={handleMenuKeyDown}
          className={[
            // Posicionamiento: aparece debajo del botón, alineado a la derecha
            "absolute bottom-full left-0 mb-2 z-50",
            // Dimensiones
            "w-[min(20rem,calc(100vw-2rem))] max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain",
            // Fondo ergonómico Off-White oscuro → sin encandilamiento
            "bg-[#f4f7f4] border border-[#a8c8bf]",
            // Forma y sombra premium
            "rounded-2xl shadow-2xl shadow-black/40",
            // Animación de apertura suave
            "animate-fadeIn",
          ].join(" ")}
        >
          {/* ── Cabecera del menú: identidad del admin ─────────────────────── */}
          <div className="px-4 pt-4 pb-3 border-b border-[#c9d8d2]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#134e5e] flex items-center justify-center shadow-md shrink-0"
                aria-hidden="true"
              >
                <span className="text-white font-black text-base">
                  {currentUser?.name?.charAt(0) ?? "A"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#263b37] truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-[#526861] truncate">
                  {currentUser.email}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full bg-[#dceee8] border border-[#a8c8bf] text-xs font-bold text-[#155e55] uppercase">
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                  Acceso Total Verificado
                </span>
              </div>
            </div>
          </div>

          {/* ── Ítems del menú ────────────────────────────────────────────── */}
          <div className="py-2" role="none">
            {ADMIN_MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                item.view === currentView &&
                (currentView !== "admin" || item.id === "admin-dashboard") &&
                !item.isDestructive;

              return (
                <div key={item.id} role="none">
                  {/* Divisor semántico */}
                  {item.dividerBefore && (
                    <div
                      role="separator"
                      aria-hidden="true"
                      className="my-1.5 mx-4 border-t border-[#c9d8d2]"
                    />
                  )}

                  <button
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    id={`admin-menuitem-${item.id}`}
                    tabIndex={
                      -1
                    } /* Foco gestionado programáticamente por Arrow keys */
                    aria-label={`${item.label}: ${item.description}${isActive ? " — sección activa actual" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={false}
                    onClick={() => handleItemAction(item)}
                    className={[
                      // Layout
                      "w-full flex items-start gap-3 px-4 py-3 text-left",
                      // Transición + foco exclusivo para teclado
                      "transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f766e]",
                      // Estados
                      item.isDestructive
                        ? "text-[#9f3434] hover:bg-[#f9e6e3] focus-visible:bg-[#f9e6e3]"
                        : isActive
                          ? "bg-[#dceee8] text-[#153b36]"
                          : "text-[#263b37] hover:bg-[#e6f0eb] hover:text-[#153b36] focus-visible:bg-[#e6f0eb] focus-visible:text-[#153b36]",
                    ].join(" ")}
                  >
                    {/* Ícono en contenedor mate */}
                    <div
                      className={[
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        item.isDestructive
                          ? "bg-[#f9e6e3]"
                          : isActive
                            ? "bg-[#cce5db]"
                            : "bg-[#e6eeea]",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <Icon
                        className={[
                          "w-4 h-4",
                          item.isDestructive
                            ? "text-[#9f3434]"
                            : isActive
                              ? "text-[#0f766e]"
                              : "text-[#47746a]",
                        ].join(" ")}
                      />
                    </div>

                    {/* Texto del ítem */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold leading-snug">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-bold border bg-[#dceee8] text-[#155e55] border-[#a8c8bf]"
                            aria-hidden="true"
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#dceee8] text-[#155e55] border border-[#a8c8bf]"
                            aria-hidden="true"
                          >
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#526861] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Pie del menú: atajos de teclado ──────────────────────────── */}
          <div
            className="px-4 py-3 border-t border-[#c9d8d2] flex items-center justify-between text-xs text-[#526861]"
            aria-hidden="true"
          >
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#c9d8d2] font-mono text-[#263b37]">
                ↑↓
              </kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#c9d8d2] font-mono text-[#263b37]">
                Enter
              </kbd>
              <span>Seleccionar</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#c9d8d2] font-mono text-[#263b37]">
                Esc
              </kbd>
              <span>Cerrar</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Región aria-live: notifica apertura/cierre a lectores de pantalla ─ */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isOpen
          ? "Menú de administrador abierto. Usa las teclas de flecha para navegar entre las opciones. Presiona Escape para cerrar."
          : ""}
      </div>
    </div>
  );
}
