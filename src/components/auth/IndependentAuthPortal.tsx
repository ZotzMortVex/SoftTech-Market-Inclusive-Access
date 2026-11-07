import React, { useState } from "react";
import { UserAccount } from "../../types";
import type { RegisterAccountInput } from "../../utils/authApi";
import {
  requestPasswordReset,
  resetPassword,
} from "../../utils/authApi";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  KeyRound,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface IndependentAuthPortalProps {
  onLogin: (
    email: string,
    password: string,
  ) => Promise<UserAccount>;
  onContinueAsGuest: () => void;
  onTriggerFlash: () => void;
  onRegister: (account: RegisterAccountInput) => Promise<UserAccount>;
  initialTab?: "user" | "register" | "forgot";
}

export function IndependentAuthPortal({
  onLogin,
  onContinueAsGuest,
  onTriggerFlash,
  onRegister,
  initialTab = "user",
}: IndependentAuthPortalProps) {
  const { showToast } = useToast();

  const resetTokenFromUrl = new URLSearchParams(window.location.search).get(
    "passwordResetToken",
  );
  const [activeTab, setActiveTab] = useState<"user" | "register" | "forgot">(
    resetTokenFromUrl ? "forgot" : initialTab,
  );

  // Formulario Usuario Registrado
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Formulario Registro de Nuevo Usuario
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState(resetTokenFromUrl ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Estado de error ergonómico (sin colores estridentes)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = userEmail.trim().toLowerCase();

    if (!cleanEmail || !userPassword) {
      setErrorMessage(
        "Por favor, completa tu correo electrónico y contraseña.",
      );
      onTriggerFlash();
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await onLogin(cleanEmail, userPassword);
      showToast({
        type: "success",
        title: "Bienvenido de nuevo",
        message: `Hola ${user.name}. Acceso verificado con protocolo 100% visual y cero audio.`,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
      onTriggerFlash();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage(
        "Por favor diligencia todos los campos requeridos para tu registro.",
      );
      onTriggerFlash();
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(
        "Las contraseñas escritas no coinciden. Por favor revísalas con calma.",
      );
      onTriggerFlash();
      return;
    }

    if (regPassword.length < 8 || regPassword.length > 128) {
      setErrorMessage("La contraseña debe tener entre 8 y 128 caracteres.");
      onTriggerFlash();
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await onRegister({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPassword,
      });

      showToast({
        type: "success",
        title: "Registro Completado con Éxito",
        message: `¡Cuenta creada para ${newUser.name}! Tu canal de atención sin llamadas está configurado.`,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro. Inténtalo de nuevo.",
      );
      onTriggerFlash();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecoveryNotice(null);
    setIsSubmitting(true);
    try {
      await requestPasswordReset(recoveryEmail.trim().toLowerCase());
      setRecoveryNotice(
        "Si el correo corresponde a una cuenta activa, recibirás un enlace para restablecer tu contraseña.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo solicitar el restablecimiento de contraseña.",
      );
      onTriggerFlash();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      onTriggerFlash();
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(recoveryToken, newPassword);
      const resetUrl = new URL(window.location.href);
      resetUrl.searchParams.delete("passwordResetToken");
      window.history.replaceState(
        {},
        "",
        `${resetUrl.pathname}${resetUrl.search}${resetUrl.hash}`,
      );
      setRecoveryToken("");
      setActiveTab("user");
      showToast({
        type: "success",
        title: "Contraseña actualizada",
        message: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo restablecer la contraseña.",
      );
      onTriggerFlash();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="independent-auth-portal min-h-screen w-full bg-[#f4f6f8] text-[#1b2432] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#cfe1f0] selection:text-[#10304f]">
      {/* 1. Barra Superior Discreta de Certificación Accesible */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 text-xs text-[#526377]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#207a5c] animate-pulse" />
          <span className="font-semibold text-[#164e3b]">
            Portal de Acceso Inclusivo · Cero Audio
          </span>
        </div>
        <span className="hidden sm:inline text-[#65788d]">
          Diseño conforme a pautas WCAG 2.1 AAA
        </span>
      </div>

      {/* 2. Contenedor Central Espacioso y Limpio */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        {/* Cabecera y Marca Ergonómica */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2b567b] text-white shadow-sm font-black text-2xl tracking-tighter mx-auto border border-[#487ea8]">
            ST
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#192330] tracking-tight">
              SoftTech Market Inclusive Access
            </h1>
            <p className="text-xs sm:text-sm text-[#55697f] max-w-md mx-auto mt-1 leading-relaxed">
              Plataforma de comercio tecnológico diseñada con cero barreras de
              audio y total descanso visual para jornadas prolongadas.
            </p>
          </div>
        </div>

        {/* Tarjeta Principal de Autenticación con Fondo Suave */}
        <div className="rounded-3xl bg-white border border-[#dde3ea] shadow-lg shadow-black/5 p-6 sm:p-10 text-left space-y-6">
          {/* OPCIÓN 1 VISUAL: Continuar como Invitado (Botón Destacado pero Relajante) */}
          <div className="p-4 rounded-2xl bg-[#f0f4f8] border border-[#cbd8e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#244f77] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Exploración Libre
              </span>
              <p className="text-sm font-bold text-[#1b2533]">
                ¿Solo deseas consultar el catálogo?
              </p>
              <p className="text-xs text-[#526377]">
                Ingresa de inmediato sin credenciales ni formularios.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onTriggerFlash();
                onContinueAsGuest();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#e3ecf5] hover:bg-[#d4e2ef] text-[#1a4167] font-bold text-xs sm:text-sm border border-[#b8cee2] transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <span>Continuar como Invitado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Inicio de sesión único y registro de cuenta */}
          <div className="border-b border-[#e5ebf1] pb-3">
            <div className="flex items-center gap-2 bg-[#f4f7fa] p-1.5 rounded-2xl border border-[#dde4ec]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("user");
                  setErrorMessage(null);
                  onTriggerFlash();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "user"
                    ? "bg-white text-[#1b2432] shadow-xs border border-[#dde3ea]"
                    : "text-[#586b80] hover:text-[#1b2432]"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Iniciar sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMessage(null);
                  onTriggerFlash();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "register"
                    ? "bg-white text-[#1b2432] shadow-xs border border-[#dde3ea]"
                    : "text-[#586b80] hover:text-[#1b2432]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#207a5c]" />
                <span>Crear cuenta</span>
              </button>
            </div>
          </div>

          {/* BANNER DE ERROR ERGONÓMICO (Paleta Melocotón/Terracota Suave - Cero Neón) */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-[#faeae4] border border-[#e6b9ac] flex items-start gap-3 text-[#5d2317] animate-fadeIn"
            >
              <AlertTriangle className="w-5 h-5 text-[#9c3f2d] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs sm:text-sm">
                <strong className="block font-bold">
                  Aviso de Validación Escrito:
                </strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* OPCIÓN 2 VISUAL: Formulario de Usuario Registrado */}
          {activeTab === "user" && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                  Correo Electrónico:
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#6c8095] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="ejemplo@usuario.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm placeholder-[#7c90a4] focus:outline-none focus:ring-2 focus:ring-[#2b567b] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#6c8095] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showUserPassword ? "text" : "password"}
                    required
                    maxLength={128}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm placeholder-[#7c90a4] focus:outline-none focus:ring-2 focus:ring-[#2b567b] focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#5e7389] hover:text-[#1b2432] rounded-lg"
                    aria-label={
                      showUserPassword ? "Ocultar contraseña" : "Ver contraseña"
                    }
                  >
                    {showUserPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(userEmail);
                    setRecoveryNotice(null);
                    setErrorMessage(null);
                    setActiveTab("forgot");
                  }}
                  className="text-sm font-semibold text-[#00536b] underline underline-offset-2 hover:text-[#003d50]"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="portal-auth-primary-action w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{isSubmitting ? "Verificando…" : "Iniciar sesión"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === "forgot" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#1b2432]">
                  Restablecer contraseña
                </h2>
                <p className="mt-1 text-sm text-[#526377]">
                  Te enviaremos por correo un enlace seguro que vence en 30 minutos.
                </p>
              </div>
              {recoveryNotice && (
                <p role="status" className="rounded-xl border border-emerald-700 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
                  {recoveryNotice}
                </p>
              )}
              {!recoveryToken ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <label className="block text-sm font-bold text-[#1b2432]">
                    Correo electrónico registrado
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={recoveryEmail}
                      onChange={(event) => setRecoveryEmail(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#cfdbe5] bg-white px-4 py-3 text-[#1b2432]"
                    />
                  </label>
                  <button type="submit" disabled={isSubmitting} className="portal-auth-primary-action w-full rounded-xl px-6 py-3.5 font-bold text-sm">
                    {isSubmitting ? "Enviando…" : "Enviar enlace de recuperación"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <label className="block text-sm font-bold text-[#1b2432]">
                    Nueva contraseña
                    <input
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#cfdbe5] bg-white px-4 py-3 text-[#1b2432]"
                    />
                  </label>
                  <label className="block text-sm font-bold text-[#1b2432]">
                    Confirmar nueva contraseña
                    <input
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#cfdbe5] bg-white px-4 py-3 text-[#1b2432]"
                    />
                  </label>
                  <button type="submit" disabled={isSubmitting} className="portal-auth-primary-action w-full rounded-xl px-6 py-3.5 font-bold text-sm">
                    {isSubmitting ? "Actualizando…" : "Guardar nueva contraseña"}
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("user");
                  setErrorMessage(null);
                }}
                className="text-sm font-semibold text-[#00536b] underline underline-offset-2"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* OPCIÓN 4 VISUAL: Formulario de Registro para Nuevos Usuarios */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full px-4 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#207a5c] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                    Teléfono Móvil (SMS Visual):
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full px-4 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#207a5c] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#207a5c] transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                    Contraseña:
                  </label>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={128}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#207a5c] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1.5">
                    Confirmar Contraseña:
                  </label>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full px-4 py-3 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#207a5c] transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="portal-auth-primary-action w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{isSubmitting ? "Creando cuenta…" : "Crear cuenta"}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Pie de Página del Portal Independiente */}
      <div className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-[#6e8094]">
        <p>
          © 2026 SoftTech Market Inclusive Access · Acceso Universal sin
          Barreras de Audio ni Estrés Ocular.
        </p>
      </div>
    </div>
  );
}
