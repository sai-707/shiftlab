import { getAccount } from "@/lib/account";
import { ProgressSyncClient } from "./ProgressSyncClient";

/** Async server component that tells the client sync layer who is signed in (the email is the owner tag) or null for a guest. */
export default async function ProgressSync() {
  const account = await getAccount();
  return <ProgressSyncClient userId={account ? account.email : null} />;
}
