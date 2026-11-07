import { useState } from "react";
import { AccessibilitySettings, ActiveView } from "../types";
import {
  Eye,
  Sun,
  Moon,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Sliders,
  MessageSquareText,
  X,
  Check,
  ShieldCheck,
  Hand,
} from "lucide-react";
import { useSignLanguage } from "../context/SignLanguageContext";
import {
  FONT_SCALE_BUTTON_STEP,
  FONT_SCALE_STEP,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
  clampFontScale,
} from "../utils/accessibilityScale";

interface FloatingAccessibilityWidgetProps {
  currentView: ActiveView;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onNavigate: (view: ActiveView) => void;
  onTriggerFlash: () => void;
}

export function FloatingAccessibilityWidget({
  currentView,
  settings,
  onUpdateSettings,
  onNavigate,
  onTriggerFlash,
}: FloatingAccessibilityWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isVisible: isInterpreterVisible, setIsVisible: setInterpreterVisible } =
    useSignLanguage();

  const adjustFontSize = (amount: number) => {
    const nextSize = clampFontScale(settings.fontSize + amount);
    onUpdateSettings({ fontSize: nextSize });
    onTriggerFlash();
  };

  const setFontSize = (value: number) => {
    onUpdateSettings({ fontSize: clampFontScale(value) });
  };

  const setContrastMode = (
    mode: "dark_deep" | "light_mode" | "high_contrast",
  ) => {
    onUpdateSettings({
      contrastMode: mode,
      highContrast: mode === "high_contrast",
    });
    onTriggerFlash();
  };

  const fontSizePercentage = `${settings.fontSize}%`;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
      {/* Expanded Quick Panel */}
      {isOpen && (
        <div
          id="floating-accessibility-panel"
          className="accessibility-quick-panel mb-3 flex max-h-[calc(100dvh-7rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-2xl border-2 p-5 text-left text-white shadow-2xl animate-fadeIn space-y-4"
          role="region"
          aria-label="Panel rápido de accesibilidad sensorial"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#003459] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#00e3fd]/20 text-[#00e3fd]">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Accesibilidad Rápida</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                    WCAG AAA
                  </span>
                </h3>
                <p className="text-[11px] text-slate-200">
                  Controles visuales disponibles en toda la plataforma
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-[#00223d] hover:bg-[#003157] text-slate-300 hover:text-white transition-colors"
              aria-label="Cerrar panel de accesibilidad rápida"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setInterpreterVisible(!isInterpreterVisible)}
            aria-pressed={isInterpreterVisible}
            className="accessibility-panel-action flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Hand className="h-4 w-4 shrink-0" aria-hidden="true" />
              Intérprete de LSC
            </span>
            <span>{isInterpreterVisible ? "Visible" : "Mostrar"}</span>
          </button>

          {/* Mode: Claro vs Oscuro vs Alto Contraste */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block">
              Esquema de Color & Modo Visual:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setContrastMode("dark_deep")}
                aria-pressed={settings.contrastMode === "dark_deep"}
                aria-label="Activar modo oscuro"
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e3fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729] ${
                  settings.contrastMode === "dark_deep"
                    ? "bg-[#002b4d] border-[#00e3fd] text-[#00e3fd] ring-2 ring-[#00e3fd]/30 font-bold"
                    : "bg-[#001426] border-[#002d4d] text-slate-300 hover:border-slate-400"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Modo Oscuro</span>
              </button>

              <button
                type="button"
                onClick={() => setContrastMode("light_mode")}
                aria-pressed={settings.contrastMode === "light_mode"}
                aria-label="Activar modo claro"
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e3fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729] ${
                  settings.contrastMode === "light_mode"
                    ? "bg-[#002b4d] border-[#00e3fd] text-[#00e3fd] ring-2 ring-[#00e3fd]/30 font-bold"
                    : "bg-[#001426] border-[#002d4d] text-slate-300 hover:border-slate-400"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Modo Claro</span>
              </button>

              <button
                type="button"
                onClick={() => setContrastMode("high_contrast")}
                aria-pressed={settings.contrastMode === "high_contrast"}
                aria-label="Activar alto contraste"
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc038] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729] ${
                  settings.contrastMode === "high_contrast"
                    ? "bg-[#ffc038]/20 border-[#ffc038] text-[#ffc038] ring-2 ring-[#ffc038]/30 font-bold"
                    : "bg-[#001426] border-[#002d4d] text-slate-300 hover:border-slate-400"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Alto Contraste</span>
              </button>
            </div>
          </div>

          {/* Visual Text Scaling: A- y A+ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Tamaño del Texto:
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00223d] text-[#7dd3fc] font-mono font-bold text-xs border border-[#003860]">
                {fontSizePercentage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => adjustFontSize(-FONT_SCALE_BUTTON_STEP)}
                disabled={settings.fontSize <= MIN_FONT_SCALE}
                className="py-2.5 px-3 rounded-xl bg-[#001426] hover:bg-[#00243e] border border-[#003357] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Disminuir tamaño de texto"
              >
                <ZoomOut className="w-4 h-4 text-[#00e3fd]" />
                <span>A- Disminuir</span>
              </button>

              <button
                type="button"
                onClick={() => adjustFontSize(FONT_SCALE_BUTTON_STEP)}
                disabled={settings.fontSize >= MAX_FONT_SCALE}
                className="py-2.5 px-3 rounded-xl bg-[#001426] hover:bg-[#00243e] border border-[#003357] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Aumentar tamaño de texto"
              >
                <ZoomIn className="w-4 h-4 text-[#00e3fd]" />
                <span>A+ Aumentar</span>
              </button>
            </div>

            <input
              type="range"
              min={MIN_FONT_SCALE}
              max={MAX_FONT_SCALE}
              step={FONT_SCALE_STEP}
              value={settings.fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              aria-label="Tamaño global del texto"
              aria-valuetext={fontSizePercentage}
              aria-valuemin={MIN_FONT_SCALE}
              aria-valuemax={MAX_FONT_SCALE}
              className="w-full accent-[#00e3fd]"
            />
            <div className="flex justify-between text-[10px] text-slate-200">
              <span>{MIN_FONT_SCALE}%</span>
              <span>{MAX_FONT_SCALE}%</span>
            </div>
          </div>

          {/* Beacon Flash Test */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onTriggerFlash}
              className="w-full py-2 px-3 rounded-xl bg-[#00223d] hover:bg-[#002e52] border border-[#003e69] text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Probar Destello Óptico de Borde (Sin Sonido)</span>
            </button>
          </div>

          {/* Navigation to full Accessibility Center and Written Support */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#003459]">
            <button
              type="button"
              onClick={() => {
                onNavigate("accessibility");
                setIsOpen(false);
              }}
              className="accessibility-panel-action py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Centro Completo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate("contact_support");
                setIsOpen(false);
              }}
              className="accessibility-panel-action py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Soporte Escrito</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger (Always Visible on All Screens) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-contrast-mode={settings.contrastMode}
        className="accessibility-quick-trigger min-h-14 w-14 max-w-[calc(100vw-2rem)] rounded-full border-2 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e3fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001729]"
        aria-label={
          isOpen
            ? "Cerrar centro de accesibilidad"
            : "Abrir centro de accesibilidad y opciones sensoriales"
        }
        aria-expanded={isOpen}
        aria-controls="floating-accessibility-panel"
      >
        <span className="accessibility-quick-trigger-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Eye className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="accessibility-quick-trigger-label">Accesibilidad</span>
      </button>
    </div>
  );
}
