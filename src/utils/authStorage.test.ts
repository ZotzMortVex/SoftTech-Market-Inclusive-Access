import test from "node:test";
import assert from "node:assert/strict";

import {
  appendUserToStorage,
  loadStoredUsers,
  replaceUserInStorage,
} from "./authStorage";

type TestUser = {
  id: string;
  name: string;
  email: string;
  role: "visitor" | "user" | "admin";
  phone: string;
  preferredChannel: "sms_visual" | "email_escrito" | "portal";
  active: boolean;
  registeredDate: string;
  totalOrdersCount: number;
  password?: string;
};

const createStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

const baseUser: TestUser = {
  id: "usr-1",
  name: "Ana",
  email: "ana@example.com",
  role: "user",
  phone: "+57 300 111 1111",
  preferredChannel: "sms_visual",
  active: true,
  registeredDate: "Hoy",
  totalOrdersCount: 0,
  password: "secret123",
};

const secondUser: TestUser = {
  ...baseUser,
  id: "usr-2",
  name: "Luis",
  email: "luis@example.com",
};

function withoutPassword(user: TestUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

test("appendUserToStorage keeps the stored users list synced with the new registration", () => {
  globalThis.localStorage = createStorageMock() as Storage;

  const nextUsers = appendUserToStorage([baseUser], secondUser);

  assert.deepEqual(nextUsers, [
    withoutPassword(baseUser),
    withoutPassword(secondUser),
  ]);
  assert.deepEqual(
    JSON.parse(
      globalThis.localStorage.getItem("softtech_market_users_v1") ?? "[]",
    ),
    [withoutPassword(baseUser), withoutPassword(secondUser)],
  );
});

test("replaceUserInStorage updates the saved role without leaving stale data behind", () => {
  globalThis.localStorage = createStorageMock() as Storage;

  const updatedUser = { ...baseUser, role: "admin" as const };
  const nextUsers = replaceUserInStorage([baseUser], updatedUser);

  assert.equal(nextUsers[0].role, "admin");
  assert.deepEqual(
    JSON.parse(
      globalThis.localStorage.getItem("softtech_market_users_v1") ?? "[]",
    ),
    [withoutPassword(updatedUser)],
  );
});

test("appendUserToStorage avoids duplicate registrations for the same user", () => {
  globalThis.localStorage = createStorageMock() as Storage;

  const nextUsers = appendUserToStorage([baseUser], baseUser);

  assert.deepEqual(nextUsers, [withoutPassword(baseUser)]);
  assert.deepEqual(
    JSON.parse(
      globalThis.localStorage.getItem("softtech_market_users_v1") ?? "[]",
    ),
    [withoutPassword(baseUser)],
  );
});

test("legacy cached demo users are removed from the stored user list", () => {
  globalThis.localStorage = createStorageMock() as Storage;
  globalThis.localStorage.setItem(
    "softtech_market_users_v1",
    JSON.stringify([baseUser]),
  );

  assert.deepEqual(loadStoredUsers(), []);
  assert.equal(
    globalThis.localStorage.getItem("softtech_market_users_v1"),
    null,
  );
});
