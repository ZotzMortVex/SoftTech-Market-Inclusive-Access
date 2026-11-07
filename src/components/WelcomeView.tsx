import { ActiveView, UserRole } from "../types";
import { ShieldCheck, ArrowRight, Sparkles, AlertOctagon } from "lucide-react";
import { TechEcommerceBackgroundBanner } from "./TechEcommerceBackgroundBanner";

interface WelcomeViewProps {
  onNavigate: (view: ActiveView) => void;
  userRole: UserRole;
  showRegistrationNotice: boolean;
}

export function WelcomeView({
  onNavigate,
  userRole,
  showRegistrationNotice,
}: WelcomeViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {showRegistrationNotice && (
        <div className="home-registration-notice rounded-2xl border-2 p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="home-registration-notice-icon p-2.5 rounded-xl shrink-0 font-bold">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="home-registration-notice-eyebrow text-xs font-bold uppercase tracking-wider block">
                  Directiva de Seguridad
                </span>
                <h2 className="home-registration-notice-title text-base sm:text-lg font-extrabold">
                  REGISTRO COMO USUARIO SoftTech Market OBLIGATORIO.
                </h2>
                <p className="home-registration-notice-description text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                  Como visitante, puede explorar e interactuar libremente con
                  nuestro catálogo de productos. Sin embargo, para añadir
                  productos al carrito y realizar pedidos, es necesario
                  registrarse e iniciar sesión.
                </p>
                <p className="home-registration-notice-description mt-2 max-w-3xl text-xs leading-relaxed sm:text-sm">
                  Por ello, le invitamos a completar su registro para acceder a
                  nuestros servicios. ¡Gracias por confiar en nosotros!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              {userRole === "visitor" ? (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate("login")}
                    className="home-registration-notice-login px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e3fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729]"
                  >
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate("register")}
                    className="home-registration-notice-register px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e3fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729]"
                  >
                    <span>Crear Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="home-registration-notice-account px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Cuenta{" "}
                    {userRole === "admin" ? "Administrador" : "Verificada"}{" "}
                    Activa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Visual Sign Language Avatar */}
      <div className="soft-hero-panel rounded-[2rem] border border-[#004775]/90 p-3 sm:p-4 lg:p-5 relative isolate overflow-hidden">
        <TechEcommerceBackgroundBanner className="rounded-[2rem]" opacity={0.08} />
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#00e3fd]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#34a273]/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center relative z-10">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-3 text-center">
            <div className="premium-chip mx-auto">
              <Sparkles className="w-4 h-4 text-[#00e3fd]" />
              <span>
                Interacción Accesible para la comunidad con discapacidad
                auditiva · 100% Cero Audio.
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.04em] text-white leading-tight">
              Bienvenido a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#eafcff] via-[#bfeaf8] to-[#d6f6e1]">
                SoftTech Market
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Diseñada desde su concepción para la comunidad con discapacidad
              auditiva e hipoacusia. Aquí no existen llamadas de validación
              telefónica ni sonidos de confirmación: interactúas mediante{" "}
              <strong className="text-white">señales luminosas</strong>,{" "}
              <strong className="text-white">
                canales de texto verificados
              </strong>{" "}
              y{" "}
              <strong className="text-white">
                catálogo tecnológico certificado
              </strong>
              .
            </p>

          </div>

          {/* Right Column: Visual Avatar in Sign Language (Stitch Screen 1 Concept) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-xs rounded-3xl bg-[#001e36] border-2 border-[#005085] p-3 shadow-xl relative text-center">
              {/* Badge Sign Language */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <span>BIENVENIDA</span>
              </div>

              {/* Avatar Graphic Illustration with Sign Greeting */}
              <div className="mt-3 mb-3 relative mx-auto aspect-square w-full max-w-48 rounded-2xl bg-gradient-to-b from-[#003459] to-[#001a30] border-2 border-[#00e3fd]/60 p-3 flex flex-col items-center justify-center overflow-hidden">
                {import.meta.env.VITE_LSC_WELCOME_VIDEO ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={import.meta.env.VITE_LSC_WELCOME_VIDEO}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label="Saludo de bienvenida en Lengua de Señas"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-[#00e3fd] bg-[#002847] shadow-inner"
                    role="img"
                    aria-label="Mano animada saludando: hola y bienvenido"
                  >
                    <span className="animate-sign-welcome-wave text-6xl">
                      👋
                    </span>
                  </div>
                )}
                <span className="relative mt-3 rounded bg-[#000e1b] px-2 py-1 text-center font-mono text-xs font-bold text-[#00e3fd]">
                  HOLA · BIENVENIDO A SOFTTECH MARKET INCLUSIVE ACCESS
                </span>
              </div>

              <div className="text-left space-y-1.5 bg-[#001426] p-3 rounded-xl border border-[#002f52]">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34a273]" />
                  <span>Asistente Visual Disponible</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {userRole === "visitor"
                    ? "Nuestro soporte atiende por texto. Regístrate para recibir soporte y resolveremos tus dudas."
                    : "Nuestro soporte atiende por texto. Si tienes dudas, no dudes en consultarnos."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(userRole === "visitor" ? "register" : "support")
                  }
                  className="w-full mt-1.5 py-2 rounded-xl premium-cta-secondary font-semibold text-xs border border-[#00528a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e3fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001e36]"
                >
                  {userRole === "visitor"
                    ? "Registrarme para recibir soporte"
                    : "Tengo una consulta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
