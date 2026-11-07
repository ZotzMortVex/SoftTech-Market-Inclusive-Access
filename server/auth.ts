import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { UserAccount } from "../src/types";
import { database } from "./db";
import {
  ensureDefaultAdmin,
  findFallbackUserByEmail,
  findFallbackUserById,
  registerFallbackUser,
  toPublicUser,
  updateFallbackUserPassword,
  verifyFallbackUser,
} from "./fallbackStore";
import { hashPassword, verifyPassword } from "./password";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "./email";

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: "user" | "admin";
  phone: string;
  preferredChannel: UserAccount["preferredChannel"];
  active: number | boolean;
  registeredDate: string;
}

const PUBLIC_USER_COLUMNS = `
  id, name, email, role, phone,
  preferred_channel AS preferredChannel, active,
  DATE_FORMAT(created_at, '%d/%m/%Y') AS registeredDate
`;

interface RegistrationInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  password?: unknown;
}

interface LoginInput {
  email?: unknown;
  password?: unknown;
}

interface PasswordResetRequestInput {
  email?: unknown;
}

interface PasswordResetConfirmInput {
  token?: unknown;
  password?: unknown;
}

const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const fallbackPasswordResetTokens = new Map<
  string,
  { userId: string; expiresAt: number }
>();
const passwordResetRequestsByIp = new Map<string, number[]>();

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createPasswordResetUrl(token: string): string {
  const configuredUrl = process.env.APP_URL ?? process.env.APP_BASE_URL;
  if (!configuredUrl) {
    throw new Error("APP_URL must be configured to create password reset links.");
  }

  const url = new URL(configuredUrl);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("APP_URL must use HTTPS outside localhost.");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  url.searchParams.set("passwordResetToken", token);
  return url.toString();
}

function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function saveSession(request: Request, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      request.session.userId = userId;
      request.session.save((saveError) => {
        if (saveError) {
          reject(saveError);
          return;
        }
        resolve();
      });
    });
  });
}

function destroySession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export const authRouter = Router();

void ensureDefaultAdmin();

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.session.userId) {
    response.status(401).json({ error: "Debes iniciar sesión para continuar." });
    return;
  }

  next();
}

export async function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const userId = request.session.userId;
  if (!userId) {
    requireAuth(request, response, next);
    return;
  }

  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT id FROM users
       WHERE id = ? AND role = 'admin' AND active = TRUE
       LIMIT 1`,
      [userId],
    );

    if (rows.length === 0) {
      response.status(403).json({ error: "Se requiere una cuenta administradora activa." });
      return;
    }

    next();
  } catch (error) {
    const fallbackUser = findFallbackUserById(userId);
    if (!fallbackUser || fallbackUser.role !== "admin" || !fallbackUser.active) {
      response.status(403).json({ error: "Se requiere una cuenta administradora activa." });
      return;
    }

    console.error("Administrator authorization failed:", error);
    next();
  }
}

authRouter.get("/users", requireAdmin, async (_request, response) => {
  try {
    const [rows] = await database.execute<UserRow[]>(
      `SELECT ${PUBLIC_USER_COLUMNS}
       FROM users
       ORDER BY role = 'admin' DESC, created_at ASC`,
    );
    response.json(rows.map(toPublicUser));
  } catch (error) {
    console.error("Unable to list users from MySQL:", error);
    response.status(500).json({ error: "No se pudieron cargar los usuarios desde la base de datos." });
  }
});

authRouter.patch("/users/:id/status", requireAdmin, async (request, response) => {
  const userId = request.params.id;
  const active = isRecord(request.body) ? request.body.active : undefined;
  if (!userId || typeof active !== "boolean") {
    response.status(400).json({ error: "El usuario o el estado no son válidos." });
    return;
  }

  try {
    const [result] = await database.execute<ResultSetHeader>(
      "UPDATE users SET active = ? WHERE id = ? AND role = 'user'",
      [active, userId],
    );
    if (result.affectedRows === 0) {
      response.status(404).json({ error: "No se encontró un usuario que pueda modificarse." });
      return;
    }

    const [rows] = await database.execute<UserRow[]>(
      `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );
    response.json(toPublicUser(rows[0]));
  } catch (error) {
    console.error("Unable to update user status in MySQL:", error);
    response.status(500).json({ error: "No se pudo actualizar el estado del usuario." });
  }
});

