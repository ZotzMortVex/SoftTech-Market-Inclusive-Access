import React, { useState, useEffect } from 'react';
import { ActiveView, UserRole, UserAccount } from '../types';
import type { RegisterAccountInput } from '../utils/authApi';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Sliders, 
  LogOut,
  AlertTriangle,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';

interface AuthViewsProps {
  initialTab?: 'register' | 'login' | 'forgot_password' | 'profile';
  currentUser: UserAccount | null;
  userRole: UserRole;
  onLogin: (email: string, password: string) => Promise<UserAccount>;
  onLogout: () => void;
  onRegister: (account: RegisterAccountInput) => Promise<UserAccount>;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onNavigate: (view: ActiveView) => void;
  onTriggerFlash: () => void;
}

export function AuthViews({
  initialTab = 'login',
  currentUser,
  userRole,
  onLogin,
  onLogout,
  onRegister,
  onUpdateUser,
  onNavigate,
  onTriggerFlash
}: AuthViewsProps) {
  const [currentTab, setCurrentTab] = useState<'register' | 'login' | 'forgot_password' | 'profile'>(initialTab);

  // Sync initial tab if changed from parent
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  // If user clicks on profile while in visitor mode, guide them to login
  useEffect(() => {
    if (currentTab === 'profile' && !currentUser) {
      // Stay on profile to show visitor state or switch to login
    }
  }, [currentTab, currentUser]);

  // Form states - Registration (CUD001)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPass, setRegShowPass] = useState(false);
  const [regErrors, setRegErrors] = useState<string[]>([]);
  const [regSuccessNotice, setRegSuccessNotice] = useState<string | null>(null);

  // Form states - Login (CUD002)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginErrors, setLoginErrors] = useState<string[]>([]);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<{
    userName: string;
    role: UserRole;
  } | null>(null);

  // Form states - Forgot Password (CUD003)
  const [recoveryTarget, setRecoveryTarget] = useState('');
  const [recoveryChannel, setRecoveryChannel] = useState<'sms' | 'email'>('email');
  const [recoveryErrors, setRecoveryErrors] = useState<string[]>([]);
  const [generatedVisualCode, setGeneratedVisualCode] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [recoverySuccessNotice, setRecoverySuccessNotice] = useState<string | null>(null);

  // Form states - Profile Editing (CUD004)
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [prefChannel, setPrefChannel] = useState<'sms_visual' | 'email_escrito' | 'portal'>(
    currentUser?.preferredChannel || 'sms_visual'
  );
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [profileSuccessNotice, setProfileSuccessNotice] = useState<string | null>(null);

  // Update profile fields when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone);
      setPrefChannel(currentUser.preferredChannel);
    }
  }, [currentUser]);

  // Helper: Email validation regex
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Sin ingresar', color: 'bg-slate-700' };
    if (pass.length < 8) return { score: 1, label: 'Corta (mínimo 8)', color: 'bg-[#ff5449]' };
    if (pass.length < 12) {
      return { score: 2, label: 'Aceptable', color: 'bg-[#ffc038]' };
    }
    return { score: 3, label: 'Fuerte y Segura', color: 'bg-emerald-400' };
  };

  const passStrength = getPasswordStrength(regPassword);

  // -------------------------------------------------------------
  // 1. REGISTRO DE USUARIOS CON VALIDACIONES ESTRICTAS
  // -------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors([]);
    setRegSuccessNotice(null);

    const errors: string[] = [];

    // Validación 1: Campos obligatorios
    if (!regName.trim()) {
      errors.push('El Nombre Completo es obligatorio.');
    }
    if (!regEmail.trim()) {
      errors.push('El Correo Electrónico es obligatorio.');
    }
    if (!regPassword) {
      errors.push('La Contraseña es obligatoria.');
    }
    if (!regConfirmPassword) {
      errors.push('Debes confirmar la contraseña.');
    }

    // Validación 2: Formato correcto del correo
    if (regEmail.trim() && !isValidEmail(regEmail)) {
      errors.push('El Correo Electrónico no tiene un formato válido (ejemplo: usuario@correo.com).');
    }

    // Validación 3: La política se comprueba también en el backend.
    if (regPassword && (regPassword.length < 8 || regPassword.length > 128)) {
      errors.push('La contraseña debe contener entre 8 y 128 caracteres.');
    }

    // Validación 4: Contraseñas iguales
    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      errors.push('Las contraseñas no coinciden. Asegúrate de escribirlas idénticas.');
    }

    if (errors.length > 0) {
      setRegErrors(errors);
      onTriggerFlash();
      return;
    }

    try {
      await onRegister({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPassword,
      });
      onTriggerFlash();
    } catch (error) {
      setRegErrors([
        error instanceof Error
          ? error.message
          : 'No se pudo completar el registro. Inténtalo de nuevo.',
      ]);
      onTriggerFlash();
    }
  };

  // -------------------------------------------------------------
  // 2. INICIO DE SESIÓN CON VALIDACIONES Y DIFERENCIACIÓN DE ROLES
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors([]);
    setLoginSuccessNotice(null);

    const errors: string[] = [];

    if (!loginEmail.trim()) {
      errors.push('Ingresa tu correo electrónico registrado.');
    } else if (!isValidEmail(loginEmail)) {
      errors.push('El formato del correo electrónico ingresado no es válido.');
    }

    if (!loginPassword) {
      errors.push('Ingresa tu contraseña.');
    }

    if (errors.length > 0) {
      setLoginErrors(errors);
      onTriggerFlash();
      return;
    }

    try {
      const user = await onLogin(
        loginEmail.trim().toLowerCase(),
        loginPassword,
      );
      onTriggerFlash();
      setLoginSuccessNotice({ userName: user.name, role: user.role });
    } catch (error) {
      setLoginErrors([
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      ]);
      onTriggerFlash();
    }
  };

  // -------------------------------------------------------------
  // 3. RECUPERACIÓN DE CONTRASEÑA SIMULADA (CUD003)
  // -------------------------------------------------------------
  const handleGenerateRecoveryCode = () => {
    setRecoveryErrors([]);
    setRecoverySuccessNotice(null);
    setGeneratedVisualCode(null);
    setCodeVerified(false);
    setRecoveryErrors([
      'La recuperación de contraseña aún no está configurada. Contacta a soporte escrito para recuperar el acceso.',
    ]);
    onTriggerFlash();
  };

  const handleConfirmNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryErrors([
      'La recuperación de contraseña aún no está configurada. Contacta a soporte escrito para recuperar el acceso.',
    ]);
    onTriggerFlash();
  };

  // -------------------------------------------------------------
  // 4. EDICIÓN DE PERFIL DE USUARIO (CUD004)
  // -------------------------------------------------------------
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors([]);
    setProfileSuccessNotice(null);

    if (!currentUser) return;

    if (!profileName.trim()) {
      setProfileErrors(['El nombre no puede estar vacío.']);
      onTriggerFlash();
      return;
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      name: profileName.trim(),
      phone: profilePhone.trim(),
      preferredChannel: prefChannel
    };

    onUpdateUser(updatedUser);
    onTriggerFlash();
    setProfileSuccessNotice('✓ Ficha de perfil actualizada exitosamente en los datos simulados.');

    setTimeout(() => {
      setProfileSuccessNotice(null);
    }, 4000);
  };

  return (
    <div className="auth-views max-w-3xl mx-auto space-y-8 animate-fadeIn pb-16 text-left">
      {/* Tab Navigation Header (CUD001 al CUD004) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#001c33] border-2 border-[#00426b] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00e3fd]">
              Módulo de Autenticación Simulada · SoftTech Market
            </span>
            <h1 className="text-2xl font-black text-white mt-0.5">
              Identidad & Acceso Inclusivo
            </h1>
          </div>

          {/* User state badge */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                userRole === 'admin'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              }`}>
                {userRole === 'admin' ? '🛡️ Administrador' : '👤 Cliente Registrado'}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#001426] text-slate-300 border border-[#003860]">
                👁️ Visitante (Solo Lectura)
              </span>
            )}
          </div>
        </div>

        {/* 4 Tabs Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-[#00355c] pt-4">
          <button
            type="button"
            onClick={() => {
              onNavigate('register');
              onTriggerFlash();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              currentTab === 'register'
                ? 'bg-[#00e3fd] text-[#001629] shadow-md border-2 border-[#00e3fd]'
                : 'bg-[#001426] text-slate-300 hover:bg-[#002847] hover:text-white border border-[#002f52]'
            }`}
          >
            Registro de Usuarios
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('login');
              onTriggerFlash();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              currentTab === 'login'
                ? 'bg-[#00e3fd] text-[#001629] shadow-md border-2 border-[#00e3fd]'
                : 'bg-[#001426] text-slate-300 hover:bg-[#002847] hover:text-white border border-[#002f52]'
            }`}
          >
            Inicio de Sesión
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('forgot_password');
              onTriggerFlash();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              currentTab === 'forgot_password'
                ? 'bg-[#00e3fd] text-[#001629] shadow-md border-2 border-[#00e3fd]'
                : 'bg-[#001426] text-slate-300 hover:bg-[#002847] hover:text-white border border-[#002f52]'
            }`}
          >
            Recuperar Clave
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab('profile');
              onTriggerFlash();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              currentTab === 'profile'
                ? 'bg-[#00e3fd] text-[#001629] shadow-md border-2 border-[#00e3fd]'
                : 'bg-[#001426] text-slate-300 hover:bg-[#002847] hover:text-white border border-[#002f52]'
            }`}
          >
            Perfil de Usuario
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: REGISTRO DE USUARIOS CON VALIDACIONES                   */}
      {/* ============================================================== */}
      {currentTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#003860] pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#00e3fd]" />
              <span>Registro de Nuevo Usuario Cliente</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Crea tu perfil con validación de datos para habilitar el carrito de compras y pedidos simulados.
            </p>
          </div>

          {/* Mensajes de Error Visuales */}
          {regErrors.length > 0 && (
            <div 
              role="alert" 
              className="p-4 rounded-2xl bg-[#290d10] border-2 border-[#ff5449] text-white space-y-2 animate-shake"
            >
              <div className="flex items-center gap-2 text-[#ff5449] font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Por favor corrige los siguientes campos:</span>
              </div>
              <ul className="text-xs space-y-1 list-disc list-inside text-slate-200">
                {regErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mensaje de Confirmación Visual */}
          {regSuccessNotice && (
            <div 
              role="status"
              data-notification-type="success"
              className="app-visual-notification p-4 rounded-2xl bg-[#0b291a] border-2 border-emerald-400 text-white space-y-1 animate-fadeIn"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Registro Completado con Éxito</span>
              </div>
              <p className="text-xs text-slate-200">{regSuccessNotice}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Nombre Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Nombre Completo: <span className="text-[#ff5449]">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Obligatorio</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej. Roberto Martínez Vega"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Correo Electrónico */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Correo Electrónico: <span className="text-[#ff5449]">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">No duplicado</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="roberto@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                />
              </div>
            </div>

            {/* Teléfono opcional para alertas SMS visuales */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Teléfono Móvil (Para confirmación por SMS visual):
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Garantía Cero Audio: SoftTech nunca realizará llamadas por voz.
              </span>
            </div>

            {/* 3. Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Contraseña: <span className="text-[#ff5449]">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">8 a 128 caracteres</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={regShowPass ? 'text' : 'password'}
                  minLength={8}
                  maxLength={128}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setRegShowPass(!regShowPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label={regShowPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {regShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Indicador visual de longitud y fuerza */}
              {regPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Fortaleza Visual:</span>
                    <span className="font-bold text-white">{passStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#00101f] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passStrength.color}`} 
                      style={{ width: `${(passStrength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Confirmación de Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Confirmar Contraseña: <span className="text-[#ff5449]">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Debe coincidir</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  minLength={8}
                  maxLength={128}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña exactamente"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="auth-primary-action w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Registrar Usuario y Activar Sesión</span>
          </button>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 2: INICIO DE SESIÓN CON DIFERENCIACIÓN DE ROLES            */}
      {/* ============================================================== */}
      {currentTab === 'login' && (
        <div className="space-y-6">
          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-[#003860] pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#00e3fd]" />
                <span>Inicio de Sesión</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Ingresa con tu correo registrado y contraseña para realizar compras y gestionar pedidos.
              </p>
            </div>

            {/* Mensajes de Error Visuales */}
            {loginErrors.length > 0 && (
              <div 
                role="alert" 
                className="auth-login-error p-4 rounded-2xl border-2 space-y-2 animate-shake"
              >
                <div className="auth-login-error-title flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Aviso de Acceso</span>
                </div>
                <ul className="auth-login-error-messages text-xs space-y-1 list-disc list-inside">
                  {loginErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mensaje de Confirmación Visual de Inicio de Sesión */}
            {loginSuccessNotice && (
              <div 
                role="status"
                data-notification-type="success"
                className={`app-visual-notification p-4 rounded-2xl border-2 space-y-3 animate-fadeIn ${
                  loginSuccessNotice.role === 'admin'
                    ? 'bg-[#211702] border-[#ffc038]'
                    : 'bg-[#0b291a] border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${loginSuccessNotice.role === 'admin' ? 'text-[#ffc038]' : 'text-emerald-400'}`} />
                  <span>
                    {loginSuccessNotice.role === 'admin'
                      ? 'Acceso Concedido: Administrador de Plataforma'
                      : 'Acceso Concedido: Usuario Cliente Registrado'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-200 leading-relaxed">
                  Bienvenido(a), <strong className="text-white">{loginSuccessNotice.userName}</strong>. Tu sesión se ha guardado localmente.
                  {loginSuccessNotice.role === 'admin'
                    ? ' Tienes control total para gestionar inventario, usuarios y pedidos.'
                    : ' Tienes acceso al catálogo completo, agregar al carrito y pedidos simulados.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {loginSuccessNotice.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('admin')}
                      className="px-4 py-2 rounded-xl bg-[#ffc038] hover:bg-[#ffd166] text-[#001629] font-bold text-xs transition-colors"
                    >
                      Ir al Panel Administrativo ➜
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('catalog')}
                      className="px-4 py-2 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-bold text-xs transition-colors"
                    >
                      Explorar Catálogo Tecnológico ➜
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCurrentTab('profile')}
                    className="px-4 py-2 rounded-xl bg-[#002f52] hover:bg-[#003d6b] text-white font-semibold text-xs border border-[#004e80]"
                  >
                    Ver Mi Perfil
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Correo Electrónico:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="usuario@softtechmarket.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">
                    Contraseña:
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot_password')}
                    className="text-xs text-[#00e3fd] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={loginShowPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Contraseña registrada"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setLoginShowPass(!loginShowPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    aria-label={loginShowPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {loginShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-action w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Ingresar al Portal Inclusivo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: RECUPERACIÓN DE CONTRASEÑA SIMULADA                     */}
      {/* ============================================================== */}
      {currentTab === 'forgot_password' && (
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#003860] pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#00e3fd]" />
              <span>Recuperación de Contraseña</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Esta función no está habilitada todavía; no generaremos códigos ni cambiaremos contraseñas sin verificar la identidad.
            </p>
          </div>

          {/* Mensajes de Error Visuales */}
          {recoveryErrors.length > 0 && (
            <div 
              role="alert" 
              className="p-4 rounded-2xl bg-[#290d10] border-2 border-[#ff5449] text-white space-y-2 animate-shake"
            >
              <div className="flex items-center gap-2 text-[#ff5449] font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Atención:</span>
              </div>
              <ul className="text-xs space-y-1 list-disc list-inside text-slate-200">
                {recoveryErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mensaje de Confirmación Visual de Recuperación */}
          {recoverySuccessNotice && (
            <div 
              role="status"
              data-notification-type="success"
              className="app-visual-notification p-4 rounded-2xl bg-[#0b291a] border-2 border-emerald-400 text-white space-y-3 animate-fadeIn"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Clave Restablecida</span>
              </div>
              <p className="text-xs text-slate-200">{recoverySuccessNotice}</p>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-xl bg-[#00e3fd] text-[#001629] font-bold text-xs shadow-md"
                >
                  Ir al Inicio de Sesión
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Mensaje Informativo Garantía Cero Audio */}
            <div className="p-3.5 rounded-2xl bg-[#001426] border border-[#003860] text-xs text-slate-300 space-y-1">
              <span className="font-bold text-[#00e3fd] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#00e3fd]" />
                Nota de Seguridad Inclusiva:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                La recuperación de acceso requerirá verificar la cuenta por un canal escrito configurado.
              </p>
            </div>

            {/* Canal Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Medio escrito para recibir el código de validación:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecoveryChannel('email')}
                  aria-pressed={recoveryChannel === 'email'}
                  className={`auth-recovery-channel p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    recoveryChannel === 'email'
                      ? 'bg-[#002f52] border-[#00e3fd] text-white shadow-md'
                      : 'bg-[#001426] border-[#002f52] text-slate-400'
                  }`}
                >
                  <Mail className="w-4 h-4 text-[#00e3fd] mb-1" />
                  Correo Electrónico Escrito
                </button>

                <button
                  type="button"
                  onClick={() => setRecoveryChannel('sms')}
                  aria-pressed={recoveryChannel === 'sms'}
                  className={`auth-recovery-channel p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    recoveryChannel === 'sms'
                      ? 'bg-[#002f52] border-[#00e3fd] text-white shadow-md'
                      : 'bg-[#001426] border-[#002f52] text-slate-400'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-400 mb-1" />
                  SMS Visual al Móvil
                </button>
              </div>
            </div>

            {/* Input target */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {recoveryChannel === 'email' ? 'Correo Electrónico Registrado:' : 'Número Telefónico Registrado:'}
              </label>
              <input
                type="text"
                value={recoveryTarget}
                onChange={(e) => setRecoveryTarget(e.target.value)}
                placeholder={recoveryChannel === 'email' ? 'usuario@ejemplo.com' : '+52 55 9876 5432'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
              />
            </div>

            {/* Emitir Código */}
            {!generatedVisualCode ? (
              <button
                type="button"
                onClick={handleGenerateRecoveryCode}
                className="auth-primary-action w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Consultar recuperación de contraseña
              </button>
            ) : (
              /* High-contrast Visual Code Box */
              <div className="p-6 rounded-2xl bg-[#00101f] border-2 border-[#00e3fd] text-center space-y-3 animate-fadeIn">
                <span className="text-xs font-bold text-[#00e3fd] uppercase tracking-wider block">
                  Código de Validación Sensorial Generado
                </span>
                
                <div className="inline-block px-6 py-3 rounded-xl bg-[#001d36] border-2 border-emerald-400 font-mono text-3xl font-black text-white tracking-widest shadow-lg">
                  {generatedVisualCode}
                </div>

                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Código proyectado visualmente en pantalla sin emisión de sonidos ni llamadas de voz.
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeVerified(true);
                      onTriggerFlash();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#001629] font-bold text-xs shadow-md"
                  >
                    ✓ Confirmar Código y Crear Nueva Contraseña
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de nueva contraseña tras verificar el código */}
            {codeVerified && (
              <form onSubmit={handleConfirmNewPassword} className="space-y-4 pt-4 border-t border-[#003860] animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Nueva Contraseña (8 a 128 caracteres):
                  </label>
                  <input
                    type="password"
                    minLength={8}
                    maxLength={128}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa nueva contraseña segura"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Confirmar Nueva Contraseña:
                  </label>
                  <input
                    type="password"
                    minLength={8}
                    maxLength={128}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  Guardar Nueva Contraseña Simulada
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PERFIL DE USUARIO Y PREFERENCIAS SENSORIALES            */}
      {/* ============================================================== */}
      {currentTab === 'profile' && (
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
          {!currentUser ? (
            /* Estado cuando el visitante no ha iniciado sesión */
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#001426] border border-[#003860] flex items-center justify-center text-[#ffc038] mx-auto">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Navegando como Visitante</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  Actualmente no tienes una sesión activa. Inicia sesión o regístrate para consultar tu perfil, pedidos y canales de notificación.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-5 py-2.5 rounded-xl bg-[#00e3fd] text-[#001629] font-bold text-xs"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2.5 rounded-xl bg-[#002847] text-white font-semibold text-xs border border-[#00426b]"
                >
                  Crear Cuenta
                </button>
              </div>
            </div>
          ) : (
            /* Ficha Completa del Usuario Registrado / Admin */
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#003860] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00e3fd]">
                    Ficha de Perfil de Usuario
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    {currentUser.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-400 font-bold text-xs">● Cuenta Verificada</span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-600'
                        : 'bg-[#002f52] text-[#00e3fd] border border-[#004e80]'
                    }`}>
                      {currentUser.role === 'admin' ? 'Rol: Administrador' : 'Rol: Cliente'}
                    </span>
                  </div>
                </div>

                {/* Botón de Cierre de Sesión Seguro */}
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onTriggerFlash();
                  }}
                  className="px-4 py-2.5 rounded-xl border-2 border-red-500/60 bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-bold transition-colors flex items-center gap-2 self-start active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Cerrar Sesión Activa</span>
                </button>
              </div>

              {/* Mensajes de Éxito / Error */}
              {profileSuccessNotice && (
                <div 
                  role="status"
                  data-notification-type="success"
                  className="app-visual-notification p-3.5 rounded-xl bg-[#0b291a] border-2 border-emerald-400 text-emerald-200 text-xs font-bold animate-fadeIn"
                >
                  {profileSuccessNotice}
                </div>
              )}

              {profileErrors.length > 0 && (
                <div 
                  role="alert"
                  className="p-3.5 rounded-xl bg-[#290d10] border-2 border-[#ff5449] text-white text-xs space-y-1 animate-shake"
                >
                  {profileErrors.map((err, idx) => (
                    <p key={idx}>{err}</p>
                  ))}
                </div>
              )}

              {/* Formulario Editable del Perfil */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Nombre Editable */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Nombre Completo:
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:border-[#00e3fd] focus:outline-none"
                    />
                  </div>

                  {/* Correo (Informativo / no editable para consistencia) */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Correo Electrónico Registrado:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 rounded-xl bg-[#001121] border border-[#002744] text-slate-400 text-xs cursor-not-allowed"
                    />
                  </div>

                  {/* Teléfono Editable */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Teléfono Móvil (Alertas SMS Visuales):
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:border-[#00e3fd] focus:outline-none"
                    />
                  </div>

                  {/* Fecha de Registro & Pedidos */}
                  <div className="p-3 rounded-xl bg-[#001426] border border-[#002f52] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Fecha de Registro:</span>
                      <span className="text-white font-medium">{currentUser.registeredDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Pedidos Registrados:</span>
                      <span className="text-[#00e3fd] font-bold text-sm">{currentUser.totalOrdersCount} despachos</span>
                    </div>
                  </div>
                </div>

                {/* Preferencias de Canal */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Canal preferido para notificaciones de pedidos y compras:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'sms_visual', label: 'SMS Visual al Móvil' },
                      { id: 'email_escrito', label: 'Correo Electrónico' },
                      { id: 'portal', label: 'Portal SoftTech' },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setPrefChannel(ch.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          prefChannel === ch.id
                            ? 'bg-[#002f52] border-[#00e3fd] text-white shadow-md'
                            : 'bg-[#001426] border-[#002f52] text-slate-400 hover:text-white'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Acciones de Perfil */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#003860]">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    Guardar Cambios del Perfil
                  </button>

                  {currentUser.role === 'user' && (
                    <button
                      type="button"
                      onClick={() => onNavigate('order_history')}
                      className="px-5 py-3 rounded-xl bg-[#002847] hover:bg-[#00375e] text-white font-semibold text-xs transition-colors border border-[#004e80]"
                    >
                      Ver Mis Pedidos
                    </button>
                  )}

                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => onNavigate('admin')}
                      className="px-5 py-3 rounded-xl bg-[#ffc038] hover:bg-[#ffd166] text-[#001629] font-bold text-xs transition-colors"
                    >
                      Panel Administrativo ➜
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
