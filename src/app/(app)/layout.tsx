import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userName={user.name} branchName={user.branch.name} businessName={user.branch.business.name} />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-end px-6 sticky top-0 z-20">
          <UserMenu userName={user.name} userEmail={user.email} userRole={user.role} />
        </header>
        <div className="flex-1 p-6">{children}</div>
        <footer className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>un producto de</span>
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="3" fill="#7c5cfc" />
              <circle cx="16" cy="6" r="1.5" fill="#c084fc" />
              <circle cx="24.66" cy="11" r="1.5" fill="#c084fc" />
              <circle cx="24.66" cy="21" r="1.5" fill="#a870fc" />
              <circle cx="16" cy="26" r="1.5" fill="#a870fc" />
              <circle cx="7.34" cy="21" r="1.5" fill="#c084fc" />
              <circle cx="7.34" cy="11" r="1.5" fill="#c084fc" />
            </svg>
            <span className="font-medium" style={{ color: "#7c5cfc" }}>Qngine</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
