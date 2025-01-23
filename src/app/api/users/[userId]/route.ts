'use server'

import { type NextRequest } from "next/server";
import { username } from "@/lib/db/queries";
type RouteHandlerContext = {
    params: Promise<{
        userId: string;
    }>;
  };

export async function GET(
      _request: NextRequest,
      context: RouteHandlerContext

    
) {
    const { userId } = await context.params;


  try {
    const usernameResponse = await username(userId);
    return Response.json(usernameResponse);
  } catch (error) {
    console.error('Error fetching item owners:', error);
    return Response.json({ error: "Failed to fetch item owners" }, { status: 500 });
  }
} 