import { getItemOwnerOptions } from "@/lib/db/queries";

export async function GET() {
  try {
    const owners = await getItemOwnerOptions;
    return Response.json(owners);
  } catch (error) {
    console.error('Error fetching item owners:', error);
    return Response.json({ error: "Failed to fetch item owners" }, { status: 500 });
  }
} 