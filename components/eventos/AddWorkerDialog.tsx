"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAddWorkerToEvent } from "@/lib/hooks/useEventos";
import type { Profile } from "@/lib/types";

const schema = z.object({
  grossAmount: z.number().min(1, "Monto requerido"),
  roleDescription: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddWorkerDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
}

export function AddWorkerDialog({ open, onClose, eventId }: AddWorkerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Profile | null>(null);
  const [searching, setSearching] = useState(false);

  const addWorker = useAddWorkerToEvent();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, rut, role")
      .eq("role", "trabajador")
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,rut.ilike.%${searchQuery}%`)
      .limit(5);
    setSearchResults((data ?? []) as Profile[]);
    setSearching(false);
  }

  async function onSubmit(data: FormData) {
    if (!selectedWorker) return;
    await addWorker.mutateAsync({
      event_id: eventId,
      worker_id: selectedWorker.id,
      role_description: data.roleDescription,
      gross_amount: data.grossAmount,
    });
    handleClose();
  }

  function handleClose() {
    reset();
    setSearchQuery("");
    setSearchResults([]);
    setSelectedWorker(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar trabajador</DialogTitle>
          <DialogDescription>Busca y agrega un trabajador a este evento</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          {!selectedWorker && (
            <div className="space-y-2">
              <Label>Buscar trabajador</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre, email o RUT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button type="button" variant="outline" onClick={handleSearch} disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="border border-border rounded-md divide-y divide-border">
                  {searchResults.map((worker) => (
                    <button
                      key={worker.id}
                      type="button"
                      onClick={() => setSelectedWorker(worker)}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium">{worker.full_name}</p>
                      <p className="text-xs text-muted-foreground">{worker.email} · {worker.rut ?? "Sin RUT"}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !searching && (
                <p className="text-sm text-muted-foreground">No se encontraron trabajadores.</p>
              )}
            </div>
          )}

          {/* Selected worker */}
          {selectedWorker && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{selectedWorker.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedWorker.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorker(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}

          {/* Amount + Role */}
          <form id="add-worker-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Monto bruto (CLP)</Label>
              <Input
                type="number"
                placeholder="150000"
                {...register("grossAmount", { valueAsNumber: true })}
              />
              {errors.grossAmount && <p className="text-sm text-destructive">{errors.grossAmount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rol en el evento (opcional)</Label>
              <Input placeholder="Garzón, Bartender, Supervisor..." {...register("roleDescription")} />
            </div>
          </form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            form="add-worker-form"
            disabled={!selectedWorker || addWorker.isPending}
          >
            {addWorker.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
