import { NextResponse } from "next/server";
import { seedBusinessCustomers } from "@/scripts/seed-customers";

export async function GET() {
  const result = await seedBusinessCustomers();
  if (result.success) {
    return NextResponse.json({ success: true, data: result });
  }
  return NextResponse.json({ success: false, error: result.error }, { status: 500 });
} 