import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c5cfc 0%, transparent 70%)", filter: "blur(120px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #c084fc 0%, transparent 70%)", filter: "blur(100px)" }} />

      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm relative z-10 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" className="mb-4">
            <circle cx="16" cy="16" r="3.5" fill="#7c5cfc" />
            <circle cx="16" cy="5" r="2" fill="#c084fc" />
            <circle cx="25.5" cy="10.5" r="2" fill="#c084fc" />
            <circle cx="25.5" cy="21.5" r="2" fill="#a870fc" />
            <circle cx="16" cy="27" r="2" fill="#a870fc" />
            <circle cx="6.5" cy="21.5" r="2" fill="#c084fc" />
            <circle cx="6.5" cy="10.5" r="2" fill="#c084fc" />
            <line x1="16" y1="12.5" x2="16" y2="7" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
            <line x1="19" y1="14" x2="23.5" y2="11.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
            <line x1="19" y1="18" x2="23.5" y2="20.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
            <line x1="16" y1="19.5" x2="16" y2="25" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
            <line x1="13" y1="18" x2="8.5" y2="20.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
            <line x1="13" y1="14" x2="8.5" y2="11.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
          </svg>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Milanesa OS</h1>
          <p className="text-xs text-muted-foreground mt-1">Ingresa a tu cuenta</p>
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-[10px] text-muted-foreground">
            un producto de <span style={{ color: "#7c5cfc" }} className="font-medium">Qngine</span>
          </p>
        </div>
      </div>
    </div>
  );
}
