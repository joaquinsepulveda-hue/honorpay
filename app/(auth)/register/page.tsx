"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  fullName: z.string().min(2, "Nombre requerido"),
  role: z.enum(["empresa", "trabajador"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "empresa" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Supabase returns user: null silently when email already exists (enumeration protection)
      if (!authData.user) {
        setError("Este email ya tiene una cuenta. Intenta iniciar sesión.");
        return;
      }

      // Profile is created automatically via DB trigger (handle_new_user)
      if (authData.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error(err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Únete a HonorPay para gestionar tus boletas</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          {emailSent && (
            <div className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
              Revisa tu email para confirmar tu cuenta y luego inicia sesión.
            </div>
          )}

          {/* Role selector */}
          <div className="space-y-2">
            <Label>Soy...</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "empresa", label: "Empresa / Banquetera", desc: "Creo eventos y pago trabajadores" },
                { value: "trabajador", label: "Trabajador / Garzón", desc: "Acepto eventos y emito boletas" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("role", opt.value as "empresa" | "trabajador")}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedRole === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">
              {selectedRole === "empresa" ? "Nombre de la empresa" : "Nombre completo"}
            </Label>
            <Input
              id="fullName"
              placeholder={selectedRole === "empresa" ? "Eventos del Sur SpA" : "Juan Pérez"}
              {...register("fullName")}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.cl"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
