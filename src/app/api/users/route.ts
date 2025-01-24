import { getUserById, getUserByEmail, updateUser, createUser } from "@/lib/db/queries";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { users } from "@/lib/db/schema";
import { createUserSchema } from "@/lib/validations/user";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to view users" },
        { status: 401 }
      );
    }

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
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to create users" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const body = createUserSchema.parse(json);

    const newUser = await createUser({
      email: body.email,
      username: body.username,
      passwordHash: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      mobileNo1: body.mobileNo1,
      mobileNo2: body.mobileNo2 || null,
      userType: body.userType,
      compId: body.compId || null,
      addressId: body.addressId || null,
    });

    return NextResponse.json(newUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid user data: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to update users" },
        { status: 401 }
      );
    }

    const { userId, data } = await request.json();
    const updated = await updateUser(userId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}