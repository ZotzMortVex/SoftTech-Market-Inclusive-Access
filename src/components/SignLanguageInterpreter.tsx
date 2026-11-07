import {
  ArrowLeftRight,
  CircleHelp,
  EyeOff,
  Hand,
  Minimize2,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSignLanguage } from "../context/SignLanguageContext";
import { DEFAULT_LSC_VIDEO_URL } from "../utils/lscVideos";

interface SignLanguageInterpreterProps {
  isAdmin?: boolean;
}

function ShortcutHelp({ hidden = false }: { hidden?: boolean }) {
  return (
    <section
      id="sign-language-shortcuts"
      hidden={hidden}
      aria-label="Comandos de teclado del intérprete"
      className="border-t border-[#c5d1d3] bg-[#f4f7f4] px-3 py-3 text-[#26383c]"
    >
      <h3 className="mb-2 text-xs font-bold">Comandos de teclado</h3>
      <dl className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt>Mostrar u ocultar</dt>
          <dd>
            <kbd className="rounded border border-[#b7c6c8] bg-white px-1.5 py-0.5 font-mono">
              Alt + S
            </kbd>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Ampliar o minimizar</dt>
          <dd>
            <kbd className="rounded border border-[#b7c6c8] bg-white px-1.5 py-0.5 font-mono">
              Alt + M
            </kbd>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Mover de esquina</dt>
          <dd>
            <kbd className="rounded border border-[#b7c6c8] bg-white px-1.5 py-0.5 font-mono">
              Alt + P
            </kbd>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Mostrar esta ayuda</dt>
          <dd>
            <kbd className="rounded border border-[#b7c6c8] bg-white px-1.5 py-0.5 font-mono">
              Alt + H
            </kbd>
          </dd>
        </div>
      </dl>
    </section>
  );
}
export function SignLanguageInterpreter({
  isAdmin = false,
}: SignLanguageInterpreterProps) {
  const {
    currentVideoUrl,
    currentVideoLoops,
    isWelcomePlayback,
    currentCaption,
    isVisible,
    isMinimized,
    position,
    isHelpOpen,
    setIsVisible,
    setIsMinimized,
    setPosition,
    setIsHelpOpen,
    triggerLscVideo,
    playWelcomeVideo,
    completeWelcomePlayback,
  } = useSignLanguage();
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const fallbackVideoUrl = DEFAULT_LSC_VIDEO_URL;
  const welcomeVideoUrl =
    import.meta.env.VITE_LSC_WELCOME_VIDEO || DEFAULT_LSC_VIDEO_URL;
  const reactivateInterpreter = () => {
    if (currentVideoUrl === welcomeVideoUrl) {
      playWelcomeVideo(currentCaption);
      return;
    }
    triggerLscVideo(currentVideoUrl, currentCaption);
  };

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(!currentVideoUrl);
  }, [currentVideoUrl]);

  const handleVideoError = () => {
    setVideoReady(false);
    if (isWelcomePlayback && currentVideoUrl !== fallbackVideoUrl) {
      playWelcomeVideo(
        `${currentCaption} · video de respaldo`,
        fallbackVideoUrl,
      );
      return;
    }

    setVideoFailed(true);
    if (isWelcomePlayback) {
      completeWelcomePlayback();
      setIsMinimized(true);
    }
  };

  const sideClass = position === "left" ? "left-4" : "right-4";
  const interpreterBottomOffset =
    isAdmin && position === "left" ? "bottom-24" : "bottom-6";

  if (!isVisible) return null;

  return (
    <div
      className={`pointer-events-none fixed ${interpreterBottomOffset} ${sideClass} z-[55]`}
    >
      <AnimatePresence initial={false}>
        {isMinimized ? (
          <motion.button
            key="lsc-reactivate"
            type="button"
            onClick={reactivateInterpreter}
            aria-label="Reactivar el intérprete de Lengua de Señas Colombiana"
            aria-controls="sign-language-interpreter-panel"
            title="Reactivar intérprete LSC"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#075985] bg-white text-[#075985] shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <Hand className="h-6 w-6" aria-hidden="true" />
          </motion.button>
        ) : (
          <motion.section
            key="lsc-panel"
            id="sign-language-interpreter-panel"
            role="region"
            aria-label="Panel del intérprete de Lengua de Señas Colombiana"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            className="pointer-events-auto max-h-[60vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[#a8b9bd] bg-[#e8edef] shadow-lg shadow-slate-900/15"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#c5d1d3] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2 text-[#24383c]">
                <Hand
                  className="h-4 w-4 shrink-0 text-[#236d66]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-xs font-bold">Intérprete LSC</h2>
                  <p className="truncate text-[10px] text-[#52676b]">
                    {currentCaption}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setPosition(position === "left" ? "right" : "left")
                  }
                  aria-label={`Mover intérprete a la ${position === "left" ? "derecha" : "izquierda"}`}
                  aria-pressed={position === "left"}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#344d51] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
                  title={`Mover a la ${position === "left" ? "derecha" : "izquierda"}`}
                >
                  <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  aria-label="Minimizar intérprete de señas"
                  aria-pressed={false}
                  aria-controls="sign-language-interpreter-panel"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#344d51] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
                  title="Minimizar intérprete"
                >
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  aria-label="Ocultar intérprete de señas"
                  aria-pressed={false}
                  aria-controls="sign-language-interpreter-panel"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#344d51] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
                  title="Ocultar intérprete"
                >
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  aria-label={
                    isHelpOpen
                      ? "Cerrar ayuda de comandos LSC"
                      : "Mostrar ayuda de comandos LSC"
                  }
                  aria-expanded={isHelpOpen}
                  aria-controls="sign-language-shortcuts"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#344d51] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
                  title="Atajos de teclado"
                >
                  <CircleHelp className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div
              id="sign-language-video"
              className="relative aspect-video max-h-[35vh] overflow-hidden bg-[#34474a]"
            >
              {currentVideoUrl && (
                <video
                  key={currentVideoUrl}
                  src={currentVideoUrl}
                  muted
                  loop={currentVideoLoops}
                  autoPlay
                  playsInline
                  controls={false}
                  preload="metadata"
                  aria-label={`Interpretación en LSC: ${currentCaption}`}
                  onCanPlay={() => setVideoReady(true)}
                  onError={handleVideoError}
                  onEnded={() => {
                    if (currentVideoLoops) return;
                    completeWelcomePlayback();
                    setIsMinimized(true);
                  }}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${videoReady ? "opacity-100" : "opacity-0"}`}
                />
              )}

              {(videoFailed || !videoReady) && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#34474a] px-4 text-center text-white"
                >
                  <Video
                    className="h-7 w-7 text-[#c4d3d2]"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-semibold">
                    {videoFailed
                      ? "No se pudo cargar el video LSC"
                      : "Cargando video de señas…"}
                  </p>
                </div>
              )}
            </div>

            <ShortcutHelp hidden={!isHelpOpen} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
