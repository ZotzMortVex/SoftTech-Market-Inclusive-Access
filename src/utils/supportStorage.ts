import { SupportTicket } from "../types";
import { INITIAL_TICKETS } from "../data/mockData";

export const SUPPORT_TICKETS_KEY = "softtech_market_support_tickets_v1";

export interface ContactMessageForm {
  name: string;
  email: string;
  reason: string;
  message: string;
  orderCode?: string;
}

/**
 * Loads support tickets from localStorage or initializes with INITIAL_TICKETS.
 */
export function loadStoredTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading stored support tickets:", err);
  }
  saveStoredTickets(INITIAL_TICKETS);
  return INITIAL_TICKETS;
}

/**
 * Saves support tickets array to localStorage.
 */
export function saveStoredTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.warn("Error saving support tickets to localStorage:", err);
  }
}

/**
 * Generates an automatic simulated written response for the demo.
 */
export function generateSimulatedReply(reason: string, name: string): string {
  if (
    reason.toLowerCase().includes("accesibilidad") ||
    reason.toLowerCase().includes("audio")
  ) {
    return `Hola ${name}, confirmamos que SoftTech Market opera bajo certificación WCAG 2.1 AAA. Ninguna de nuestras alertas emite pitidos audibles. Toda la retroalimentación se realiza mediante testigos lumínicos y avisos en pantalla.`;
  }
  if (
    reason.toLowerCase().includes("pedido") ||
    reason.toLowerCase().includes("envío") ||
    reason.toLowerCase().includes("despacho")
  ) {
    return `Hola ${name}, nuestro departamento de logística inclusiva ha registrado tu solicitud. Los despachadores se comunican exclusivamente por SMS y timbre lumínico al llegar a tu domicilio.`;
  }
  if (
    reason.toLowerCase().includes("garantía") ||
    reason.toLowerCase().includes("hardware")
  ) {
    return `Hola ${name}, la garantía CUD cubre el 100% de los componentes lumínicos, marcos LED perimetrales y transductores hápticos de tus equipos por 24 meses.`;
  }
  return `Hola ${name}, tu mensaje ha sido recibido formalmente por el equipo de Soporte Escrito. La respuesta completa ha sido archivada en este portal sin llamadas telefónicas.`;
}