authRouter.delete("/users/:id", requireAdmin, async (request, response) => {
  const userId = request.params.id;
  if (!userId) {
    response.status(400).json({ error: "El identificador del usuario no es válido." });
    return;
  }
  if (userId === request.session.userId) {
    response.status(400).json({ error: "No puedes eliminar tu propia cuenta administradora." });
    return;
  }

  try {
    const [result] = await database.execute<ResultSetHeader>(
      "DELETE FROM users WHERE id = ? AND role = 'user'",
      [userId],
    );
    if (result.affectedRows === 0) {
      response.status(404).json({ error: "No se encontró un usuario que pueda eliminarse." });
      return;
    }
    response.status(204).end();
  } catch (error) {
    console.error("Unable to delete user from MySQL:", error);
    response.status(500).json({ error: "No se pudo eliminar el usuario." });
  }
});

authRouter.post("/register", async (request, response) => {
  const input = isRecord(request.body)
    ? (request.body as RegistrationInput)
    : {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!name || name.length > 100 || !isEmail(email) || phone.length > 32) {
    response.status(400).json({ error: "Los datos del registro no son válidos." });
    return;
  }

  if (password.length < 8 || password.length > 128) {
    response.status(400).json({
      error: "La contraseña debe tener entre 8 y 128 caracteres.",
    });
    return;
  }

  try {
    const userId = randomUUID();
    const passwordHash = await hashPassword(password);
    const [result] = await database.execute(
      `INSERT INTO users (id, name, email, password_hash, role, phone)
       VALUES (?, ?, ?, ?, 'user', ?)
      `,
      [userId, name, email, passwordHash, phone],
    );

    if (!("affectedRows" in result) || result.affectedRows !== 1) {
      throw new Error("User registration did not insert a row");
    }

    await saveSession(request, userId);
    response.status(201).json({
      id: userId,
      name,
      email,
      role: "user",
      phone,
      preferredChannel: "sms_visual",
      active: true,
      registeredDate: new Date().toLocaleDateString("es-CO"),
      totalOrdersCount: 0,
    } satisfies UserAccount);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      response.status(409).json({ error: "Ese correo ya tiene una cuenta." });
      return;
    }

    try {
      const account = await registerFallbackUser({ name, email, phone, password });
      await saveSession(request, account.id);
      response.status(201).json(account);
    } catch (fallbackError) {
      if (
        typeof fallbackError === "object" &&
        fallbackError !== null &&
        "code" in fallbackError &&
        fallbackError.code === "ER_DUP_ENTRY"
      ) {
        response.status(409).json({ error: "Ese correo ya tiene una cuenta." });
        return;
      }

      console.error("User registration failed:", error, fallbackError);
      response.status(500).json({ error: "No se pudo completar el registro." });
    }
  }
});

authRouter.post("/login", async (request, response) => {
  const input = isRecord(request.body) ? (request.body as LoginInput) : {};
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (
    !isEmail(email) ||
    password.length === 0 ||
    password.length > 128
  ) {
    response.status(400).json({ error: "Correo o contraseña inválidos." });
    return;
  }

  try {
    const [rows] = await database.execute<UserRow[]>(
      `SELECT id, name, email, password_hash AS passwordHash, role, phone,
        preferred_channel AS preferredChannel, active,
        DATE_FORMAT(created_at, '%d/%m/%Y') AS registeredDate
       FROM users WHERE email = ? LIMIT 1`,
      [email],
    );
    const user = rows[0];

    if (
      !user ||
      !(user.active === true || Number(user.active) === 1) ||
      !user.passwordHash ||
      !(await verifyPassword(password, user.passwordHash))
    ) {
      response.status(401).json({ error: "Correo o contraseña incorrectos." });
      return;
    }

    await saveSession(request, user.id);
    response.json(toPublicUser(user));
  } catch (error) {
    const fallbackUser = await verifyFallbackUser(email, password);
    if (!fallbackUser) {
      console.error("User login failed:", error);
      response.status(401).json({ error: "Correo o contraseña incorrectos." });
      return;
    }

    await saveSession(request, fallbackUser.id);
    response.json(fallbackUser);
  }
});

