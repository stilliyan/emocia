"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Tags,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/theme-switch";
import { logoutAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Табло", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Записвания", icon: CalendarCheck },
  { href: "/admin/products", label: "Продукти", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: Tags },
  { href: "/admin/content", label: "Съдържание", icon: FileText },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

function AdminBrand({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "w-[108px]" : "w-[152px]";

  return (
    <span className="relative block">
      <Image
        src="/storefront/logo-dark.svg"
        alt=""
        width={193}
        height={66}
        priority
        aria-hidden="true"
        className={cn("h-auto dark:hidden", sizeClass)}
      />
      <Image
        src="/storefront/logo.svg"
        alt=""
        width={308}
        height={105}
        priority
        aria-hidden="true"
        className={cn("hidden h-auto dark:block", sizeClass)}
      />
      <span className="sr-only">Бутик Емоция CMS</span>
    </span>
  );
}

function Nav({ upcomingAppointments }: { upcomingAppointments: number }) {
  const path = usePathname();

  return (
    <nav className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted",
              active && "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {href === "/admin/appointments" && upcomingAppointments > 0 && (
              <span
                aria-label={upcomingAppointments === 1 ? "1 предстоящо записване" : `${upcomingAppointments} предстоящи записвания`}
                className={cn(
                  "grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                  active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                {upcomingAppointments > 99 ? "99+" : upcomingAppointments}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children, initialUpcomingAppointments = 0 }: { children: React.ReactNode; initialUpcomingAppointments?: number }) {
  const [upcomingAppointments, setUpcomingAppointments] = useState(initialUpcomingAppointments);

  useEffect(() => {
    const supabase = createClient();

    async function refreshCount() {
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("end_at", new Date().toISOString());
      if (typeof count === "number") setUpcomingAppointments(count);
    }

    const channel = supabase
      .channel("admin-appointment-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, (payload) => {
        void refreshCount();
        if (payload.eventType === "INSERT") {
          const appointment = payload.new as { customer_name?: string; start_at?: string };
          const date = appointment.start_at
            ? new Intl.DateTimeFormat("bg-BG", {
                timeZone: "Europe/Sofia",
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(appointment.start_at))
            : "";
          toast.success(`Ново записване${appointment.customer_name ? ` от ${appointment.customer_name}` : ""}`, {
            description: date || "Отворете „Записвания“ за подробности.",
          });
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/25">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r bg-background p-4 md:block">
        <Link
          href="/admin"
          aria-label="Бутик Емоция CMS — табло"
          className="mb-6 flex min-h-14 items-center rounded-md px-2"
        >
          <AdminBrand />
        </Link>
        <Nav upcomingAppointments={upcomingAppointments} />
        <form action={logoutAction} className="absolute bottom-4 left-4 right-4">
          <Button type="submit" variant="ghost" className="w-full justify-start">
            <LogOut />
            Изход
          </Button>
        </form>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Отвори меню"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-5">
            <SheetTitle asChild>
              <Link
                href="/admin"
                aria-label="Бутик Емоция CMS — табло"
                className="mb-8 flex min-h-14 items-center rounded-md px-2"
              >
                <AdminBrand />
              </Link>
            </SheetTitle>
            <Nav upcomingAppointments={upcomingAppointments} />
          </SheetContent>
        </Sheet>

        <Link
          href="/admin"
          aria-label="Бутик Емоция CMS — табло"
          className="ml-3 flex min-h-11 items-center rounded-md"
        >
          <AdminBrand compact />
        </Link>
        <div className="ml-auto">
          <ThemeSwitch />
        </div>
      </header>

      <main className="md:pl-56">
        <div className="mx-auto max-w-[1440px] p-4 md:p-5 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
