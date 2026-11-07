import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CheckCheck,
  CircleHelp,
  Inbox,
  MessageSquareText,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type {
  ChatMessage,
  SupportTicket,
  UserAccount,
  UserRole,
} from "../../types";
import { useSignLanguage } from "../../context/SignLanguageContext";

interface WrittenSupportChatProps {
  tickets: SupportTicket[];
  currentUser: UserAccount | null;
  userRole: UserRole;
  onCreateTicket: (ticket: SupportTicket) => void;
  onAppendMessage: (ticketId: string, message: ChatMessage) => void;
  onUpdateAdminTyping: (ticketId: string, isTyping: boolean) => void;
  onTriggerFlash: () => void;
}

const QUICK_QUESTIONS = [
  "¿Cómo va mi pedido?",
  "¿Cómo aplico la garantía?",
  "Tengo un problema con el pago",
];

function getTicketConversation(ticket: SupportTicket): ChatMessage[] {
  if (ticket.conversation?.length) return ticket.conversation;

  const legacyMessages: ChatMessage[] = [
    {
      id: `${ticket.id}-legacy-user`,
      sender: "user",
      senderName: ticket.userName ?? "Cliente",
      text: ticket.message,
      timestamp: ticket.date,
      isRead: true,
    },
  ];

  if (ticket.response) {
    legacyMessages.push({
      id: `${ticket.id}-legacy-agent`,
      sender: "agent",
      senderName: "Soporte SoftTech",
      text: ticket.response,
      timestamp: "Respuesta registrada",
      isRead: true,
    });
  }

  return legacyMessages;
}

function makeChatMessage(
  sender: ChatMessage["sender"],
  senderName: string,
  text: string,
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    senderName,
    text,
    timestamp: new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    isRead: false,
  };
}

function getGuestSessionId(): string {
  const key = "softtech_support_guest_session";
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const created = `guest-${crypto.randomUUID()}`;
    sessionStorage.setItem(key, created);
    return created;
  } catch {
    return `guest-${Date.now()}`;
  }
}

