// app/(app)/layout.tsx
import AppShell from "@/components/shell/AppShell";
import AuthHydrator from "@/components/auth/AuthHydrator";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName } from "../../lib/auth"; // adjust if your lib path differs

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(cookieName)?.value; // if sync in your version: cookies().get(...)
  if (!token) redirect("/login");
  return (
    <AppShell>
      <AuthHydrator />
      {children}
    </AppShell>
  );
}
