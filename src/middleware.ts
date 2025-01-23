import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
    const token = await getToken({ 
      req: request,
      secret: process.env.AUTH_SECRET 
    });
    
    console.log('Token found:', !!token);

    // No token found, return 401
    if (!token) {
      console.log('No token found for path:', pathname);
      return new NextResponse(
        JSON.stringify({ error: "Authentication required -----1" }),
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
