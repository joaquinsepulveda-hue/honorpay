"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkerForm } from "@/components/trabajadores/WorkerForm";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/hooks/use-toast";
import type { TrabajadorFormData } from "@/lib/validations/trabajador";
import { useState } from "react";

export default function NuevoTrabajadorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: TrabajadorFormData) {
    setIsSubmitting(true);
    try {
      // Create auth user + profile via admin (for demo, we create without auth user)
      // In production this would send an invite email
      const supabase = createClient();

      // Check if profile exists by email
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.email)
        .single();

      if (existing) {
        // Update existing profile
        await supabase.from("profiles").update({
          full_name: data.fullName,
          rut: data.rut,
          phone: data.phone,
          bank_name: data.bankName,
          bank_account_type: data.bankAccountType,
          bank_account_number: data.bankAccountNumber,
        }).eq("id", existing.id);
        toast({ title: "Trabajador actualizado" });
      } else {
        toast({
          title: "Trabajador no encontrado",
          description: "El trabajador debe registrarse primero en HonorPay",
          variant: "destructive",
        });
      }
      router.push("/trabajadores");
    } catch {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Nuevo trabajador"
        description="Invita un trabajador existente a tu equipo"
        actions={
          <Link href="/trabajadores">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <div className="max-w-2xl">
        <WorkerForm onSubmit={onSubmit} isSubmitting={isSubmitting} submitLabel="Guardar trabajador" />
      </div>
    </div>
  );
}
