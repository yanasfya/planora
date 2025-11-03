"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/(app)/dashboard";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: formData.get("email"),
      password: formData.get("password"),
      callbackUrl
    });
    setIsLoading(false);
    if (result?.error) {
      toast({ title: "Login failed", description: result.error, variant: "destructive" });
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue planning with Planora.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input name="password" type="password" required placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <Button variant="outline" onClick={() => signIn("google", { callbackUrl })} className="w-full">
        Continue with Google
      </Button>
    </div>
  );
}
