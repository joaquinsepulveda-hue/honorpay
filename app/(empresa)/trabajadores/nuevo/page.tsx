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
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Email inválido"),
});
type FormData = z.infer<typeof schema>;

export default function InvitarTrabajadorPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
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
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <PageHeader title="Invitar trabajador" description="El trabajador recibirá un email para unirse" />
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-primary mx-auto" />
            <p className="font-medium">Invitación enviada</p>
            <p className="text-sm text-muted-foreground">
              Se envió un email a <span className="font-medium text-foreground">{sentEmail}</span> con el link para registrarse.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSent(false)}>
                Invitar otro
              </Button>
              <Button className="flex-1" onClick={() => router.push("/trabajadores")}>
                Ver trabajadores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Invitar trabajador"
        description="El trabajador recibirá un email para registrarse y completar sus datos"
        actions={
          <Link href="/trabajadores">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Enviar invitación
          </CardTitle>
          <CardDescription>
            El trabajador recibirá un email con un link para crear su cuenta e ingresar sus datos bancarios.
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
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar invitación
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
