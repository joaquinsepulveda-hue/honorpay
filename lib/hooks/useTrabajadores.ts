"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function useTrabajadores() {
  return useQuery({
    queryKey: ["trabajadores"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "trabajador")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useTrabajador(id: string) {
  return useQuery({
    queryKey: ["trabajador", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}

export function useInvitaciones() {
  return useQuery({
    queryKey: ["invitaciones"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("worker_invitations")
        .select("*")
        .order("invited_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
