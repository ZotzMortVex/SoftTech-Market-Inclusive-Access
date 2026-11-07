import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { BrandSymbol } from "./BrandSymbol";

const HTTP_ERROR_DETAILS: Record<number, { name: string; description: string }> = {
  400: {
    name: "Bad Request",
    description:
      "La solicitud tiene una sintaxis defectuosa o contiene parámetros inválidos.",
  },
  401: {
    name: "Unauthorized",
    description: "No tienes permiso para ver este contenido. Debes iniciar sesión.",
  },
  403: {
    name: "Forbidden",
    description: "Acceso estrictamente denegado a este recurso.",
  },
  404: {
    name: "Not Found",
    description: "La página o el recurso solicitado no existe en el servidor.",
  },
  500: {
    name: "Internal Server Error",
    description: "Ocurrió un fallo inesperado en el servidor central.",
  },
  502: {
    name: "Bad Gateway",
    description: "Se recibió una respuesta inválida del servidor central.",
  },
  503: {
    name: "Service Unavailable",
    description: "El servidor está saturado o en mantenimiento temporal.",
  },
};

interface ErrorPageProps {
  status: number;
  onHome: () => void;
  onRetry: () => void;
}

export function ErrorPage({ status, onHome, onRetry }: ErrorPageProps) {
  const knownError = HTTP_ERROR_DETAILS[status];
  const name = knownError?.name ?? "Error HTTP";
  const description =
    knownError?.description ??
    "Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.";

  return (
    <main
      aria-labelledby="http-error-title"
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-100/95 p-4 backdrop-blur-sm"
      role="alert"
    >
      <section className="w-full max-w-2xl rounded-3xl border border-slate-300 bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-8 flex justify-center">
          <BrandSymbol showText size={48} />
        </div>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
          <AlertTriangle aria-hidden="true" size={30} />
        </div>

        <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-sky-800">
          Error de comunicación
        </p>
        <h1
          className="mb-5 text-center text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl"
          id="http-error-title"
        >
          Pedimos disculpas por estos inconvenientes, estamos trabajando para
          mejorar.
        </h1>

        <div className="mb-8 rounded-2xl border border-slate-300 bg-slate-50 p-5 text-center">
          <p className="mb-2 text-4xl font-black tabular-nums text-sky-900">
            {status}
          </p>
          <p className="mb-2 font-bold text-slate-900">
            {name} <span className="text-slate-600">· ERR_{status}</span>
          </p>
          <p className="text-base leading-relaxed text-slate-700">
            {description}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-800 px-6 py-3 font-bold text-white shadow-sm hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-900"
            onClick={onHome}
            type="button"
          >
            <Home aria-hidden="true" size={18} />
            Volver al Inicio
          </button>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-400 bg-white px-6 py-3 font-bold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-900"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={18} />
            Reintentar / Actualizar
          </button>
        </div>
      </section>
    </main>
  );
}