export function WrittenSupportChat({
  tickets,
  currentUser,
  userRole,
  onCreateTicket,
  onAppendMessage,
  onUpdateAdminTyping,
  onTriggerFlash,
}: WrittenSupportChatProps) {
  const isAdmin = userRole === "admin";
  const { currentVideoUrl, setInterpreterVideo } = useSignLanguage();
  const [guestName, setGuestName] = useState(currentUser?.name ?? "");
  const [guestEmail, setGuestEmail] = useState(currentUser?.email ?? "");
  const [guestSessionId] = useState(() =>
    currentUser ? "" : getGuestSessionId(),
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [liveNotice, setLiveNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const guestNameRef = useRef<HTMLInputElement>(null);
  const guestEmailRef = useRef<HTMLInputElement>(null);

  const identityEmail = (currentUser?.email ?? guestEmail).trim().toLowerCase();
  const visibleTickets = useMemo(() => {
    if (isAdmin) {
      return [...tickets].sort((a, b) => {
        const aWaiting = a.status === "resuelto" ? 1 : 0;
        const bWaiting = b.status === "resuelto" ? 1 : 0;
        return aWaiting - bWaiting;
      });
    }
    return tickets.filter((ticket) => {
      if (
        identityEmail &&
        ticket.userEmail?.trim().toLowerCase() === identityEmail
      ) {
        return true;
      }
      return Boolean(
        guestSessionId && ticket.guestSessionId === guestSessionId,
      );
    });
  }, [guestSessionId, identityEmail, isAdmin, tickets]);

  useEffect(() => {
    if (!visibleTickets.some((ticket) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(visibleTickets[0]?.id ?? null);
    }
  }, [selectedTicketId, visibleTickets]);

  const selectedTicket = visibleTickets.find(
    (ticket) => ticket.id === selectedTicketId,
  );
  const messages = selectedTicket ? getTicketConversation(selectedTicket) : [];
  const showTypingIndicator = isAdmin
    ? isAdminTyping
    : Boolean(selectedTicket?.agentTyping);
  const latestMessageId = messages[messages.length - 1]?.id;
  const waitingTickets = visibleTickets.filter(
    (ticket) => ticket.status !== "resuelto",
  ).length;

  useEffect(() => {
    if (!selectedTicket || !transcriptRef.current) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    transcriptRef.current.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [isAdminTyping, latestMessageId, selectedTicketId]);

  const latestMessage = messages[messages.length - 1];
  const latestMessageIsAgent = latestMessage?.sender === "agent";

  useEffect(() => {
    if (!latestMessage || !latestMessageIsAgent) return;

    setInterpreterVideo(
      import.meta.env.VITE_LSC_SUPPORT_REPLY_VIDEO ?? currentVideoUrl,
      `Respuesta escrita de soporte: ${latestMessage.text}`,
    );
  }, [
    currentVideoUrl,
    latestMessageId,
    latestMessageIsAgent,
    setInterpreterVideo,
  ]);

  useEffect(() => {
    if (isAdmin || !selectedTicket) return;
    if (selectedTicket.agentTyping) {
      setInterpreterVideo(
        import.meta.env.VITE_LSC_SUPPORT_WAITING_VIDEO ?? currentVideoUrl,
        "El administrador está respondiendo por escrito.",
      );
    }
  }, [
    currentVideoUrl,
    isAdmin,
    selectedTicket?.agentTyping,
    selectedTicket?.id,
    setInterpreterVideo,
  ]);

  const setAdminTyping = (typing: boolean) => {
    setIsAdminTyping(typing);
    if (!isAdmin || !selectedTicket) return;
    onUpdateAdminTyping(selectedTicket.id, typing);

    setInterpreterVideo(
      typing
        ? (import.meta.env.VITE_LSC_SUPPORT_WAITING_VIDEO ?? currentVideoUrl)
        : currentVideoUrl,
      typing
        ? "Administrador respondiendo por escrito. Espera la respuesta."
        : `Atención escrita para ${selectedTicket.userName ?? "el usuario"}.`,
    );
  };

  const sendMessage = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    setFormError(null);

    if (
      !isAdmin &&
      !currentUser &&
      guestEmail.trim() &&
      !guestEmail.includes("@")
    ) {
      setFormError(
        "Revisa el formato del correo o déjalo vacío para continuar como invitado.",
      );
      guestEmailRef.current?.focus();
      return;
    }

    const sender = isAdmin ? "agent" : "user";
    const senderName = isAdmin
      ? (currentUser?.name ?? "Soporte SoftTech")
      : (currentUser?.name ?? (guestName.trim() || "Invitado"));
    const message = makeChatMessage(sender, senderName, text);

    if (selectedTicket) {
      onAppendMessage(selectedTicket.id, message);
    } else if (!isAdmin) {
      const newTicket: SupportTicket = {
        id: `TCK-${Date.now()}`,
        date: "Hoy",
        subject: text.length > 55 ? `${text.slice(0, 52)}...` : text,
        category: "Soporte escrito",
        message: text,
        channel: "Chat escrito del portal",
        status: "abierto",
        userName: senderName,
        userEmail: identityEmail || undefined,
        guestSessionId: currentUser ? undefined : guestSessionId,
        conversation: [message],
      };
      onCreateTicket(newTicket);
      setSelectedTicketId(newTicket.id);
    } else {
      setFormError("Selecciona una conversación para responder.");
      return;
    }

    setDraft("");
    if (isAdmin && selectedTicket) {
      setAdminTyping(false);
    } else {
      setIsAdminTyping(false);
    }
    setLiveNotice("Mensaje enviado por escrito.");
    onTriggerFlash();
    setInterpreterVideo(
      isAdmin
        ? (import.meta.env.VITE_LSC_SUPPORT_REPLY_VIDEO ?? currentVideoUrl)
        : (import.meta.env.VITE_LSC_SUPPORT_QUESTION_VIDEO ?? currentVideoUrl),
      isAdmin ? `Respuesta enviada: ${text}` : `Pregunta enviada: ${text}`,
    );
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (formError) setFormError(null);
    if (isAdmin) setAdminTyping(value.trim().length > 0);
  };

  const selectTicket = (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id);
    setDraft("");
    setAdminTyping(false);
    setInterpreterVideo(
      import.meta.env.VITE_LSC_SUPPORT_QUESTION_VIDEO ?? currentVideoUrl,
      `Conversación de soporte: ${ticket.subject}`,
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 pb-16 text-left text-[#26383c]">
      <header className="border-b border-[#cad5d6] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-[#28675f]">
              Atención 100% escrita · Cero audio
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-[#203236]">
              <MessageSquareText
                className="h-6 w-6 text-[#28675f]"
                aria-hidden="true"
              />
              {isAdmin ? "Bandeja de soporte" : "Chat de soporte inclusivo"}
            </h1>
            <p className="mt-1 max-w-3xl text-base leading-relaxed text-[#52676b]">
              {isAdmin
                ? "Atiende consultas escritas y responde en el hilo seleccionado."
                : "Escribe tu consulta o elige una pregunta rápida. Conservaremos la conversación en este portal."}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#bfd0cc] bg-[#e7efec] px-3 py-2 text-sm font-semibold text-[#315a53]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Sin llamadas ni avisos sonoros
          </span>
        </div>
      </header>

      {!isAdmin && !currentUser && (
        <section className="grid gap-4 border-b border-[#cad5d6] pb-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="support-guest-name"
              className="mb-1 block text-sm font-semibold"
            >
              Nombre (opcional)
            </label>
            <input
              ref={guestNameRef}
              id="support-guest-name"
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-[#b8c7c9] bg-white px-4 py-3 text-base text-[#26383c] outline-none focus-visible:ring-2 focus-visible:ring-[#287f73]"
            />
          </div>
          <div>
            <label
              htmlFor="support-guest-email"
              className="mb-1 block text-sm font-semibold"
            >
              Correo para volver a encontrar la conversación (opcional)
            </label>
            <input
              ref={guestEmailRef}
              id="support-guest-email"
              type="email"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-[#b8c7c9] bg-white px-4 py-3 text-base text-[#26383c] outline-none focus-visible:ring-2 focus-visible:ring-[#287f73]"
            />
          </div>
        </section>
      )}

      {!isAdmin && (
        <section
          aria-label="Preguntas rápidas"
          className="border-b border-[#cad5d6] pb-5"
        >
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#203236]">
            <CircleHelp className="h-5 w-5 text-[#28675f]" aria-hidden="true" />
            Preguntas rápidas
          </h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="rounded-full border border-[#aebfc2] bg-[#e6edf0] px-4 py-2.5 text-sm font-semibold text-[#31494e] transition-colors hover:bg-[#dce7e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287f73]"
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      )}

      <div
        className={
          isAdmin
            ? "grid min-h-[34rem] gap-0 lg:grid-cols-[19rem_minmax(0,1fr)]"
            : "min-h-[34rem]"
        }
      >
        {isAdmin && (
          <aside className="border-b border-[#cad5d6] lg:border-b-0 lg:border-r lg:pr-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#203236]">
                Conversaciones
              </h2>
              <span className="rounded-full bg-[#dcebe6] px-2.5 py-1 text-sm font-bold text-[#28675f]">
                {waitingTickets} pendientes
              </span>
            </div>
            {visibleTickets.length === 0 ? (
              <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center text-[#64777a]">
                <Inbox className="h-7 w-7" aria-hidden="true" />
                <p className="text-sm">No hay consultas escritas todavía.</p>
              </div>
            ) : (
              <ul className="max-h-[50vh] space-y-1 overflow-y-auto pr-1 lg:max-h-[65vh]">
                {visibleTickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => selectTicket(ticket)}
                      aria-current={
                        selectedTicket?.id === ticket.id ? "true" : undefined
                      }
                      className={`w-full border-l-4 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#287f73] ${
                        selectedTicket?.id === ticket.id
                          ? "border-[#287f73] bg-[#e4eeea]"
                          : "border-transparent hover:bg-[#eaf0f1]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-[#26383c]">
                          {ticket.userName ?? "Cliente"}
                        </span>
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${ticket.status === "resuelto" ? "bg-[#8ba19b]" : "bg-[#bd7738]"}`}
                          aria-label={
                            ticket.status === "resuelto"
                              ? "Resuelto"
                              : "Esperando atención"
                          }
                          title={
                            ticket.status === "resuelto"
                              ? "Resuelto"
                              : "Esperando atención"
                          }
                        />
                      </span>
                      <span className="mt-1 block truncate text-sm text-[#52676b]">
                        {ticket.subject}
                      </span>
                      <span className="mt-1 block text-xs text-[#6c7e81]">
                        #{ticket.id} · {ticket.date}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}

        <section
          className={
            isAdmin ? "flex min-w-0 flex-col lg:pl-6" : "flex min-w-0 flex-col"
          }
        >
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[#cad5d6] py-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#203236]">
                {selectedTicket?.subject ??
                  (isAdmin
                    ? "Selecciona una conversación"
                    : "Conversación escrita")}
              </h2>
              {selectedTicket && (
                <p className="text-sm text-[#65777a]">
                  {selectedTicket.userName ?? "Cliente"} · #{selectedTicket.id}
                </p>
              )}
            </div>
            {selectedTicket && (
              <span className="shrink-0 rounded-full border border-[#b8c9c4] bg-[#e7efec] px-3 py-1 text-xs font-bold text-[#315a53]">
                {selectedTicket.status === "resuelto"
                  ? "Resuelto"
                  : "En atención"}
              </span>
            )}
          </div>

          <div
            ref={transcriptRef}
            role="log"
            aria-label="Mensajes del chat de soporte"
            aria-live="polite"
            aria-relevant="additions text"
            aria-atomic="false"
            className="flex-1 space-y-4 overflow-y-auto py-5"
          >
            {!selectedTicket ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-[#68797c]">
                <MessageSquareText
                  className="h-8 w-8 text-[#71928b]"
                  aria-hidden="true"
                />
                <p className="text-base leading-relaxed">
                  {isAdmin
                    ? "Selecciona una conversación para revisar y responder."
                    : "Escribe un mensaje o selecciona una pregunta rápida para iniciar."}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <p className="py-8 text-center text-base text-[#68797c]">
                Aún no hay mensajes en esta conversación.
              </p>
            ) : (
              messages.map((message) => {
                const isAgentMessage = message.sender === "agent";
                return (
                  <article
                    key={message.id}
                    className={`flex ${isAgentMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[min(42rem,88%)] border px-4 py-3 ${
                        isAgentMessage
                          ? "rounded-2xl rounded-br-sm border-[#b5cec3] bg-[#e3eee8]"
                          : "rounded-2xl rounded-bl-sm border-[#c4d0d6] bg-[#e7edf1]"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[#43595c]">
                        {isAgentMessage ? (
                          <ShieldCheck
                            className="h-4 w-4 text-[#477a68]"
                            aria-hidden="true"
                          />
                        ) : (
                          <UserRound
                            className="h-4 w-4 text-[#607c8c]"
                            aria-hidden="true"
                          />
                        )}
                        <span>{message.senderName}</span>
                        <time className="font-normal text-[#6c7c7e]">
                          {message.timestamp}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap text-base leading-relaxed text-[#26383c]">
                        {message.text}
                      </p>
                    </div>
                  </article>
                );
              })
            )}

            {showTypingIndicator && selectedTicket && (
              <p
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 text-sm font-medium text-[#52746a]"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#588a72]" />
                Administrador respondiendo por escrito...
              </p>
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="mb-2 text-sm font-semibold text-[#8d3f36]"
            >
              {formError}
            </p>
          )}
          <p className="sr-only" role="status" aria-live="polite">
            {liveNotice}
          </p>

          {(!isAdmin || selectedTicket) && (
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 border-t border-[#cad5d6] pt-4"
            >
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="support-chat-message"
                  className="mb-1 block text-sm font-semibold text-[#35494c]"
                >
                  {isAdmin ? "Respuesta escrita" : "Tu mensaje"}
                </label>
                <input
                  ref={inputRef}
                  id="support-chat-message"
                  type="text"
                  value={draft}
                  onChange={(event) => handleDraftChange(event.target.value)}
                  onBlur={() => isAdminTyping && setAdminTyping(false)}
                  disabled={isAdmin && !selectedTicket}
                  placeholder={
                    isAdmin
                      ? "Escribe la respuesta..."
                      : "Escribe tu consulta..."
                  }
                  autoComplete="off"
                  className="w-full rounded-lg border border-[#b8c7c9] bg-white px-4 py-3 text-base text-[#26383c] outline-none placeholder:text-[#7a898b] focus-visible:ring-2 focus-visible:ring-[#287f73] disabled:bg-[#e9eeee]"
                />
              </div>
              <button
                type="submit"
                disabled={!draft.trim() || (isAdmin && !selectedTicket)}
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg bg-[#28675f] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#20564f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287f73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Enviar
              </button>
            </form>
          )}
        </section>
      </div>
    </section>
  );
}
