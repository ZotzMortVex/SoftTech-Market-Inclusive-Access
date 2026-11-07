import { UserAccount } from "../types";
import { apiFetch } from "./apiFetch";

export interface RegisterAccountInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserAccount(value: unknown): value is UserAccount {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    (value.role === "user" || value.role === "admin") &&
    typeof value.phone === "string" &&
    (value.preferredChannel === "sms_visual" ||
      value.preferredChannel === "email_escrito" ||
      value.preferredChannel === "portal") &&
    typeof value.active === "boolean" &&
    typeof value.registeredDate === "string" &&
    typeof value.totalOrdersCount === "number"
  );
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (isRecord(body) && typeof body.error === "string") {
    return body.error;
  }
  return fallback;
}

async function postAccount(
  route: string,
  body: unknown,
): Promise<UserAccount> {
  const response = await apiFetch(`/api/auth/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, `Error de autenticación (${response.status}).`),
    );
  }

  const result: unknown = await response.json();
  if (!isUserAccount(result)) {
    throw new Error("El servidor devolvió datos de cuenta no válidos.");
  }
  return result;
}

export function loginAccount(
  email: string,
  password: string,
): Promise<UserAccount> {
  return postAccount("login", { email, password });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await apiFetch("/api/auth/password-reset/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo solicitar el restablecimiento (${response.status}).`,
      ),
    );
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await apiFetch("/api/auth/password-reset/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo cambiar la contraseña (${response.status}).`,
      ),
    );
  }
}

export function registerAccount(
  account: RegisterAccountInput,
): Promise<UserAccount> {
  return postAccount("register", account);
}

export async function fetchCurrentAccount(): Promise<UserAccount | null> {
  const response = await apiFetch("/api/auth/me");
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo validar la sesión (${response.status}).`,
      ),
    );
  }

  const result: unknown = await response.json();
  if (!isUserAccount(result)) {
    throw new Error("El servidor devolvió datos de sesión no válidos.");
  }
  return result;
}

export async function logoutAccount(): Promise<void> {
  const response = await apiFetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo cerrar la sesión (${response.status}).`,
      ),
    );
  }
}

export async function renewAuthenticatedSession(): Promise<void> {
  const response = await apiFetch("/api/auth/activity", { method: "POST" });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo renovar la sesión (${response.status}).`,
      ),
    );
  }
}

export async function fetchManagedUsers(): Promise<UserAccount[]> {
  const response = await apiFetch("/api/auth/users");
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudieron cargar los usuarios (${response.status}).`,
      ),
    );
  }

  const result: unknown = await response.json();
  if (!Array.isArray(result) || !result.every(isUserAccount)) {
    throw new Error("El servidor devolvió una lista de usuarios no válida.");
  }
  return result;
}

export async function setManagedUserActive(
  userId: string,
  active: boolean,
): Promise<UserAccount> {
  const response = await apiFetch(
    `/api/auth/users/${encodeURIComponent(userId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    },
  );
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo actualizar el usuario (${response.status}).`,
      ),
    );
  }

  const result: unknown = await response.json();
  if (!isUserAccount(result)) {
    throw new Error("El servidor devolvió datos de usuario no válidos.");
  }
  return result;
}

export async function deleteManagedUser(userId: string): Promise<void> {
  const response = await apiFetch(
    `/api/auth/users/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `No se pudo eliminar el usuario (${response.status}).`,
      ),
    );
  }
}
