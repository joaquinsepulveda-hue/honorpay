"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, User } from "lucide-react";
import { formatRUT } from "@/lib/utils";

const empresaSchema = z.object({
  rut: z.string().min(1, "RUT requerido"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const trabajadorSchema = z.object({
  rut: z.string().min(1, "RUT requerido"),
  phone: z.string().optional(),
  bankName: z.string().min(1, "Banco requerido"),
  bankAccountType: z.enum(["cuenta_corriente", "cuenta_vista", "cuenta_rut", "cuenta_ahorro"]),
  bankAccountNumber: z.string().min(1, "Número de cuenta requerido"),
});

type EmpresaData = z.infer<typeof empresaSchema>;
type TrabajadorData = z.infer<typeof trabajadorSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState<string>("");
  const [orgEmail, setOrgEmail] = useState<string>("");

  const empresaForm = useForm<EmpresaData>({ resolver: zodResolver(empresaSchema) });
  const trabajadorForm = useForm<TrabajadorData>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: { bankAccountType: "cuenta_vista" },
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/me");
      if (!res.ok) { router.push("/login"); return; }
      const { user, profile } = await res.json();

      if (profile) {
        setRole(profile.role);
        setOrgName(profile.full_name);
        setOrgEmail(profile.email);
      } else {
        // Profile missing — create it from auth metadata then reload
        const supabase = createClient();
        const meta = user?.user_metadata ?? {};
        const roleFromMeta = meta?.role ?? "trabajador";
        const nameFromMeta = meta?.full_name ?? user?.email ?? "";
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? "",
          full_name: nameFromMeta,
          role: roleFromMeta,
          onboarding_complete: false,
        });
        setRole(roleFromMeta);
        setOrgName(nameFromMeta);
        setOrgEmail(user?.email ?? "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function onSubmitEmpresa(data: EmpresaData) {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "empresa",
        name: orgName,
        rut: data.rut,
        email: orgEmail,
        phone: data.phone,
        address: data.address,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert("Error: " + json.error);
      return;
    }
    window.location.href = "/dashboard";
  }

  async function onSubmitTrabajador(data: TrabajadorData) {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "trabajador",
        rut: data.rut,
        phone: data.phone,
        bankName: data.bankName,
        bankAccountType: data.bankAccountType,
        bankAccountNumber: data.bankAccountNumber,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert("Error: " + json.error);
      return;
    }
    window.location.href = "/worker";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <span className="text-2xl font-bold text-primary">HonorPay</span>
          </div>
          <p className="text-muted-foreground text-sm">Completa tu perfil para comenzar</p>
        </div>

        {role === "empresa" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Datos de la empresa</CardTitle>
              </div>
              <CardDescription>
                Información de <strong>{orgName}</strong>
              </CardDescription>
            </CardHeader>
            <form onSubmit={empresaForm.handleSubmit(onSubmitEmpresa)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>RUT empresa</Label>
                  <Input
                    placeholder="76.123.456-7"
                    {...empresaForm.register("rut")}
                    onChange={(e) => empresaForm.setValue("rut", formatRUT(e.target.value))}
                  />
                  {empresaForm.formState.errors.rut && (
                    <p className="text-sm text-destructive">{empresaForm.formState.errors.rut.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teléfono (opcional)</Label>
                  <Input placeholder="+56 9 1234 5678" {...empresaForm.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Dirección (opcional)</Label>
                  <Input placeholder="Av. Providencia 123, Santiago" {...empresaForm.register("address")} />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={empresaForm.formState.isSubmitting}
                >
                  {empresaForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Comenzar
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {role === "trabajador" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Mis datos</CardTitle>
              </div>
              <CardDescription>Completa tu información para recibir pagos</CardDescription>
            </CardHeader>
            <form onSubmit={trabajadorForm.handleSubmit(onSubmitTrabajador)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>RUT personal</Label>
                  <Input
                    placeholder="12.345.678-9"
                    {...trabajadorForm.register("rut")}
                    onChange={(e) => trabajadorForm.setValue("rut", formatRUT(e.target.value))}
                  />
                  {trabajadorForm.formState.errors.rut && (
                    <p className="text-sm text-destructive">{trabajadorForm.formState.errors.rut.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teléfono (opcional)</Label>
                  <Input placeholder="+56 9 1234 5678" {...trabajadorForm.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Input placeholder="Banco Estado" {...trabajadorForm.register("bankName")} />
                  {trabajadorForm.formState.errors.bankName && (
                    <p className="text-sm text-destructive">{trabajadorForm.formState.errors.bankName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tipo de cuenta</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...trabajadorForm.register("bankAccountType")}
                  >
                    <option value="cuenta_corriente">Cuenta Corriente</option>
                    <option value="cuenta_vista">Cuenta Vista</option>
                    <option value="cuenta_rut">Cuenta RUT</option>
                    <option value="cuenta_ahorro">Cuenta Ahorro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Número de cuenta</Label>
                  <Input placeholder="00123456789" {...trabajadorForm.register("bankAccountNumber")} />
                  {trabajadorForm.formState.errors.bankAccountNumber && (
                    <p className="text-sm text-destructive">{trabajadorForm.formState.errors.bankAccountNumber.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={trabajadorForm.formState.isSubmitting}
                >
                  {trabajadorForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Comenzar
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
