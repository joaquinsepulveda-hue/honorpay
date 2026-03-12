"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, CalendarDays } from "lucide-react";
import { eventoSchema, type EventoFormData } from "@/lib/validations/evento";
import Link from "next/link";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
  });

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(({ profile }) => {
      setOrgId(profile?.organization_id ?? null);
    });
  }, []);

  async function onSubmit(data: EventoFormData) {
    if (!orgId) return;
    setIsSubmitting(true);
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const evento = await res.json();
    setIsSubmitting(false);
    if (!res.ok) {
      alert("Error: " + evento.error);
      return;
    }
    router.push(`/eventos/${evento.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/eventos">
          <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Nuevo evento</h1>
          <p className="text-sm text-muted-foreground">Crea un evento para gestionar tu equipo</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del evento <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            placeholder="Matrimonio García — Fernández"
            className="h-11"
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha <span className="text-destructive">*</span></Label>
            <Input id="date" type="date" className="h-11" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Lugar</Label>
            <Input id="location" placeholder="Club de Golf Los Leones" className="h-11" {...register("location")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Detalles adicionales del evento..."
            rows={3}
            {...register("description")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/eventos" className="flex-1">
            <Button type="button" variant="outline" className="w-full h-11">Cancelar</Button>
          </Link>
          <Button type="submit" className="flex-1 h-11" disabled={isSubmitting || !orgId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear evento
          </Button>
        </div>
      </form>
    </div>
  );
}
