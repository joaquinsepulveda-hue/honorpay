"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventWorker } from "@/lib/types";

export function useEventos(organizationId?: string) {
  return useQuery({
    queryKey: ["eventos", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!organizationId,
  });
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: ["evento", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        console.error("[useEvento] error:", error);
        throw error;
      }
      return data as Event;
    },
    enabled: !!id,
  });
}

export function useEventWorkers(eventId: string) {
  return useQuery({
    queryKey: ["event-workers", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("event_workers")
        .select(`
          *,
          worker:profiles(id, full_name, email, rut, phone, bank_name, bank_account_type, bank_account_number)
        `)
        .eq("event_id", eventId)
        .order("invited_at", { ascending: true });
      if (error) throw error;
      return data as EventWorker[];
    },
    enabled: !!eventId,
  });
}

export function useCreateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      organization_id: string;
      name: string;
      date: string;
      location?: string;
      description?: string;
    }) => {
      const supabase = createClient();
      const { data: evento, error } = await supabase
        .from("events")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return evento as Event;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["eventos", vars.organization_id] });
    },
  });
}

export function useUpdateEventoStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["evento", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
    },
  });
}

export function useAddWorkerToEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      event_id: string;
      worker_id: string;
      role_description?: string;
      gross_amount: number;
    }) => {
      const supabase = createClient();
      const { error } = await supabase.from("event_workers").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["event-workers", vars.event_id] });
    },
  });
}
