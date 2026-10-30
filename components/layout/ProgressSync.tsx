import { getAccount } from "@/lib/account";
import { ProgressSyncClient } from "./ProgressSyncClient";

/** Async server component that passes the signed-in user's id to the client sync layer. Guests get nothing. */
export default async function ProgressSync() {
  const account = await getAccount();
  if (!account) return null;
  // The email doubles as the user id for the owner tag. getClaims().sub would be more precise,
  // but the account helper already ran and the email is unique per Supabase project.
  return <ProgressSyncClient userId={account.email} />;
}
