"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle, Loader2, Copy, Check, MessageCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Email inválido"),
});
type FormData = z.infer<typeof schema>;

export default function InvitarTrabajadorPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/trabajadores/invitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError("email", { message: json.error });
      return;
    }
    setSentEmail(data.email);
    setInviteLink(json.link ?? null);
    setSent(true);
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    if (!inviteLink) return;
    const text = encodeURIComponent(
      `Hola! Te invito a unirte a HonorPay para recibir tus pagos de forma simple. Ingresa con este link:\n\n${inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto mt-16 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Invitación generada</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Se envió un email a{" "}
            <span className="font-medium text-foreground">{sentEmail}</span>.
            También puedes compartir el link directamente.
          </p>
        </div>

        {inviteLink && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Link de invitación</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="text-xs font-mono h-9 bg-muted"
                />
                <Button variant="outline" size="sm" className="h-9 px-3 shrink-0" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-10 gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-4 w-4" />
                Enviar por WhatsApp
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setSent(false); setInviteLink(null); }}>
            Invitar otro
          </Button>
          <Button onClick={() => router.push("/trabajadores")}>
            Ver trabajadores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/trabajadores">
          <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a trabajadores
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Invitar trabajador</h1>
          <p className="text-sm text-muted-foreground">
            El trabajador recibirá un email para registrarse y completar sus datos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enviar invitación por email</CardTitle>
          <CardDescription>
            Se genera un link único para que el trabajador cree su cuenta. También podrás copiarlo y enviarlo por WhatsApp.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email del trabajador</Label>
              <Input
                id="email"
                type="email"
                placeholder="trabajador@email.cl"
                className="h-11"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar invitación
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
