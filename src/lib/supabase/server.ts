import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const AUTH_MESSAGES = {
  unauthenticated: "Моля, влезте в профила си.",
  forbidden: "Профилът няма администраторски права.",
} as const;

export type AdminAccessStatus =
  | { status: "unauthenticated" }
  | { status: "setup_required"; userId: string; email: string | null }
  | { status: "forbidden"; userId: string; email: string | null }
  | { status: "authorized"; userId: string; email: string | null };

export class AdminAuthError extends Error {
  constructor(public readonly code: "unauthenticated" | "forbidden") {
    super(AUTH_MESSAGES[code]);
    this.name = "AdminAuthError";
  }
}

function isMissingProfilesTable(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("public.profiles"))
  );
}

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createClient() {
  if (!hasSupabaseConfig()) throw new Error("Supabase не е конфигуриран");
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always persist refreshed cookies.
          }
        },
      },
    },
  );
}

export async function getAdminAccessStatus(): Promise<AdminAccessStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "unauthenticated" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    if (isMissingProfilesTable(error)) {
      return {
        status: "setup_required",
        userId: user.id,
        email: user.email ?? null,
      };
    }
    throw new Error(`Неуспешна проверка на администраторския профил: ${error.message}`);
  }

  if (profile?.role !== "admin") {
    return { status: "forbidden", userId: user.id, email: user.email ?? null };
  }

  return { status: "authorized", userId: user.id, email: user.email ?? null };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AdminAuthError("unauthenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    if (isMissingProfilesTable(error)) {
      throw new Error("Базата данни на CMS не е настроена. Изпълнете началната Supabase миграция.");
    }
    throw new Error(`Неуспешна проверка на достъпа: ${error.message}`);
  }
  if (profile?.role !== "admin") throw new AdminAuthError("forbidden");

  return { supabase, user };
}

export function getAdminErrorMessage(error: unknown) {
  if (error instanceof AdminAuthError) return error.message;
  return error instanceof Error ? error.message : "Възникна неочаквана грешка.";
}
