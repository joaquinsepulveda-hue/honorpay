import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id || profile.role !== "empresa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  // Check if already invited
  const { data: existing } = await service
    .from("worker_invitations")
    .select("id, status")
    .eq("organization_id", profile.organization_id)
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json({ error: "Este trabajador ya está en tu equipo" }, { status: 409 });
    }
    // Pending: delete old record and re-invite with a fresh token
    await service.from("worker_invitations").delete().eq("id", existing.id);
  }

  // Always use production URL so the redirectTo is whitelisted in Supabase
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://honorpay.vercel.app";
  const { error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { role: "trabajador" },
    redirectTo: `${appUrl}/api/auth/callback?next=/onboarding`,
  });

  if (inviteError) {
    // If user already exists in auth, still create the invitation record
    if (!inviteError.message.includes("already been registered")) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }
  }

  // Record the invitation
  const { error: dbError } = await service
    .from("worker_invitations")
    .insert({ organization_id: profile.organization_id, email });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
