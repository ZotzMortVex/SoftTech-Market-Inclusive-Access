import { randomUUID } from "node:crypto";
import { INITIAL_PRODUCTS } from "../src/data/mockData";
import type { Product, UserAccount } from "../src/types";
import { hashPassword, verifyPassword } from "./password";

export type ProductWriteInput = Omit<Product, "id">;

export type FallbackUser = Omit<UserAccount, "role"> & {
  role: "user" | "admin";
  passwordHash: string;
};

const cloneArray = <T>(items: T[]): T[] => items.map((item) => structuredClone(item));

const cloneProduct = (product: Product): Product => ({
  ...product,
  images: {
    ...product.images,
    angles: cloneArray(product.images.angles),
  },
  specs: cloneArray(product.specs),
  inclusiveFeatures: [...product.inclusiveFeatures],
});

export const fallbackProducts: Product[] = INITIAL_PRODUCTS.map((product) => cloneProduct(product));

export const fallbackUsers = new Map<string, FallbackUser>();
const fallbackUsersByEmail = new Map<string, FallbackUser>();

export function toPublicUser(
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    phone: string;
    preferredChannel: UserAccount["preferredChannel"];
    active: boolean | number;
    registeredDate: string;
    totalOrdersCount?: number;
    passwordHash?: string;
  },
): UserAccount {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return {
    ...publicUser,
    active: publicUser.active === true || Number(publicUser.active) === 1,
    totalOrdersCount: publicUser.totalOrdersCount ?? 0,
  };
}

export async function ensureDefaultAdmin(): Promise<void> {
  const adminEmail = "admin@softtech.test";
  if (fallbackUsersByEmail.has(adminEmail)) {
    return;
  }

  const admin: FallbackUser = {
    id: "admin-fallback",
    name: "Administrador",
    email: adminEmail,
    role: "admin",
    phone: "+573001112233",
    preferredChannel: "portal",
    active: true,
    registeredDate: new Date().toLocaleDateString("es-CO"),
    totalOrdersCount: 0,
    passwordHash: await hashPassword("Admin123!"),
  };

  fallbackUsers.set(admin.id, admin);
  fallbackUsersByEmail.set(admin.email, admin);
}

export function findFallbackUserByEmail(email: string): FallbackUser | null {
  return fallbackUsersByEmail.get(email.trim().toLowerCase()) ?? null;
}

export function findFallbackUserById(userId: string): FallbackUser | null {
  return fallbackUsers.get(userId) ?? null;
}

export async function registerFallbackUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<UserAccount> {
  const email = input.email.trim().toLowerCase();
  if (fallbackUsersByEmail.has(email)) {
    const error = new Error("Ese correo ya tiene una cuenta.");
    Object.assign(error, { code: "ER_DUP_ENTRY" });
    throw error;
  }

  const userId = randomUUID();
  const user: FallbackUser = {
    id: userId,
    name: input.name.trim(),
    email,
    role: "user",
    phone: input.phone.trim(),
    preferredChannel: "sms_visual",
    active: true,
    registeredDate: new Date().toLocaleDateString("es-CO"),
    totalOrdersCount: 0,
    passwordHash: await hashPassword(input.password),
  };

  fallbackUsers.set(userId, user);
  fallbackUsersByEmail.set(email, user);
  return toPublicUser(user);
}

export async function verifyFallbackUser(
  email: string,
  password: string,
): Promise<UserAccount | null> {
  const user = findFallbackUserByEmail(email);
  if (!user || !user.active) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return toPublicUser(user);
}

export async function updateFallbackUserPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  const user = findFallbackUserById(userId);
  if (!user) return false;
  user.passwordHash = await hashPassword(password);
  return true;
}

export function listFallbackProducts(): Product[] {
  return fallbackProducts.map((product) => cloneProduct(product));
}

export function findFallbackProduct(productId: string): Product | null {
  const product = fallbackProducts.find((item) => item.id === productId);
  return product ? cloneProduct(product) : null;
}

export function createFallbackProduct(product: ProductWriteInput): Product {
  const duplicate = fallbackProducts.some((item) => item.code === product.code);
  if (duplicate) {
    const error = new Error("Ya existe un producto con ese código.");
    Object.assign(error, { code: "ER_DUP_ENTRY" });
    throw error;
  }

  const created: Product = {
    ...product,
    id: randomUUID(),
  };

  fallbackProducts.push(created);
  return cloneProduct(created);
}

export function updateFallbackProduct(
  productId: string,
  product: ProductWriteInput,
): Product | null {
  const index = fallbackProducts.findIndex((item) => item.id === productId);
  if (index === -1) {
    return null;
  }

  const duplicate = fallbackProducts.some(
    (item) => item.id !== productId && item.code === product.code,
  );
  if (duplicate) {
    const error = new Error("Ya existe un producto con ese código.");
    Object.assign(error, { code: "ER_DUP_ENTRY" });
    throw error;
  }

  const updated: Product = {
    ...fallbackProducts[index],
    ...product,
    id: productId,
  };
  fallbackProducts[index] = updated;
  return cloneProduct(updated);
}

export function setFallbackProductStatus(
  productId: string,
  active: boolean,
): Product | null {
  const index = fallbackProducts.findIndex((item) => item.id === productId);
  if (index === -1) {
    return null;
  }

  const updated = { ...fallbackProducts[index], active };
  fallbackProducts[index] = updated;
  return cloneProduct(updated);
}

export function deleteFallbackProduct(productId: string): Product | null {
  const index = fallbackProducts.findIndex((item) => item.id === productId);
  if (index === -1) {
    return null;
  }

  const updated = { ...fallbackProducts[index], active: false };
  fallbackProducts[index] = updated;
  return cloneProduct(updated);
}
