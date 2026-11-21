import assert from "node:assert/strict";
import test from "node:test";
import session, { type SessionData } from "express-session";
import {
  deleteCustomerAccount,
  revokeUserSessions,
} from "./accountDeletion";
import { MysqlSessionStore } from "./mysqlSessionStore";

test("revokes the deleted customer's sessions in the same deletion flow", async () => {
  const calls: string[] = [];
  const deleted = await deleteCustomerAccount("customer-1", {
    deleteCustomer: async (userId) => {
      calls.push(`delete:${userId}`);
      return true;
    },
    revokeSessions: async (userId) => {
      calls.push(`revoke:${userId}`);
    },
  });

  assert.equal(deleted, true);
  assert.deepEqual(calls, ["delete:customer-1", "revoke:customer-1"]);
});

test("does not revoke sessions when the target is not a customer", async () => {
  let revokeCalled = false;
  const deleted = await deleteCustomerAccount("admin-1", {
    deleteCustomer: async () => false,
    revokeSessions: async () => {
      revokeCalled = true;
    },
  });

  assert.equal(deleted, false);
  assert.equal(revokeCalled, false);
});

test("revokes sessions by the stored userId using a bound parameter", async () => {
  let recordedQuery = "";
  let recordedValues: string[] = [];
  await revokeUserSessions("customer-1", async (query, values) => {
    recordedQuery = query;
    recordedValues = values;
  });

  assert.match(recordedQuery, /JSON_UNQUOTE\(JSON_EXTRACT\(session_data,/);
  assert.match(recordedQuery, /'\$\.userId'\)\)\s*=\s*\?/);
  assert.match(recordedQuery, /JSON_VALID\(session_data\)/);
  assert.deepEqual(recordedValues, ["customer-1"]);
});

test("revokes fallback sessions only for the deleted customer", async () => {
  const memoryStore = new session.MemoryStore();
  const mysqlStore = new MysqlSessionStore(600_000, memoryStore);
  const customerSession: SessionData = {
    cookie: new session.Cookie(),
    userId: "customer-1",
  };
  const otherSession: SessionData = {
    cookie: new session.Cookie(),
    userId: "customer-2",
  };
  await Promise.all([
    new Promise<void>((resolve) => {
      memoryStore.set("customer-session", customerSession, () => resolve());
    }),
    new Promise<void>((resolve) => {
      memoryStore.set("other-session", otherSession, () => resolve());
    }),
  ]);

  await mysqlStore.destroyFallbackSessionsForUser("customer-1");

  const customerSessionAfterDeletion = await new Promise<SessionData | null>(
    (resolve, reject) => {
      memoryStore.get("customer-session", (error, storedSession) => {
        if (error) reject(error);
        else resolve(storedSession ?? null);
      });
    },
  );
  const otherSessionAfterDeletion = await new Promise<SessionData | null>(
    (resolve, reject) => {
      memoryStore.get("other-session", (error, storedSession) => {
        if (error) reject(error);
        else resolve(storedSession ?? null);
      });
    },
  );

  assert.equal(customerSessionAfterDeletion, null);
  assert.equal(otherSessionAfterDeletion?.userId, "customer-2");
});
