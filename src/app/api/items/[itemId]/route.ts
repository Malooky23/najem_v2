import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { item, itemOwners } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { updateItemSchema } from "@/lib/validations/item";

type RouteHandlerContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  context: RouteHandlerContext
) {
  const { itemId } = await context.params;

  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.transaction(async (tx) => {
      await tx.delete(itemOwners)
        .where(eq(itemOwners.itemId, itemId));

      await tx.delete(item)
        .where(eq(item.itemId, itemId));
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to delete item" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteHandlerContext
) {
  const { itemId } = await context.params;

  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const json = await request.json();
    const body = updateItemSchema.parse(json);

    const [updatedItem] = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(item)
        .set({
          itemName: body.itemName,
          itemType: body.itemType,
          itemBrand: body.itemBrand,
          itemModel: body.itemModel,
          itemBarcode: body.itemBarcode,
          dimensions: body.dimensions,
          weightGrams: body.weightGrams?.toString() || null,
          notes: body.notes,
        })
        .where(eq(item.itemId, itemId))
        .returning();

      if (body.ownerId && body.ownerType) {
        await tx
          .update(itemOwners)
          .set({
            ownerId: body.ownerId,
            ownerType: body.ownerType,
          })
          .where(eq(itemOwners.itemId, itemId));
      }

      const [completeItem] = await tx
        .select({
          itemId: item.itemId,
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          itemType: item.itemType,
          itemBrand: item.itemBrand,
          itemModel: item.itemModel,
          itemBarcode: item.itemBarcode,
          dimensions: item.dimensions,
          weightGrams: item.weightGrams,
          notes: item.notes,
          createdBy: item.createdBy,
          createdAt: item.createdAt,
          ownerId: itemOwners.ownerId,
          ownerType: itemOwners.ownerType,
        })
        .from(item)
        .leftJoin(itemOwners, eq(item.itemId, itemOwners.itemId))
        .where(eq(item.itemId, itemId));

      return [completeItem];
    });

    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update item error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to update item" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 