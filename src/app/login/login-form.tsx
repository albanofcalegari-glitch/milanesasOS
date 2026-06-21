"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { login } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@milanesaos.com");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Ingresa tu email");
      return;
    }
    setLoading(true);
    const res = await login(email);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Bienvenido, ${res.data?.name}`);
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@milanesaos.com"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Ingresando..." : "Ingresar"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Demo: admin@milanesaos.com
      </p>
    </form>
  );
}
