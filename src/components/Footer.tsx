import { ActiveView, UserRole } from "../types";
import {
  Eye,
  Shield,
  Award,
  MessageSquareText,
  HelpCircle,
  ArrowUp,
} from "lucide-react";

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  userRole: UserRole;
}

export function Footer({ onNavigate, userRole }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="premium-footer-shell text-slate-300 text-sm mt-auto">
      <div className="bg-[#00192e]/70 border-b border-[#003459] py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="premium-footer-card flex items-start gap-3.5 rounded-2xl p-3">
            <div className="p-2.5 rounded-xl bg-[#00e3fd]/15 text-[#00e3fd] shrink-0 border border-[#00e3fd]/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Política 100% Visual
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ninguna función, alerta de compra ni notificación depende de
                pitidos o avisos acústicos. Toda la experiencia se basa en
                señales ópticas.
              </p>
            </div>
          </div>

          <div className="premium-footer-card flex items-start gap-3.5 rounded-2xl p-3">
            <div className="p-2.5 rounded-xl bg-[#34a273]/15 text-[#34a273] shrink-0 border border-[#34a273]/30">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Atención por Escrito y Señas
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Despachadores y asesores capacitados en lengua de señas y
                canales de mensajería escrita con confirmación de lectura en
                tiempo real.
              </p>
            </div>
          </div>

          <div className="premium-footer-card flex items-start gap-3.5 rounded-2xl p-3">
            <div className="p-2.5 rounded-xl bg-[#ffc038]/15 text-[#ffc038] shrink-0 border border-[#ffc038]/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Certificación WCAG 2.1 AAA
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ratios de contraste superiores a 7:1, tipografías escalables sin
                distorsión y diseño adaptable a cualquier resolución de
                pantalla.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#002b49] border border-[#00e3fd] flex items-center justify-center font-black text-[#00e3fd] text-sm">
                ST
              </div>
              <span className="font-bold text-white text-base">
                SoftTech Market
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de comercio de tecnología orientada a la inclusión
              sensorial total para personas con sordera e hipoacusia.
            </p>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded bg-[#00243e] border border-slate-700 text-[11px] font-medium text-slate-300">
                Versión 2.4 · Entorno Simulado
              </span>
            </div>
          </div>

          {/* Col 2: Navegación de Catálogo */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 text-[#00e3fd]">
              Explorar Tienda
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("catalog")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("product_detail")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Ficha Técnica CUD008 (Ultrabook Pro)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("cart")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Carrito de Compras
                </button>
              </li>
              {userRole === "user" && (
                <li>
                  <button
                    onClick={() => onNavigate("order_history")}
                    className="hover:text-[#00e3fd] transition-colors"
                  >
                    Mis pedidos
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Gestión de Usuario & Admin */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 text-[#00e3fd]">
              Gestión & Cuenta
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("admin_login")}
                  className="text-[#ffc038] hover:underline font-medium"
                >
                  Iniciar sesión (el rol se asigna por cuenta)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("catalog")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Explorar Catálogo sin iniciar sesión
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("forgot_password")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Recuperación Visual (CUD003)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("profile")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Perfil de Usuario (CUD004)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("admin")}
                  className="text-[#ffc038] hover:underline font-medium"
                >
                  Panel de Administración
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Asistencia & Accesibilidad */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 text-[#00e3fd]">
              Accesibilidad & Ayuda
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("accessibility")}
                  className="hover:text-[#00e3fd] transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#00e3fd]" />
                  <span>Centro de Accesibilidad Sensorial</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("contact_support")}
                  className="hover:text-[#00e3fd] transition-colors flex items-center gap-1.5"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Contacto & Soporte Escrito Directo</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("accessibility")}
                  className="hover:text-[#00e3fd] transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Glosario Tecnológico Visual Cero Audio</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("catalog")}
                  className="hover:text-[#00e3fd] transition-colors"
                >
                  Catálogo principal visual
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[#002744] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 SoftTech Market Inclusive Access. Todos los derechos
            reservados. Diseñado para equidad sensorial.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              Entorno 100% Protegido
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#00e3fd] hover:text-white transition-colors"
            >
              <span>Subir</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
