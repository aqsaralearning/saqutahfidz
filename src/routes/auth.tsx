import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — SAQU Mutaba'ah Tahfidz" },
      { name: "description", content: "Masuk atau daftar untuk mengakses aplikasi mutaba'ah tahfidz SAQU." },
      { property: "og:title", content: "Masuk — SAQU Mutaba'ah Tahfidz" },
      { property: "og:description", content: "Masuk untuk mengelola hafalan santri." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Berhasil masuk");
    nav({ to: "/dashboard" });
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Pendaftaran berhasil. Silakan masuk.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message);
    else if (!r.redirected) nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md card-fun">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto block h-16 w-16"><img src={logoSaqu.url} alt="SAQU" className="h-16 w-16 object-contain" /></Link>
          <CardTitle className="mt-2 font-display text-2xl">SAQU Tahfidz</CardTitle>
          <p className="text-sm text-muted-foreground">Masuk untuk mengakses aplikasi mutaba'ah</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-3 pt-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Kata sandi</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full rounded-xl" onClick={signIn} disabled={loading}>Masuk</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3 pt-4">
              <div><Label>Nama lengkap</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Kata sandi</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full rounded-xl" onClick={signUp} disabled={loading}>Daftar</Button>
              <p className="text-xs text-muted-foreground">Akun baru mendapat peran default (musyrif). Admin dapat mengubah peran di menu Pengaturan.</p>
            </TabsContent>
          </Tabs>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />atau<span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full rounded-xl" onClick={google}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.7 3.2-8.4z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.9C3.9 20.5 7.6 23 12 23z"/><path fill="#FBBC05" d="M5.8 14c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V6.9H2.1C1.4 8.4 1 10.1 1 12s.4 3.6 1.1 5.1L5.8 14z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.6 1 3.9 3.5 2.1 6.9L5.8 9.8C6.7 7.1 9.1 5.4 12 5.4z"/></svg>
            Masuk dengan Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
