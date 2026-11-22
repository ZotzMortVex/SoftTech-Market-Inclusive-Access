export interface AccountDeletionStore {
  deleteCustomer(userId: string): Promise<boolean>;
  revokeSessions(userId: string): Promise<void>;
}

export type SessionRevocationExecutor = (
  query: string,
  values: string[],
) => Promise<void>;

export async function deleteCustomerAccount(
  userId: string,
  store: AccountDeletionStore,
): Promise<boolean> {
  if (!(await store.deleteCustomer(userId))) {
    return false;
  }

  await store.revokeSessions(userId);
  return true;
}

export async function revokeUserSessions(
  userId: string,
  execute: SessionRevocationExecutor,
): Promise<void> {
  await execute(
    `DELETE FROM user_sessions
     WHERE JSON_VALID(session_data)
       AND JSON_UNQUOTE(JSON_EXTRACT(session_data, '$.userId')) = ?`,
    [userId],
  );
}
