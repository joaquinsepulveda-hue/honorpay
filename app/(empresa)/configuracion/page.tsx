"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/hooks/use-toast";

const schema = z.object({
  orgName: z.string().min(2, "Nombre requerido"),
  orgRut: z.string().min(1, "RUT requerido"),
  orgEmail: z.string().email("Email inválido"),
  orgPhone: z.string().optional(),
  orgAddress: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/me");
      const { profile } = await meRes.json();

      if (!profile?.organization_id) { setLoading(false); return; }
      setOrgId(profile.organization_id);

      const supabase = createClient();
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single();

      if (org) {
        reset({
          orgName: org.name,
          orgRut: org.rut,
          orgEmail: org.email,
          orgPhone: org.phone ?? "",
          orgAddress: org.address ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  async function onSubmit(data: FormData) {
    if (!orgId) return;
    const supabase = createClient();
    const { error } = await supabase.from("organizations").update({
      name: data.orgName,
      rut: data.orgRut,
      email: data.orgEmail,
      phone: data.orgPhone,
      address: data.orgAddress,
    }).eq("id", orgId);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } else {
      toast({ title: "Guardado", description: "Configuración actualizada correctamente." });
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-lg" /></div>;

  return (
    <div>
      <PageHeader title="Configuración" description="Datos de tu empresa en HonorPay" />
      <div className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader><CardTitle className="text-sm">Información de la empresa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre empresa</Label>
                <Input {...register("orgName")} />
                {errors.orgName && <p className="text-sm text-destructive">{errors.orgName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RUT</Label>
                  <Input {...register("orgRut")} />
                  {errors.orgRut && <p className="text-sm text-destructive">{errors.orgRut.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...register("orgEmail")} />
                  {errors.orgEmail && <p className="text-sm text-destructive">{errors.orgEmail.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="+56 2 1234 5678" {...register("orgPhone")} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input placeholder="Av. Las Condes 123, Santiago" {...register("orgAddress")} />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
