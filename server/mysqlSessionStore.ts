import session, { Store, type SessionData } from "express-session";
import type { RowDataPacket } from "mysql2";
import { database } from "./db";

interface StoredSessionRow extends RowDataPacket {
  sessionData: string;
  expiresAt: number;
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error("MySQL session store failed");
}

export class MysqlSessionStore extends Store {
  private readonly memoryStore = new session.MemoryStore();

  constructor(private readonly sessionDurationMs: number) {
    super();
  }

  get(
    sessionId: string,
    callback: (error: Error | null, value?: SessionData | null) => void,
  ): void {
    void database
      .execute<StoredSessionRow[]>(
        `SELECT session_data AS sessionData, expires_at AS expiresAt
         FROM user_sessions WHERE session_id = ? LIMIT 1`,
        [sessionId],
      )
      .then(async ([rows]) => {
        const stored = rows[0];
        if (!stored) {
          this.memoryStore.get(sessionId, (memoryError, value) => {
            callback(memoryError ?? null, value ?? null);
          });
          return;
        }

        if (Number(stored.expiresAt) <= Date.now()) {
          await database.execute(
            "DELETE FROM user_sessions WHERE session_id = ?",
            [sessionId],
          );
          callback(null, null);
          return;
        }

        const parsed = JSON.parse(stored.sessionData) as SessionData;
        if (typeof parsed.cookie.expires === "string") {
          parsed.cookie.expires = new Date(parsed.cookie.expires);
        }
        callback(null, parsed);
      })
      .catch((error: unknown) => {
        this.memoryStore.get(sessionId, (memoryError, value) => {
          callback(memoryError ?? asError(error), value ?? null);
        });
      });
  }

  set(
    sessionId: string,
    sessionData: SessionData,
    callback?: (error?: Error) => void,
  ): void {
    const expiresAt =
      sessionData.cookie.expires?.getTime() ??
      Date.now() + this.sessionDurationMs;

    void database
      .execute(
        `INSERT INTO user_sessions (session_id, expires_at, session_data)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at),
           session_data = VALUES(session_data)`,
        [sessionId, expiresAt, JSON.stringify(sessionData)],
      )
      .then(() => callback?.())
      .catch((error: unknown) => {
        this.memoryStore.set(sessionId, sessionData, () => {
          callback?.(undefined);
        });
        if (callback) {
          console.warn("Falling back to in-memory session storage after MySQL failure.", asError(error).message);
        }
      });
  }

  touch(
    sessionId: string,
    sessionData: SessionData,
    callback?: (error?: Error) => void,
  ): void {
    const expiresAt =
      sessionData.cookie.expires?.getTime() ??
      Date.now() + this.sessionDurationMs;

    void database
      .execute(
        "UPDATE user_sessions SET expires_at = ? WHERE session_id = ?",
        [expiresAt, sessionId],
      )
      .then(() => {
        this.memoryStore.touch(sessionId, sessionData, () => callback?.());
      })
      .catch((error: unknown) => {
        this.memoryStore.touch(sessionId, sessionData, () => callback?.());
        if (callback) {
          console.warn(
            "Falling back to in-memory session renewal after MySQL failure.",
            asError(error).message,
          );
        }
      });
  }

  destroy(
    sessionId: string,
    callback?: (error?: Error) => void,
  ): void {
    void database
      .execute("DELETE FROM user_sessions WHERE session_id = ?", [sessionId])
      .then(() => callback?.())
      .catch((error: unknown) => {
        this.memoryStore.destroy(sessionId, () => {
          callback?.();
        });
        if (callback) {
          console.warn("Falling back to in-memory session cleanup after MySQL failure.", asError(error).message);
        }
      });
  }
}