authRouter.post("/password-reset/request", async (request, response) => {
  const now = Date.now();
  const clientIp = request.ip ?? request.socket.remoteAddress ?? "unknown";
  for (const [ip, timestamps] of passwordResetRequestsByIp) {
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < 15 * 60 * 1000,
    );
    if (recentTimestamps.length === 0) {
      passwordResetRequestsByIp.delete(ip);
    } else {
      passwordResetRequestsByIp.set(ip, recentTimestamps);
    }
  }
  const requestWindow = (passwordResetRequestsByIp.get(clientIp) ?? []).filter(
    (timestamp) => now - timestamp < 15 * 60 * 1000,
  );
  if (requestWindow.length >= 5) {
    response.status(429).json({
      error: "Se alcanzó el límite de solicitudes. Inténtalo de nuevo más tarde.",
    });
    return;
  }
  requestWindow.push(now);
  passwordResetRequestsByIp.set(clientIp, requestWindow);

  const input = isRecord(request.body)
    ? (request.body as PasswordResetRequestInput)
    : {};
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (!isEmail(email)) {
    response.status(400).json({ error: "Ingresa un correo electrónico válido." });
    return;
  }
  if (!isPasswordResetEmailConfigured()) {
    response.status(503).json({
      error: "La recuperación requiere configurar el envío de correo SMTP.",
    });
    return;
  }

  try {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token_hash CHAR(64) NOT NULL,
        user_id CHAR(36) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (token_hash),
        INDEX password_reset_user_idx (user_id),
        INDEX password_reset_expiry_idx (expires_at),
        CONSTRAINT password_reset_user_fk
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    const [rows] = await database.execute<UserRow[]>(
      `SELECT id, email FROM users
       WHERE email = ? AND active = TRUE
       LIMIT 1`,
      [email],
    );
    const user = rows[0];
    if (!user) {
      response.json({
        message: "Si el correo corresponde a una cuenta activa, recibirás instrucciones.",
      });
      return;
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    await database.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [user.id],
    );
    await database.execute(
      `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
       VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE))`,
      [tokenHash, user.id],
    );
    try {
      await sendPasswordResetEmail(user.email, createPasswordResetUrl(token));
    } catch {
      await database.execute(
        "DELETE FROM password_reset_tokens WHERE token_hash = ?",
        [tokenHash],
      );
      console.error("Password reset email delivery failed.");
      response.status(503).json({
        error: "No se pudo enviar el correo de recuperación. Verifica la configuración SMTP.",
      });
      return;
    }
  } catch (error) {
    try {
      const fallbackUser = findFallbackUserByEmail(email);
      if (!fallbackUser?.active) {
        throw error;
      }
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(token);
      fallbackPasswordResetTokens.set(tokenHash, {
        userId: fallbackUser.id,
        expiresAt: Date.now() + PASSWORD_RESET_TTL_MS,
      });
      try {
        await sendPasswordResetEmail(
          fallbackUser.email,
          createPasswordResetUrl(token),
        );
      } catch (fallbackError) {
        fallbackPasswordResetTokens.delete(tokenHash);
        throw fallbackError;
      }
    } catch (fallbackError) {
      console.error("Password reset request failed:", fallbackError);
      response.status(503).json({
        error: "No se pudo enviar el correo de recuperación. Inténtalo más tarde.",
      });
      return;
    }
  }

  response.json({
    message: "Si el correo corresponde a una cuenta activa, recibirás instrucciones.",
  });
});

