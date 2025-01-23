import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

// Paths that don't require authentication
const publicPaths = ["/login", "/signup", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware processing path:', pathname);

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    console.log('Public path detected:', pathname);
    return NextResponse.next();
  }

  // Check if it's an API route
  if (pathname.startsWith("/api")) {
    console.log('API route detected:', pathname);
    const session = await auth();
    
    console.log('Session found:', !!session);

    // No session found, return 401
    if (!session) {
      console.log('No session found for path:', pathname);
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
