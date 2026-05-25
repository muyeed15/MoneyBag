"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState = { error: null };

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex flex-col bg-sage">
      {/* Top color block */}
      <div className="bg-teal px-6 pt-12 pb-10">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
          Welcome to
        </p>
        <h1 className="text-white text-3xl font-bold tracking-tight">
          MoneyBag
        </h1>
        <p className="text-white/70 text-sm mt-1">Mobile financial services</p>
      </div>

      {/* Form block */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-sage-mid px-6 py-8 sm:max-w-sm sm:mx-auto sm:w-full sm:mt-8 sm:border sm:border-sage-mid">
          <h2 className="text-navy font-bold text-lg mb-5">
            Sign in to your account
          </h2>

          {state.error && (
            <div className="mb-4 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="01XXXXXXXXX"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
            <div className="pt-2">
              <Button
                type="submit"
                variant="cta"
                size="lg"
                loading={pending}
                className="w-full"
              >
                {pending ? "Signing in…" : "Sign In"}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-navy-muted mt-6">
          MoneyBag · Secure Digital Wallet
        </p>
      </div>
    </div>
  );
}
