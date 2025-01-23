import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const publicPaths = ["/login", "/signup", "/api/auth", "/api/customers"];

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
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.AUTH_SECRET 
      });
      
      console.log('Token found:', !!token);
      if (token) {
        console.log('Token details:', {
          email: token.email,
          name: token.name
        });
      }

      // No token found, return 401
      if (!token) {
        console.log('No token found for path:', pathname);
        console.log('Request cookies:', request.cookies);
        console.log('Request headers:', {
          authorization: request.headers.get('authorization'),
          cookie: request.headers.get('cookie')
        });
        return new NextResponse(
          JSON.stringify({ error: "Authentication required" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      return new NextResponse(
        JSON.stringify({ error: "Internal server error in auth middleware" }),
        {
          status: 500,
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
