import { UserAccount, UserRole } from "../types";

const USERS_STORAGE_KEY = "softtech_market_users_v1";
const VALID_ROLES: UserRole[] = ["visitor", "user", "admin"];
const VALID_PREFERRED_CHANNELS: UserAccount["preferredChannel"][] = [
  "sms_visual",
  "email_escrito",
  "portal",
];

function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && VALID_ROLES.includes(value as UserRole);
}

function isValidPreferredChannel(
  value: unknown,
): value is UserAccount["preferredChannel"] {
  return (
    typeof value === "string" &&
    VALID_PREFERRED_CHANNELS.includes(
      value as UserAccount["preferredChannel"],
    )
  );
}

function normalizeUser(value: unknown): UserAccount | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<UserAccount>;
  const role = candidate.role;

  if (
    !candidate.id ||
    !candidate.name ||
    !candidate.email ||
    !isValidRole(role)
  ) {
    return null;
  }

  const preferredChannel = candidate.preferredChannel;
  const normalizedChannel = isValidPreferredChannel(preferredChannel)
    ? preferredChannel
    : "portal";

  return {
    id: String(candidate.id),
    name: String(candidate.name),
    email: String(candidate.email).trim().toLowerCase(),
    role,
    phone: String(candidate.phone ?? ""),
    preferredChannel: normalizedChannel,
    active: Boolean(candidate.active),
    registeredDate: String(candidate.registeredDate ?? "Hoy"),
    totalOrdersCount: Number(candidate.totalOrdersCount ?? 0),
  };
}

function sanitizeUsersList(users: unknown): UserAccount[] {
  if (!Array.isArray(users)) {
    return [];
  }

  return users
    .map((user) => normalizeUser(user))
    .filter((user): user is UserAccount => Boolean(user));
}

/** Clears legacy demo accounts; the authenticated API is the source of truth. */
export function loadStoredUsers(): UserAccount[] {
  try {
    localStorage.removeItem(USERS_STORAGE_KEY);
  } catch (err) {
    console.warn("Error removing legacy stored users:", err);
  }

  return [];
}

/**
 * Saves users list to localStorage.
 */
export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(sanitizeUsersList(users)),
    );
  } catch (err) {
    console.warn("Error saving users to storage:", err);
  }
}

/**
 * Appends a new user to the saved collection and keeps localStorage in sync.
 */
export function appendUserToStorage(
  currentUsers: UserAccount[],
  newUser: UserAccount,
): UserAccount[] {
  const safeCurrentUsers = sanitizeUsersList(currentUsers);
  const normalizedUser = normalizeUser(newUser);

  if (!normalizedUser) {
    return safeCurrentUsers;
  }

  const hasDuplicate = safeCurrentUsers.some(
    (user) =>
      user.id === normalizedUser.id ||
      user.email.toLowerCase() === normalizedUser.email.toLowerCase(),
  );

  if (hasDuplicate) {
    saveStoredUsers(safeCurrentUsers);
    return safeCurrentUsers;
  }

  const nextUsers = [...safeCurrentUsers, normalizedUser];
  saveStoredUsers(nextUsers);
  return nextUsers;
}

/**
 * Replaces a specific user in the stored collection without leaving stale data behind.
 */
export function replaceUserInStorage(
  currentUsers: UserAccount[],
  updatedUser: UserAccount,
): UserAccount[] {
  const safeCurrentUsers = sanitizeUsersList(currentUsers);
  const normalizedUser = normalizeUser(updatedUser);

  if (!normalizedUser) {
    return safeCurrentUsers;
  }

  const nextUsers = safeCurrentUsers.map((user) =>
    user.id === normalizedUser.id ? normalizedUser : user,
  );

  saveStoredUsers(nextUsers);
  return nextUsers;
}
