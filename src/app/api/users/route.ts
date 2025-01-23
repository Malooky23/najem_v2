import { getUserById, getUserByEmail, updateUser } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (userId) {
      const user = await getUserById(userId);
      return NextResponse.json(user);
    } else if (email) {
      const user = await getUserByEmail(email);
      return NextResponse.json(user);
    }
    
    return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, data } = await request.json();
    const updated = await updateUser(userId, data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
} 