authRouter.post("/password-reset/confirm", async (request, response) => {
  const input = isRecord(request.body)
    ? (request.body as PasswordResetConfirmInput)
    : {};
  const token = typeof input.token === "string" ? input.token : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!/^[\da-f]{64}$/i.test(token) || password.length < 8 || password.length > 128) {
    response.status(400).json({
      error: "El enlace o la contraseña no son válidos. Usa una contraseña de 8 a 128 caracteres.",
    });
    return;
  }

  const tokenHash = hashResetToken(token);
  let connection: Awaited<ReturnType<typeof database.getConnection>> | null = null;
  try {
    connection = await database.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT u.id FROM password_reset_tokens AS reset
       JOIN users AS u ON u.id = reset.user_id
       WHERE reset.token_hash = ? AND reset.expires_at > UTC_TIMESTAMP()
         AND u.active = TRUE
       LIMIT 1 FOR UPDATE`,
      [tokenHash],
    );
    const user = rows[0];
    if (!user) {
      await connection.rollback();
      response.status(400).json({
        error: "El enlace de recuperación venció o ya fue utilizado. Solicita uno nuevo.",
      });
      return;
    }

    const passwordHash = await hashPassword(password);
    await connection.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, user.id],
    );
    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [user.id],
    );
    await connection.commit();
    response.json({ message: "La contraseña se restableció correctamente." });
  } catch (error) {
    if (connection) await connection.rollback();

    const fallbackReset = fallbackPasswordResetTokens.get(tokenHash);
    if (
      !fallbackReset ||
      fallbackReset.expiresAt <= Date.now() ||
      !(await updateFallbackUserPassword(fallbackReset.userId, password))
    ) {
      console.error("Password reset confirmation failed:", error);
      response.status(400).json({
        error: "El enlace de recuperación venció o ya fue utilizado. Solicita uno nuevo.",
      });
      return;
    }
    fallbackPasswordResetTokens.delete(tokenHash);
    for (const [hash, reset] of fallbackPasswordResetTokens) {
      if (reset.userId === fallbackReset.userId) fallbackPasswordResetTokens.delete(hash);
    }
    response.json({ message: "La contraseña se restableció correctamente." });
  } finally {
    connection?.release();
  }
});

authRouter.get("/me", async (request, response) => {
  if (!request.session.userId) {
    response.status(401).json({ error: "No hay una sesión activa." });
    return;
  }

  try {
    const [rows] = await database.execute<UserRow[]>(
      `SELECT ${PUBLIC_USER_COLUMNS}
       FROM users WHERE id = ? LIMIT 1`,
      [request.session.userId],
    );
    const user = rows[0];

    if (!user || !(user.active === true || Number(user.active) === 1)) {
      await destroySession(request);
      response.clearCookie("connect.sid", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      response.status(401).json({ error: "La cuenta no está activa." });
      return;
    }

    response.json(toPublicUser(user));
  } catch (error) {
    const fallbackUser = findFallbackUserById(request.session.userId);
    if (!fallbackUser || !fallbackUser.active) {
      await destroySession(request);
      response.clearCookie("connect.sid", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      response.status(401).json({ error: "La cuenta no está activa." });
      return;
    }

    response.json(toPublicUser(fallbackUser));
  }
});

authRouter.post("/logout", async (request, response) => {
  try {
    await destroySession(request);
    response.clearCookie("connect.sid", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.status(204).end();
  } catch (error) {
    console.error("Logout failed:", error);
    response.status(500).json({ error: "No se pudo cerrar la sesión." });
  }
});

authRouter.post("/activity", (request, response) => {
  if (!request.session.userId) {
    response.status(401).json({ error: "No hay una sesión activa." });
    return;
  }
  response.status(204).end();
});
