import { NextResponse, type NextRequest } from "next/server";

// Prototype: there is no sign-in. Anyone who lands on an auth page goes
// straight to the dashboard.
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/check-email",
  ],
};
