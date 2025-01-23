import { auth } from "@/lib/auth";
import { getItemOwnerOptions } from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await auth();
            if (!session) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
    
    const owners = await getItemOwnerOptions;
    return Response.json(owners);
  } catch (error) {
    console.error('Error fetching item owners:', error);
    return Response.json({ error: "Failed to fetch item owners" }, { status: 500 });
  }
} 