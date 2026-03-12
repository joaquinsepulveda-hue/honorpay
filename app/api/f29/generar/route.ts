import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { year, month } = await request.json();

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "empresa" || !profile.organization_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  // Get boletas for this period
  const { data: boletas } = await service
    .from("boletas")
    .select("gross_amount, retention_amount")
    .eq("organization_id", profile.organization_id)
    .eq("period_year", year)
    .eq("period_month", month)
    .eq("sii_status", "emitida");

  if (!boletas || boletas.length === 0) {
    return NextResponse.json({ error: "No hay boletas para este período" }, { status: 400 });
  }

  const totalGross = boletas.reduce((s, b) => s + b.gross_amount, 0);
  const totalRetention = boletas.reduce((s, b) => s + b.retention_amount, 0);

  // Upsert declaration
  const { data: declaration, error } = await service
    .from("f29_declarations")
    .upsert({
      organization_id: profile.organization_id,
      period_year: year,
      period_month: month,
      total_gross: totalGross,
      total_retention: totalRetention,
      boleta_count: boletas.length,
      status: "pendiente",
      generated_at: new Date().toISOString(),
    }, { onConflict: "organization_id,period_year,period_month" })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al generar F29" }, { status: 500 });
  }

  return NextResponse.json({ success: true, declarationId: declaration.id });
}
