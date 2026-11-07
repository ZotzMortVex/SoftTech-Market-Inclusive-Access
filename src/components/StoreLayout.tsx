import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { 
  UserRole, 
  UserAccount, 
  ActiveView, 
  AccessibilitySettings 
} from '../types';
import { 
  ShoppingBag, 
  ShieldCheck, 
  User, 
  Sliders, 
  MessageSquareText, 
  LayoutDashboard, 
  ChevronDown, 
  PackageCheck, 
  LogOut, 
  HelpCircle, 
  Sun, 
  Moon, 
  Sparkles,
  Inbox,
  Boxes,
  BellRing,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ToastNotification } from './ToastNotification';

interface StoreLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  currentUser: UserAccount | null;
  currentView: ActiveView;
  cartCount: number;
  accessibilitySettings: AccessibilitySettings;
  onNavigate: (view: ActiveView) => void;
  onRoleChange: (role: UserRole) => void;
  onUpdateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  onTriggerFlash: () => void;
}

export function StoreLayout({
  children,
  userRole,
  currentUser,
  currentView,
  cartCount,
  accessibilitySettings,
  onNavigate,
  onRoleChange,
  onUpdateAccessibility,
  onTriggerFlash
}: StoreLayoutProps) {
  const { showToast } = useToast();

  // Estados de menús desplegables
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAccessibilityDropdownOpen, setIsAccessibilityDropdownOpen] = useState(false);

  // Referencias para cerrar menús al hacer click fuera
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const accessibilityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (accessibilityMenuRef.current && !accessibilityMenuRef.current.contains(event.target as Node)) {
        setIsAccessibilityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminAction = (actionTitle: string, targetView?: ActiveView) => {
    setIsAdminDropdownOpen(false);
    showToast({
      type: 'info',
      title: 'Módulo Administrativo Activado',
      message: `Has seleccionado: ${actionTitle}. Los cambios se sincronizan en tiempo real con cero fatiga visual.`,
      badge: 'Admin Panel'
    });
    if (targetView) {
      onNavigate(targetView);
    }
  };

  const cycleContrast = () => {
    const nextMode = accessibilitySettings.contrastMode === 'dark_deep'
      ? 'light_mode'
      : accessibilitySettings.contrastMode === 'light_mode'
      ? 'high_contrast'
      : 'dark_deep';

    onUpdateAccessibility({ 
      contrastMode: nextMode,
      highContrast: nextMode === 'high_contrast'
    });
    onTriggerFlash();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-[#1b2432] font-sans antialiased selection:bg-[#c9ddf0] selection:text-[#0f2842] transition-colors duration-200">
      {/* Contenedor Flotante de Alertas Visuales Accesibles */}
      <ToastNotification />

      {/* 1. Barra Superior Ergonómica y de Certificación Accesible */}
      <div className="bg-[#e9edf2] border-b border-[#d8e0e8] px-4 py-2 text-xs text-[#415367]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Sello de Inclusión y Cero Audio */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dbeae3] border border-[#a2cebb] text-[#123e2f] font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#207a5c] animate-pulse" />
              100% Visual · Cero Audio WCAG 2.1 AAA
            </span>
            <span className="hidden md:inline text-[#55677d]">
              Plataforma diseñada para personas sordas, hipoacúsicas y jornadas prolongadas.
            </span>
          </div>

          {/* Controles de Salud Visual y Selector de Rol Simulado */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Ajuste Rápido de Contraste */}
            <button
              type="button"
              onClick={cycleContrast}
              className="px-2.5 py-1 rounded-lg bg-[#f0f4f8] hover:bg-[#e1e9f1] border border-[#cbd8e5] text-[#243c53] font-medium transition-all duration-200 flex items-center gap-1.5 text-xs active:scale-95"
              title="Alternar esquema ergonómico de contraste"
              aria-label="Alternar esquema de contraste"
            >
              <Sun className="w-3.5 h-3.5 text-[#2b567b]" />
              <span className="hidden sm:inline">Esquema:</span>
              <span className="font-bold uppercase text-[10px] text-[#1d4367]">
                {accessibilitySettings.contrastMode === 'dark_deep' ? 'Oscuro Aterciopelado' : accessibilitySettings.contrastMode === 'high_contrast' ? 'Alto Contraste' : 'Luz Suave (Off-White)'}
              </span>
            </button>

            {/* Selector de Rol Simulado (Solo para pruebas de desarrollo o Administrador) */}
            <div className="flex items-center bg-[#f0f4f8] rounded-lg border border-[#cbd8e5] p-0.5 text-[11px]">
              {(['visitor', 'user', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all duration-200 ${
                    userRole === role
                      ? role === 'admin'
                        ? 'bg-[#134e5e] text-white shadow-xs font-bold'
                        : 'bg-[#2b567b] text-white shadow-xs font-bold'
                      : 'text-[#475b72] hover:text-[#1b2634] hover:bg-[#e3ecf5]'
                  }`}
                >
                  {role === 'visitor' ? 'Invitado' : role === 'user' ? 'Registrado' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cabecera Principal con Navegación y Dropdowns Adaptativos */}
      <header className="sticky top-0 z-40 bg-[#fafbfc]/95 backdrop-blur-md border-b border-[#dde3ea] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logotipo y Título de Marca Amable */}
            <button
              onClick={() => onNavigate('welcome')}
              className="flex items-center gap-3 text-left focus:outline-none group"
              aria-label="Ir a página principal de SoftTech Market"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#2b567b] to-[#1c3852] border border-[#5284af] flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                ST
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1b2432] group-hover:text-[#234b70] transition-colors duration-200">
                    SoftTech Market
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e1efe9] text-[#1a533f] border border-[#a2cfbc]">
                    Inclusivo
                  </span>
                </div>
                <p className="text-xs text-[#526377] font-medium hidden sm:block">
                  Tecnología Visual · Cero Fatiga Ocular
                </p>
              </div>
            </button>

            {/* Enlaces Principales de Navegación */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-2 rounded-xl transition-all duration-200 ${
                  currentView === 'catalog'
                    ? 'bg-[#e7eef5] text-[#1b4369] font-bold border border-[#c1d5e7]'
                    : 'text-[#485b70] hover:text-[#1b2533] hover:bg-[#eef3f8]'
                }`}
              >
                Catálogo
              </button>

              {userRole === 'user' && (
                <button
                  onClick={() => onNavigate('order_history')}
                  className={`px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    currentView === 'order_history'
                      ? 'bg-[#e7eef5] text-[#1b4369] font-bold border border-[#c1d5e7]'
                      : 'text-[#485b70] hover:text-[#1b2533] hover:bg-[#eef3f8]'
                  }`}
                >
                  <PackageCheck className="w-4 h-4 text-[#207a5c]" />
                  <span>Mis pedidos</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('contact_support')}
                className={`px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                  currentView === 'contact_support'
                    ? 'bg-[#e7eef5] text-[#1b4369] font-bold border border-[#c1d5e7]'
                    : 'text-[#485b70] hover:text-[#1b2533] hover:bg-[#eef3f8]'
                }`}
              >
                <MessageSquareText className="w-4 h-4 text-[#2b567b]" />
                <span>Soporte Escrito</span>
              </button>

              {/* ROL ADMINISTRADOR: Botón y Menú Desplegable Exclusivo en Teal Mate Amable */}
              {userRole === 'admin' && (
                <div className="relative" ref={adminMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                    aria-expanded={isAdminDropdownOpen}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#134e5e] hover:bg-[#0e3b47] text-white font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-[0.98]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#7de3d5]" />
                    <span>Panel Admin</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#b0ebe2] transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Menú Desplegable del Administrador con Contraste Suavizado */}
                  {isAdminDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#ffffff] border border-[#cce1dc] shadow-xl shadow-[#134e5e]/10 p-2 z-50 text-left text-xs space-y-1 animate-fadeIn"
                      role="menu"
                    >
                      <div className="px-3 py-2 bg-[#f0f8f6] rounded-xl border border-[#d6ede7] mb-1">
                        <div className="flex items-center gap-2 text-[#0f3d49] font-bold">
                          <ShieldCheck className="w-4 h-4 text-[#134e5e]" />
                          <span>Control Administrativo</span>
                        </div>
                        <p className="text-[11px] text-[#4d736d] mt-0.5">
                          Herramientas 100% accesibles y libres de fatiga.
                        </p>
                      </div>

                      <button
                        onClick={() => handleAdminAction('Gestión de Inventario y Precios', 'admin')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#f2f8f6] text-[#1a2d2a] font-medium flex items-center gap-2.5 transition-colors duration-150"
                      >
                        <Boxes className="w-4 h-4 text-[#134e5e]" />
                        <div>
                          <p className="font-semibold text-xs">Inventario & Fichas Técnicas</p>
                          <p className="text-[10px] text-[#5e7773]">Actualizar stock, alertas y precios</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAdminAction('Solicitudes de Bodega', 'admin')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#f2f8f6] text-[#1a2d2a] font-medium flex items-center gap-2.5 transition-colors duration-150"
                      >
                        <Inbox className="w-4 h-4 text-[#134e5e]" />
                        <div>
                          <p className="font-semibold text-xs">Solicitudes a Bodega</p>
                          <p className="text-[10px] text-[#5e7773]">Pedidos especiales de usuarios</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAdminAction('Métricas y Reportes Visuales', 'admin')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#f2f8f6] text-[#1a2d2a] font-medium flex items-center gap-2.5 transition-colors duration-150"
                      >
                        <Sparkles className="w-4 h-4 text-[#134e5e]" />
                        <div>
                          <p className="font-semibold text-xs">Auditoría WCAG & Envíos</p>
                          <p className="text-[10px] text-[#5e7773]">Supervisión de comunicación silenciosa</p>
                        </div>
                      </button>

                      <div className="pt-1.5 border-t border-[#e2ece9] mt-1">
                        <button
                          onClick={() => {
                            setIsAdminDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full py-2 px-3 text-center rounded-xl bg-[#134e5e] hover:bg-[#0e3b47] text-white font-bold text-xs transition-colors duration-200"
                        >
                          Abrir Panel Completo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* 3. Acciones Derecha: Carrito y Menú de Perfil/Acceso */}
            <div className="flex items-center gap-3">
              {/* Botón de Carrito Accesible */}
              <button
                type="button"
                onClick={() => onNavigate('cart')}
                className={`relative p-2.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                  currentView === 'cart'
                    ? 'bg-[#2b567b] text-white border-[#2b567b] shadow-xs font-semibold'
                    : 'bg-[#f0f4f8] border-[#cbd8e5] text-[#243c53] hover:bg-[#e4ebf2]'
                }`}
                aria-label={`Ver cesta de compras, ${cartCount} artículos`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold">Carrito</span>
                {cartCount > 0 && (
                  <span className="cart-count-badge flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[11px] font-bold shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* ROL INVITADO: Botones Ergonómicos de Acceso y Registro */}
              {userRole === 'visitor' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#254d72] hover:bg-[#eaf1f8] border border-[#c7d9e8] transition-all duration-200"
                  >
                    Ingresar
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#2b567b] hover:bg-[#1f4260] text-white shadow-xs transition-all duration-200 active:scale-95"
                  >
                    Registro
                  </button>
                </div>
              ) : (
                /* ROL REGISTRADO O ADMINISTRADOR: Dropdown de Perfil Ergonómico */
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    aria-expanded={isUserDropdownOpen}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#f0f4f8] hover:bg-[#e4ebf2] border border-[#cbd8e5] transition-all duration-200 text-left active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2b567b] to-[#457b9d] text-white font-bold text-xs flex items-center justify-center">
                      {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <div className="hidden sm:block text-xs pr-1">
                      <p className="font-bold text-[#1a2533] truncate max-w-[100px]">
                        {currentUser?.name?.split(' ')[0] || 'Mi Perfil'}
                      </p>
                      <p className="text-[10px] text-[#207a5c] font-semibold">
                        {userRole === 'admin' ? 'Administrador' : 'Verificado Cero Audio'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#55697f]" />
                  </button>

                  {/* Menú Desplegable de Usuario con Fondo Off-White Amable */}
                  {isUserDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#ffffff] border border-[#dde3ea] shadow-xl p-2 z-50 text-left text-xs space-y-1 animate-fadeIn"
                    >
                      <div className="px-3 py-2 bg-[#f4f7fa] rounded-xl border border-[#e2e8f0] mb-1">
                        <p className="font-bold text-[#1b2534] text-xs truncate">
                          {currentUser?.name || 'Usuario Activo'}
                        </p>
                        <p className="text-[11px] text-[#55697f] truncate">
                          {currentUser?.email || 'usuario@softtech.com'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f1f5f9] text-[#223244] font-medium flex items-center gap-2 transition-colors duration-150"
                      >
                        <User className="w-4 h-4 text-[#2b567b]" />
                        <span>Mi Perfil & Preferencias Visuales</span>
                      </button>

                      {userRole === 'user' && (
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onNavigate('order_history');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f1f5f9] text-[#223244] font-medium flex items-center gap-2 transition-colors duration-150"
                        >
                          <PackageCheck className="w-4 h-4 text-[#207a5c]" />
                          <span>Mis pedidos</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('contact_support');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f1f5f9] text-[#223244] font-medium flex items-center gap-2 transition-colors duration-150"
                      >
                        <MessageSquareText className="w-4 h-4 text-[#2b567b]" />
                        <span>Historial de Soporte Silencioso</span>
                      </button>

                      <div className="pt-1.5 border-t border-[#e8edf2] mt-1">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onRoleChange('visitor');
                            showToast({
                              type: 'info',
                              title: 'Sesión Finalizada',
                              message: 'Has cambiado al perfil de Invitado. Explora el catálogo en modo lectura relajada.'
                            });
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#faede8] text-[#7a2c1e] font-semibold flex items-center gap-2 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4 text-[#9c3f2d]" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 4. Banner Sutil y Ergonómico para Perfil Invitado */}
      {userRole === 'visitor' && (
        <div className="bg-[#eef3f7] border-b border-[#d8e3ed] px-4 py-2.5 text-xs text-[#2b4d6e]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2b567b]" />
              <p>
                <strong>Modo Invitado Activo:</strong> Puedes revisar fichas técnicas con cero audio. Para comprar y rastrear despachos,{' '}
                <button 
                  onClick={() => onNavigate('register')}
                  className="underline font-bold text-[#1b3d5e] hover:text-[#0f2842]"
                >
                  crea tu cuenta gratuita
                </button>.
              </p>
            </div>
            <button
              onClick={() => onNavigate('accessibility')}
              className="text-[11px] font-semibold text-[#25527a] hover:underline shrink-0"
            >
              Configurar Accesibilidad
            </button>
          </div>
        </div>
      )}

      {/* 5. Área Central de Contenido */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* 6. Pie de Página Ergonómico */}
      <footer className="bg-[#e9edf2] border-t border-[#d8e0e8] text-[#526377] text-xs py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SoftTech Market Inclusive Access · Plataforma Libre de Fatiga Visual y Barreras de Audio.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#1a533f] font-semibold">Conforme WCAG 2.1 AAA</span>
            <button 
              onClick={() => onNavigate('contact_support')}
              className="hover:text-[#1b2533] underline"
            >
              Atención 100% Escrita
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
