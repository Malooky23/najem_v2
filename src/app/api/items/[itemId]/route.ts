// "use server";
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { items } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'; // Add this line

// GET /api/items/:id - Get single item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Await the params promise first
  const { itemId } = await params;
  
  try {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.itemId, itemId));

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT /api/items/:id - Update item
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
  ) {
  try {
    const resolvedParams = await params;
    const { itemId } = resolvedParams;
    console.log("itemId", itemId);
    const body = await request.json();
    console.log("body", body);

    const [updatedItem] = await db
      .update(items)
      .set(body)
      .where(eq(items.itemId, itemId))
      .returning();
    console.log("updatedItem", updatedItem);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 400 }
    );
  }
}

// DELETE /api/items/:id - Delete item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Add await for params access

  const resolvedParams = await params;
  const { itemId } = resolvedParams;

  try {
    const updatedItem =await db
      .update(items)
      .set({ isDeleted: true })
      .where(eq(items.itemId, itemId));

    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item moved to trash' });

  } catch (error) {
    console.error("Soft delete error:", error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

