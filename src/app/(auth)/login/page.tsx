"use client";

import Image from "next/image";
import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 p-4">
      <Image
        src="/storefront/login-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <Card className="relative z-10 w-full max-w-md border-0 bg-card shadow-[0_24px_70px_-28px_rgba(31,41,55,0.28)]">
        <CardHeader>
          <Image
            src="/storefront/logo-dark.svg"
            alt="Бутик Емоция"
            width={180}
            height={72}
            priority
            className="mb-2 h-auto w-40 sm:w-44"
          />
          <CardDescription>
            Влезте, за да управлявате магазина.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {state?.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full bg-[#453C60] text-base text-white hover:bg-[#382F50]"
              disabled={pending}
            >
              {pending ? "Влизане…" : "Вход"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
