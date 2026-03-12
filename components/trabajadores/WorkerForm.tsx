"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trabajadorSchema, type TrabajadorFormData } from "@/lib/validations/trabajador";
import { formatRUT } from "@/lib/utils";

interface WorkerFormProps {
  defaultValues?: Partial<TrabajadorFormData>;
  onSubmit: (data: TrabajadorFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function WorkerForm({ defaultValues, onSubmit, isSubmitting, submitLabel = "Guardar" }: WorkerFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TrabajadorFormData>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: {
      bankAccountType: "cuenta_vista",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input placeholder="Juan Pérez" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="juan@email.cl" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RUT *</Label>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Datos bancarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Input placeholder="Banco Estado" {...register("bankName")} />
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
            </div>
            <div className="space-y-2">
              <Label>Número de cuenta</Label>
              <Input placeholder="00123456789" {...register("bankAccountNumber")} />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
