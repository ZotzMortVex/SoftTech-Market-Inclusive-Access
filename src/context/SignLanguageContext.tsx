import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LSC_VIDEO_URL,
  isWelcomeLscVideoUrl,
} from "../utils/lscVideos";

export type InterpreterPosition = "left" | "right";

interface InterpreterPreferences {
  isVisible: boolean;
  isMinimized: boolean;
  position: InterpreterPosition;
}

interface SignLanguageContextValue extends InterpreterPreferences {
  isOpen: boolean;
  currentVideoUrl: string;
  currentVideoLoops: boolean;
  isWelcomePlayback: boolean;
  isProductPlayback: boolean;
  currentCaption: string;
  isHelpOpen: boolean;
  setInterpreterVideo: (url?: string, caption?: string) => void;
  triggerLscVideo: (videoUrl?: string, caption?: string) => void;
  playWelcomeVideo: (caption?: string, videoUrl?: string) => void;
  completeWelcomePlayback: () => void;
  setInterpreterCaption: (caption: string) => void;
  setIsVisible: (visible: boolean) => void;
  setIsMinimized: (minimized: boolean) => void;
  setPosition: (position: InterpreterPosition) => void;
  setIsHelpOpen: (open: boolean) => void;
}

interface SignLanguageProviderProps {
  children: ReactNode;
}

const PREFERENCES_KEY = "softtech_lsc_interpreter_preferences";
const WELCOME_VIDEO_URL =
  import.meta.env.VITE_LSC_WELCOME_VIDEO || DEFAULT_LSC_VIDEO_URL;
const SignLanguageContext = createContext<SignLanguageContextValue | null>(
  null,
);

function resolveNonWelcomeVideoUrl(url?: string): string {
  const candidate = url || import.meta.env.VITE_LSC_DEFAULT_VIDEO || "";
  const normalizedWelcome = WELCOME_VIDEO_URL.split(/[?#]/, 1)[0].toLowerCase();

  if (
    isWelcomeLscVideoUrl(candidate) ||
    candidate.split(/[?#]/, 1)[0].toLowerCase() === normalizedWelcome
  ) {
    return "";
  }

  return candidate;
}

function readPreferences(): InterpreterPreferences {
  const defaults: InterpreterPreferences = {
    isVisible: true,
    isMinimized: false,
    position: "left",
  };

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return defaults;

    const saved = JSON.parse(stored) as Partial<
      InterpreterPreferences & {
        expanded?: boolean;
        side?: string;
        visible?: boolean;
      }
    >;

    return {
      isVisible:
        typeof saved.isVisible === "boolean"
          ? saved.isVisible
          : typeof saved.visible === "boolean"
            ? saved.visible
            : defaults.isVisible,
      isMinimized:
        typeof saved.isMinimized === "boolean"
          ? saved.isMinimized
          : typeof saved.expanded === "boolean"
            ? !saved.expanded
            : defaults.isMinimized,
      position:
        saved.position === "left" || saved.position === "right"
          ? saved.position
          : saved.side === "left" || saved.side === "right"
            ? saved.side
            : defaults.position,
    };
  } catch {
    return defaults;
  }
}

export function SignLanguageProvider({ children }: SignLanguageProviderProps) {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(
    () => WELCOME_VIDEO_URL,
  );
  const [currentVideoLoops, setCurrentVideoLoops] = useState(false);
  const [isWelcomePlayback, setIsWelcomePlayback] = useState(true);
  const [isProductPlayback, setIsProductPlayback] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(
    "Bienvenida a SoftTech Market",
  );
  const [preferences, setPreferences] = useState<InterpreterPreferences>(() => ({
    ...readPreferences(),
    isVisible: true,
    isMinimized: false,
  }));
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const setInterpreterVideo = useCallback((url?: string, caption?: string) => {
    const nextVideoUrl = resolveNonWelcomeVideoUrl(url);
    setCurrentVideoUrl(nextVideoUrl);
    setCurrentVideoLoops(true);
    setIsWelcomePlayback(false);
    setIsProductPlayback(false);
    if (!nextVideoUrl) {
      setPreferences((current) => ({ ...current, isMinimized: true }));
    }
    if (caption !== undefined) setCurrentCaption(caption);
  }, []);

  const triggerLscVideo = useCallback(
    (videoUrl?: string, caption?: string) => {
      setCurrentVideoUrl(resolveNonWelcomeVideoUrl(videoUrl));
      setCurrentVideoLoops(true);
      setIsWelcomePlayback(false);
      setIsProductPlayback(true);
      if (caption !== undefined) setCurrentCaption(caption);
      setPreferences((current) => ({
        ...current,
        isVisible: true,
        isMinimized: false,
      }));
    },
    [],
  );

  const playWelcomeVideo = useCallback(
    (caption?: string, videoUrl?: string) => {
      setCurrentVideoUrl(videoUrl || WELCOME_VIDEO_URL);
      setCurrentVideoLoops(false);
      setIsWelcomePlayback(true);
      setIsProductPlayback(false);
      if (caption !== undefined) setCurrentCaption(caption);
      setPreferences((current) => ({
        ...current,
        isVisible: true,
        isMinimized: false,
      }));
    },
    [],
  );

  const completeWelcomePlayback = useCallback(() => {
    setIsWelcomePlayback(false);
  }, []);

  const setIsVisible = useCallback((isVisible: boolean) => {
    setPreferences((current) => ({ ...current, isVisible }));
  }, []);

  const setIsMinimized = useCallback((isMinimized: boolean) => {
    setPreferences((current) => ({ ...current, isMinimized }));
  }, []);

  const setPosition = useCallback((position: InterpreterPosition) => {
    setPreferences((current) => ({ ...current, position }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      // Keyboard controls and visibility remain available without storage.
    }
  }, [preferences]);

  useEffect(() => {
    function handleGlobalShortcuts(event: KeyboardEvent) {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;

      const shortcut = event.key.toLowerCase();
      if (!["s", "m", "p", "h"].includes(shortcut)) return;

      event.preventDefault();
      if (shortcut === "s") {
        setPreferences((current) => ({
          ...current,
          isVisible: !current.isVisible,
        }));
      } else if (shortcut === "m") {
        setPreferences((current) => ({
          ...current,
          isMinimized: !current.isMinimized,
        }));
      } else if (shortcut === "p") {
        setPreferences((current) => ({
          ...current,
          position: current.position === "left" ? "right" : "left",
        }));
      } else {
        setIsHelpOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  return (
    <SignLanguageContext.Provider
      value={{
        ...preferences,
        isOpen: preferences.isVisible,
        currentVideoUrl,
        currentVideoLoops,
        isWelcomePlayback,
        isProductPlayback,
        currentCaption,
        isHelpOpen,
        setInterpreterVideo,
        triggerLscVideo,
        playWelcomeVideo,
        completeWelcomePlayback,
        setInterpreterCaption: setCurrentCaption,
        setIsVisible,
        setIsMinimized,
        setPosition,
        setIsHelpOpen,
      }}
    >
      {children}
    </SignLanguageContext.Provider>
  );
}

export function useSignLanguage() {
  const context = useContext(SignLanguageContext);
  if (!context) {
    throw new Error(
      "useSignLanguage debe usarse dentro de SignLanguageProvider",
    );
  }
  return context;
}
