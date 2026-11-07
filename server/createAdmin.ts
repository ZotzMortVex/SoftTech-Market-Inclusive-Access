import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { randomUUID } from "node:crypto";
import { stdin, stdout } from "node:process";
import type { RowDataPacket } from "mysql2";
import { database } from "./db";
import { hashPassword } from "./password";

function promptHidden(label: string): Promise<string> {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    return Promise.reject(
      new Error("Create the administrator from an interactive terminal."),
    );
  }

  stdout.write(label);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = "";

    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };

    const onData = (chunk: Buffer | string) => {
      for (const character of chunk.toString()) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Administrator creation cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function createInitialAdmin(): Promise<void> {
  const prompt = createInterface({ input: stdin, output: stdout });
  let name: string;
  let email: string;

  try {
    name = (await prompt.question("Nombre del administrador: ")).trim();
    email = (await prompt.question("Correo del administrador: "))
      .trim()
      .toLowerCase();
  } finally {
    prompt.close();
  }

  const password = await promptHidden("Contraseña (8 a 128 caracteres): ");
  const confirmation = await promptHidden("Confirma la contraseña: ");

  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("The administrator name or email is invalid.");
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error("The password must contain between 8 and 128 characters.");
  }
  if (password !== confirmation) {
    throw new Error("The passwords do not match.");
  }

  const connection = await database.getConnection();
  let lockAcquired = false;
  try {
    await connection.beginTransaction();
    const [lockRows] = await connection.query<RowDataPacket[]>(
      "SELECT GET_LOCK('softtech-market-admin-bootstrap', 10) AS acquired",
    );
    if (Number(lockRows[0]?.acquired) !== 1) {
      throw new Error("Could not obtain the administrator bootstrap lock.");
    }
    lockAcquired = true;

    const [admins] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS adminCount FROM users WHERE role = 'admin'",
    );

    if (Number(admins[0]?.adminCount) > 0) {
      throw new Error("An administrator account already exists.");
    }

    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role, phone, preferred_channel)
       VALUES (?, ?, ?, ?, 'admin', '', 'portal')`,
      [randomUUID(), name, email, await hashPassword(password)],
    );
    await connection.commit();
    console.info(`Administrator account created for ${email}.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    try {
      if (lockAcquired) {
        await connection.query(
          "SELECT RELEASE_LOCK('softtech-market-admin-bootstrap')",
        );
      }
    } finally {
      connection.release();
    }
  }
}

createInitialAdmin()
  .catch((error: unknown) => {
    console.error("Unable to create the administrator:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.end();
  });
