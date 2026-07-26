import { createFileRoute, redirect, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useRoles, useIsAdmin } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, BookOpen, Mic, Sparkles, GraduationCap, CalendarCheck, FileBarChart, FileText, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import logoSaqu from "@/assets/logo-saqu.png.asset.json";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/santri", icon: Users, label: "Santri" },
  { to: "/setoran", icon: BookOpen, label: "Setoran" },
  { to: "/tasmi", icon: Mic, label: "Tasmi'" },
  { to: "/tahsin", icon: Sparkles, label: "Tahsin" },
  { to: "/ujian", icon: GraduationCap, label: "Ujian Tahfidz" },
  { to: "/halaqoh", icon: CalendarCheck, label: "Halaqoh & Absensi" },
  { to: "/laporan", icon: FileBarChart, label: "Laporan" },
  { to: "/laporan-harian", icon: FileText, label: "Laporan Harian" },
] as const;

function AuthedLayout() {
  const { user } = useSession();
  const { data: roles } = useRoles();
  const isAdmin = useIsAdmin();
  const nav = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  const NavItems = () => (
    <>
      {NAV.map((n) => {
        const active = path.startsWith(n.to);
        return (
          <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              active ? "bg-primary text-primary-foreground shadow" : "hover:bg-sidebar-accent")}>
            <n.icon className="h-4 w-4" />{n.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link to="/pengaturan" onClick={() => setOpen(false)}
          className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
            path.startsWith("/pengaturan") ? "bg-primary text-primary-foreground shadow" : "hover:bg-sidebar-accent")}>
          <Settings className="h-4 w-4" />Pengaturan
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar p-4 md:flex">
        <Link to="/dashboard" className="mb-6 flex items-center gap-2 font-display text-lg font-extrabold">
          <img src={logoSaqu.url} alt="SAQU" className="h-10 w-10 object-contain" />
          SAQU Tahfidz
        </Link>
        <nav className="flex flex-col gap-1"><NavItems /></nav>
        <div className="mt-auto border-t pt-3">
          <div className="mb-2 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground truncate">{user?.email}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(roles?.length ? roles : ["belum ada peran"]).map((r) => (
                <span key={r} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase">{r}</span>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Keluar</Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-extrabold"><img src={logoSaqu.url} alt="SAQU" className="h-8 w-8 object-contain" />SAQU</Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}><Menu /></Button>
      </header>
      {open && (
        <div className="md:hidden border-b bg-sidebar p-3 space-y-1"><NavItems />
          <Button variant="outline" size="sm" className="w-full rounded-xl mt-2" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Keluar</Button>
        </div>
      )}

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
