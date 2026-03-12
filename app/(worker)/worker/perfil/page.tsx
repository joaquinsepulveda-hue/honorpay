"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/hooks/use-toast";
import { formatRUT } from "@/lib/utils";

const schema = z.object({
  phone: z.string().optional(),
  rut: z.string().min(1, "RUT requerido"),
  bankName: z.string().min(1, "Banco requerido"),
  bankAccountType: z.enum(["cuenta_corriente", "cuenta_vista", "cuenta_rut", "cuenta_ahorro"]),
  bankAccountNumber: z.string().min(1, "Número de cuenta requerido"),
});

type FormData = z.infer<typeof schema>;

export default function PerfilPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bankAccountType: "cuenta_vista" },
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
        reset({
          phone: profile.phone ?? "",
          rut: profile.rut ?? "",
          bankName: profile.bank_name ?? "",
          bankAccountType: profile.bank_account_type ?? "cuenta_vista",
          bankAccountNumber: profile.bank_account_number ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  async function onSubmit(data: FormData) {
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      rut: data.rut,
      phone: data.phone,
      bank_name: data.bankName,
      bank_account_type: data.bankAccountType,
      bank_account_number: data.bankAccountNumber,
    }).eq("id", userId);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado" });
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-24 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mi perfil</h1>

      <Card>
        <CardContent className="p-4">
          <p className="font-semibold">{fullName}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle className="text-sm">Datos personales y bancarios</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>RUT</Label>
              <Input
                placeholder="12.345.678-9"
                {...register("rut")}
                onChange={(e) => setValue("rut", formatRUT(e.target.value))}
              />
              {errors.rut && <p className="text-sm text-destructive">{errors.rut.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input placeholder="+56 9 1234 5678" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Banco</Label>
              <Input placeholder="Banco Estado" {...register("bankName")} />
              {errors.bankName && <p className="text-sm text-destructive">{errors.bankName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo de cuenta</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("bankAccountType")}
              >
                <option value="cuenta_corriente">Cuenta Corriente</option>
                <option value="cuenta_vista">Cuenta Vista</option>
                <option value="cuenta_rut">Cuenta RUT</option>
                <option value="cuenta_ahorro">Cuenta Ahorro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Número de cuenta</Label>
              <Input placeholder="00123456789" {...register("bankAccountNumber")} />
              {errors.bankAccountNumber && <p className="text-sm text-destructive">{errors.bankAccountNumber.message}</p>}
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
  );
}
