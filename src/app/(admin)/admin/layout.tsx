import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AUTH_MESSAGES,
  getAdminAccessStatus,
  hasSupabaseConfig,
} from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
        <Card>
          <CardHeader><CardTitle>Необходима е връзка със Supabase</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Кодът е готов, но няма добавени данни за външната услуга.</p>
            <p>Попълнете <code>.env.local</code> и следвайте <code>SUPABASE_SETUP.md</code>.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const access = await getAdminAccessStatus();
  if (access.status === "unauthenticated") redirect("/login");

  if (access.status === "setup_required") {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
        <Card className="w-full">
          <CardHeader><CardTitle>Базата данни на CMS не е настроена</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Връзката със Supabase и входът работят, но таблиците <code>profiles</code>, <code>categories</code> и <code>products</code> още не са създадени.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Отворете Supabase Dashboard → SQL Editor.</li>
              <li>Копирайте и изпълнете целия файл <code>supabase/migrations/202607120001_initial.sql</code>.</li>
              <li>Изпълнете admin заявката от <code>SUPABASE_SETUP.md</code> с User ID отдолу.</li>
              <li>Презаредете тази страница.</li>
            </ol>
            <div className="rounded-md bg-muted p-4">
              <p><strong>Имейл:</strong> {access.email ?? "Не е наличен"}</p>
              <p className="mt-2 break-all"><strong>User ID:</strong> <code>{access.userId}</code></p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (access.status === "forbidden") {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
        <Card className="w-full">
          <CardHeader><CardTitle>{AUTH_MESSAGES.forbidden}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Входът е успешен, но за този Supabase потребител липсва запис с роля <code>admin</code>.
            </p>
            <div className="rounded-md bg-muted p-4">
              <p><strong>Имейл:</strong> {access.email ?? "Не е наличен"}</p>
              <p className="mt-2 break-all"><strong>User ID:</strong> <code>{access.userId}</code></p>
            </div>
            <p>Изпълнете еднократната SQL заявка от <code>SUPABASE_SETUP.md</code> с този User ID, след което презаредете страницата.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
