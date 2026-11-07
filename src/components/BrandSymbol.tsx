import React from "react";

interface BrandSymbolProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textTone?: "default" | "inverse";
}

export function BrandSymbol({
  className = "",
  size = 36,
  showText = false,
  textTone = "default",
}: BrandSymbolProps) {
  const titleTone =
    textTone === "inverse"
      ? "text-white group-hover:text-cyan-200"
      : "text-slate-900 group-hover:text-blue-600";
  const taglineTone =
    textTone === "inverse" ? "text-[#cbd5e1]" : "text-slate-500";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Icono de Marca Inclusivo y Tecnológico */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0f172a] p-1.5 shadow-md border-2 border-cyan-400 group-hover:border-cyan-300 transition-all shrink-0"
        title="SoftTech Market: Tecnología Inclusiva 100% Visual y Cero Audio"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Circuito tecnológico de fondo */}
          <path
            d="M6 24H12M36 24H42M24 6V12M24 36V42"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <circle cx="6" cy="24" r="2" fill="#38bdf8" />
          <circle cx="42" cy="24" r="2" fill="#38bdf8" />
          <circle cx="24" cy="6" r="2" fill="#38bdf8" />
          <circle cx="24" cy="42" r="2" fill="#38bdf8" />

          {/* Ojo Estilizado de Visión Total (100% Visual) */}
          <path
            d="M8 24C12 14 36 14 40 24C36 34 12 34 8 24Z"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pupila con Núcleo Óptico y Sensor de Luz */}
          <circle
            cx="24"
            cy="24"
            r="6.5"
            fill="#00e3fd"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <circle cx="26" cy="22" r="2" fill="#ffffff" />

          {/* Ondas sonoras del símbolo de inclusión auditiva */}
          <path
            d="M31 16C33 18 34 21 34 24M37 13C40 16 41 20 41 24"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
        </svg>

        {/* Destello de señal óptica en esquina */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white" />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold text-lg sm:text-xl tracking-tight transition-colors ${titleTone}`}
            >
              SoftTech Market
            </span>
            <span className="brand-inclusive-badge rounded font-black uppercase tracking-wider">
              INCLUSIVO
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold tracking-tight ${taglineTone}`}
          >
            Acceso 100% Visual · Cero Audio
          </span>
        </div>
      )}
    </div>
  );
}
