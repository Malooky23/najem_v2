// "use server";
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { items } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic'; // Add this line

// GET /api/items/:id - Get single item
export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.itemId, params.itemId));

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
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    
    const [updatedItem] = await db
      .update(items)
      .set(body)
      .where(eq(items.itemId, itemId))
      .returning();

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 400 }
    );
  }
}

// DELETE /api/items/:id - Delete item
export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    await db
      .delete(items)
      .where(eq(items.itemId, params.itemId));

    return NextResponse.json({ success: true });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

