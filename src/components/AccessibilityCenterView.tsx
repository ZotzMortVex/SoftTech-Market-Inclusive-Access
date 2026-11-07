import { useState } from "react";
import { AccessibilitySettings, GlossaryTerm, ActiveView } from "../types";
import {
  Eye,
  Sparkles,
  Type,
  Sun,
  Moon,
  VolumeX,
  BookOpen,
  Search,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  MessageSquareText,
  Check,
  Smartphone,
  MousePointerClick,
} from "lucide-react";
import {
  FONT_SCALE_BUTTON_STEP,
  FONT_SCALE_STEP,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
  clampFontScale,
} from "../utils/accessibilityScale";

interface AccessibilityCenterViewProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  glossary: GlossaryTerm[];
  onNavigate: (view: ActiveView) => void;
  onTriggerFlash: () => void;
}

export function AccessibilityCenterView({
  settings,
  onUpdateSettings,
  glossary,
  onNavigate,
  onTriggerFlash,
}: AccessibilityCenterViewProps) {
  const [glossarySearch, setGlossarySearch] = useState("");
  const [selectedGlossaryCategory, setSelectedGlossaryCategory] =
    useState<string>("todos");
  const [activeFeedbackNotice, setActiveFeedbackNotice] = useState<
    string | null
  >(null);

  const showVisualNotice = (msg: string) => {
    setActiveFeedbackNotice(msg);
    onTriggerFlash();
    setTimeout(() => {
      setActiveFeedbackNotice(null);
    }, 3000);
  };

  const filteredGlossary = glossary.filter((item) => {
    const matchesCategory =
      selectedGlossaryCategory === "todos" ||
      item.category.toLowerCase() === selectedGlossaryCategory.toLowerCase();
    const matchesSearch =
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    "todos",
    ...Array.from(new Set(glossary.map((g) => g.category.toLowerCase()))),
  ];

  const setFontSize = (value: number, announce = false) => {
    const nextSize = clampFontScale(value);
    onUpdateSettings({ fontSize: nextSize });
    if (announce) showVisualNotice(`Tamaño de texto ajustado a ${nextSize}%`);
  };

  const handleIncreaseFont = () =>
    setFontSize(settings.fontSize + FONT_SCALE_BUTTON_STEP, true);
  const handleDecreaseFont = () =>
    setFontSize(settings.fontSize - FONT_SCALE_BUTTON_STEP, true);

  return (
    <div
      id="accessibility-center"
      className="accessibility-center space-y-8 animate-fadeIn pb-16 text-left max-w-6xl mx-auto"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#001c33] border-2 border-[#00426b] shadow-2xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#00e3fd]/20 text-[#00e3fd] text-xs font-bold uppercase tracking-wider border border-[#00e3fd]/40 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
            Centro de Accesibilidad Sensorial · WCAG 2.1 AAA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
            <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-[#00e3fd]" />
            <span>Centro de Accesibilidad & Soporte Visual</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Personaliza tus preferencias visuales: modo claro u oscuro, escalado
            tipográfico, contraste de alto impacto y destellos lumínicos
            sustitutivos de alertas acústicas.
          </p>
        </div>

        <button
          onClick={() => onNavigate("contact_support")}
          className="accessibility-primary-action px-4 py-3 rounded-xl bg-[#00e3fd] hover:bg-[#34e7ff] text-[#001629] font-black text-xs transition-all shadow-lg flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Soporte Escrito Directo</span>
        </button>
      </div>

      {/* Visual Confirmation Notice (Zero Audio) */}
      {activeFeedbackNotice && (
        <div
          className="app-visual-notification p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fadeIn"
          role="status"
          data-notification-type="success"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{activeFeedbackNotice}</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
            Aviso Visual
          </span>
        </div>
      )}

      {/* Control Panels: Sensory Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Modo de Color & Contraste (Modo Claro / Modo Oscuro / Alto Contraste) */}
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#003a61] p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#001426] border border-[#003357] flex items-center justify-center text-[#00e3fd]">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Modo de Color & Tema
                </h3>
                <p className="text-[11px] text-slate-400">
                  Esquema cromático y luminancia
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Selecciona el entorno de visualización más cómodo para tu vista
              según la iluminación ambiental.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {/* Modo Oscuro */}
            <button
              type="button"
              aria-pressed={settings.contrastMode === "dark_deep"}
              onClick={() => {
                onUpdateSettings({
                  contrastMode: "dark_deep",
                  highContrast: false,
                });
                showVisualNotice("Modo Oscuro Profundo activado");
              }}
              className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                settings.contrastMode === "dark_deep"
                  ? "bg-[#00e3fd] text-[#001629] border-[#00e3fd] shadow-md"
                  : "bg-[#001426] border-[#002f52] text-slate-300 hover:text-white hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span>Modo Oscuro (Midnight)</span>
              </div>
              {settings.contrastMode === "dark_deep" && (
                <Check className="w-4 h-4" />
              )}
            </button>

            {/* Modo Claro */}
            <button
              type="button"
              aria-pressed={settings.contrastMode === "light_mode"}
              onClick={() => {
                onUpdateSettings({
                  contrastMode: "light_mode",
                  highContrast: false,
                });
                showVisualNotice("Modo Claro activado");
              }}
              className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                settings.contrastMode === "light_mode"
                  ? "bg-[#00e3fd] text-[#001629] border-[#00e3fd] shadow-md"
                  : "bg-[#001426] border-[#002f52] text-slate-300 hover:text-white hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span>Modo Claro (Solar)</span>
              </div>
              {settings.contrastMode === "light_mode" && (
                <Check className="w-4 h-4" />
              )}
            </button>

            {/* Alto Contraste AAA */}
            <button
              type="button"
              aria-pressed={settings.contrastMode === "high_contrast"}
              onClick={() => {
                onUpdateSettings({
                  contrastMode: "high_contrast",
                  highContrast: true,
                });
                showVisualNotice("Modo Alto Contraste AAA activado");
              }}
              className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                settings.contrastMode === "high_contrast"
                  ? "bg-[#ffc038] text-[#001629] border-[#ffc038] shadow-md"
                  : "bg-[#001426] border-[#002f52] text-slate-300 hover:text-white hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Alto Contraste AAA (&gt;12:1)</span>
              </div>
              {settings.contrastMode === "high_contrast" && (
                <Check className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2. Control Visual para Aumentar / Disminuir Tamaño de Texto */}
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#003a61] p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#001426] border border-[#003357] flex items-center justify-center text-[#00e3fd]">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Escala Tipográfica
                </h3>
                <p className="text-[11px] text-slate-400">
                  Control visual de aumento y reducción
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ajusta el tamaño del texto para una lectura cómoda y sin fatiga
              visual en todas las pantallas.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Current Scale Display */}
            <div className="p-3 rounded-xl bg-[#001426] border border-[#003052] flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Tamaño Actual:</span>
              <span className="font-mono font-bold text-[#00e3fd] text-sm">
                {settings.fontSize}%
              </span>
            </div>

            {/* Increase / Decrease Controls */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={settings.fontSize <= MIN_FONT_SCALE}
                className="py-3 px-3 rounded-xl bg-[#001426] hover:bg-[#00243e] border border-[#003357] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Disminuir tamaño de texto"
              >
                <ZoomOut className="w-4 h-4 text-[#00e3fd]" />
                <span>A- Disminuir</span>
              </button>

              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={settings.fontSize >= MAX_FONT_SCALE}
                className="py-3 px-3 rounded-xl bg-[#001426] hover:bg-[#00243e] border border-[#003357] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Aumentar tamaño de texto"
              >
                <ZoomIn className="w-4 h-4 text-[#00e3fd]" />
                <span>A+ Aumentar</span>
              </button>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min={MIN_FONT_SCALE}
                max={MAX_FONT_SCALE}
                step={FONT_SCALE_STEP}
                value={settings.fontSize}
                onChange={(event) => setFontSize(Number(event.target.value))}
                aria-label="Tamaño global del texto"
                aria-valuetext={`${settings.fontSize}%`}
                aria-valuemin={MIN_FONT_SCALE}
                aria-valuemax={MAX_FONT_SCALE}
                className="w-full accent-[#00e3fd]"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{MIN_FONT_SCALE}%</span>
                <span>{MAX_FONT_SCALE}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Destello de Borde Óptico (Sustituto de Campanas y Timbres) */}
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#003a61] p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#001426] border border-[#003357] flex items-center justify-center text-emerald-400">
                <VolumeX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Destello Lumínico
                </h3>
                <p className="text-[11px] text-slate-400">
                  Sustituto sensorial de alertas sonoras
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Un pulso de luz en el marco de la pantalla te avisa visualmente
              ante errores, confirmaciones de compra o respuestas de soporte.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "soft", label: "Suave" },
                { id: "standard", label: "Estándar" },
                { id: "intense", label: "Vívido" },
              ].map((fl) => (
                <button
                  key={fl.id}
                  type="button"
                  aria-pressed={settings.flashIntensity === fl.id}
                  onClick={() => {
                    onUpdateSettings({
                      flashIntensity: fl.id as any,
                      opticalFlashes: true,
                    });
                    showVisualNotice(
                      `Intensidad de destello óptico fijada en: ${fl.label}`,
                    );
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    settings.flashIntensity === fl.id
                      ? "bg-emerald-400 text-[#001629] border-emerald-400 shadow-md"
                      : "bg-[#001426] border-[#002f52] text-slate-300 hover:text-white"
                  }`}
                >
                  {fl.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                onTriggerFlash();
                showVisualNotice(
                  "Probando pulso lumínico de borde en pantalla...",
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#002847] hover:bg-[#00345d] border border-[#004e80] text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Disparar Destello Óptico de Prueba</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cero Audio Guarantee Banner */}
      <div className="accessibility-guarantee p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#001729] via-[#00233d] to-[#001729] border-2 border-[#00e3fd]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <ShieldCheck className="w-6 h-6" />
            <span>
              Compromiso Certificado Cero Audio (Zero Sound Dependency)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Ninguna función de SoftTech Market requiere altavoces, micrófonos ni
            decibeles acústicos. Todos los estados operativos, confirmaciones de
            pago y notificaciones se proyectan mediante luminiscencia, contraste
            y tipografía estructurada con acuses por escrito.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => onNavigate("contact_support")}
            className="accessibility-primary-action px-4 py-2.5 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-bold text-xs transition-colors flex items-center gap-2 shadow-md"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Consultar al Equipo Escrito</span>
          </button>
        </div>
      </div>

      {/* Interactive Glossary Section */}
      <div className="rounded-3xl bg-[#001b33] border-2 border-[#003860] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#003459] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#00e3fd]" />
              <span>Glosario Técnico de Accesibilidad Visual</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Conoce los conceptos y normativas que respaldan nuestra
              arquitectura inclusiva sin sonido.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              placeholder="Buscar término o norma..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#001221] border border-[#003357] text-white text-xs focus:border-[#00e3fd] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedGlossaryCategory === cat}
              onClick={() => setSelectedGlossaryCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedGlossaryCategory === cat
                  ? "bg-[#00e3fd] text-[#001629] font-bold shadow-md"
                  : "bg-[#001426] border border-[#002f52] text-slate-300 hover:text-white"
              }`}
            >
              {cat === "todos" ? "Todos los Términos" : cat}
            </button>
          ))}
        </div>

        {/* Glossary Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#001529] border border-[#002f52] hover:border-[#00e3fd]/50 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-extrabold text-white">
                  {item.term}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-[#002847] text-[#00e3fd] text-[10px] font-mono border border-[#003e69]">
                  {item.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.definition}
              </p>

              <div className="pt-2 border-t border-[#002844] flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Implementado en SoftTech Market Inclusive Access</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
