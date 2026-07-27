import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import logoSaqu from "@/assets/logo-saqu.png.asset.json";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next:
      typeof s.next === "string" &&
      s.next.startsWith("/") &&
      !s.next.startsWith("//")
        ? s.next
        : "",
  }),
  head: () => ({
    meta: [
      { title: "Masuk — SAQU Mutaba'ah Tahfidz" },
      {
        name: "description",
        content:
          "Masuk atau daftar untuk mengakses aplikasi mutaba'ah tahfidz SAQU.",
      },
      {
        property: "og:title",
        content: "Masuk — SAQU Mutaba'ah Tahfidz",
      },
      {
        property: "og:description",
        content: "Masuk untuk mengelola hafalan santri.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { next } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    if (next) {
      window.location.href = next;
    } else {
      nav({ to: "/dashboard" });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goNext();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    if (!email || !password) {
      toast.error("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Berhasil masuk");
    goNext();
  };

  const signUp = async () => {
    if (!name || !email || !password) {
      toast.error("Nama, email, dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    const emailRedirectTo = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Pendaftaran berhasil. Cek email konfirmasi jika diperlukan.",
    );
  };

  const google = async () => {
    setLoading(true);

    const redirectTo = next
      ? `${window.location.origin}${next}`
      : `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md card-fun">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto block h-16 w-16">
            <img
              src={logoSaqu.url}
              alt="SAQU"
              className="h-16 w-16 object-contain"
            />
          </Link>

          <CardTitle className="mt-2 font-display text-2xl">
            SAQU Tahfidz
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Masuk untuk mengakses aplikasi mutaba'ah
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-3 pt-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Kata sandi</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full rounded-xl"
                onClick={signIn}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 pt-4">
              <div>
                <Label>Nama lengkap</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Kata sandi</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full rounded-xl"
                onClick={signUp}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Daftar"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Akun baru mendapat peran default musyrif.
              </p>
            </TabsContent>
          </Tabs>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={google}
            disabled={loading}
          >
            Masuk dengan Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
