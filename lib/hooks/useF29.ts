"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { F29Declaration } from "@/lib/types";

export function useF29Declarations(organizationId?: string) {
  return useQuery({
    queryKey: ["f29", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("f29_declarations")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      if (error) throw error;
      return data as F29Declaration[];
    },
    enabled: !!organizationId,
  });
}

export function useF29BoletasByMonth(organizationId?: string) {
  return useQuery({
    queryKey: ["f29-boletas", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("boletas")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      if (error) throw error;

      // Group by year/month
      const grouped: Record<string, { year: number; month: number; totalGross: number; totalRetention: number; count: number }> = {};
      for (const b of data ?? []) {
        const key = `${b.period_year}-${b.period_month}`;
        if (!grouped[key]) {
          grouped[key] = { year: b.period_year, month: b.period_month, totalGross: 0, totalRetention: 0, count: 0 };
        }
        grouped[key].totalGross += b.gross_amount;
        grouped[key].totalRetention += b.retention_amount;
        grouped[key].count += 1;
      }
      return Object.values(grouped);
    },
    enabled: !!organizationId,
  });
}
