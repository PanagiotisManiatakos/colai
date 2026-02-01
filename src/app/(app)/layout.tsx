import AppShell from "@/components/shell/AppShell";
import AuthHydrator from "@/components/auth/AuthHydrator";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthHydrator />
      <RequireAuth>{children}</RequireAuth>
    </AppShell>
  );
}
