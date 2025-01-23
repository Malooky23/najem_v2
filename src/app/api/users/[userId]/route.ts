'use server'

import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

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
        // const session = await auth();
        // if (!session) {
        //     return new Response(JSON.stringify({ error: "Unauthorized" }), {
        //         status: 401,
        //         headers: { 'Content-Type': 'application/json' },
        //     });
        // }

        const usernameResponse = await username(userId);
        return Response.json(usernameResponse);
    } catch (error) {
        console.error('Error fetching item owners:', error);
        return Response.json({ error: "Failed to fetch item owners" }, { status: 500 });
    }
} 