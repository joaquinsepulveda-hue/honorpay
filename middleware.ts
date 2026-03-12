import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const WORKER_ROUTES = ["/worker"];
const SKIP_PREFIXES = [
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/api/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isLanding = pathname === "/";
  const isOnboarding = pathname.startsWith("/onboarding");

  // Unauthenticated: redirect to login
  if (!user && !isPublicRoute && !isLanding) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated: redirect away from public routes
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check onboarding completion for authenticated users
  if (user && !isOnboarding && !isPublicRoute && !isLanding) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete, role")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarding_complete) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Role-based routing: workers should be on /worker routes
    if (profile) {
      const isWorkerRoute = WORKER_ROUTES.some((r) => pathname.startsWith(r));
      if (profile.role === "trabajador" && !isWorkerRoute && !isOnboarding) {
        return NextResponse.redirect(new URL("/worker", request.url));
      }
      if (profile.role === "empresa" && isWorkerRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
