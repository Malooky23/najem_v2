import { type NextRequest } from "next/server";
import { getItemById, updateItem, deleteItem } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { updateItemSchema } from "@/lib/validations/item";
import { ZodError } from "zod";

interface RouteContext {
  params: { itemId: string };
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to delete items" },
        { status: 401 }
      );
    }

    const { itemId } = context.params;

    // Check if item exists
    const existingItem = await getItemById(itemId);
    if (!existingItem) {
      return Response.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    await deleteItem(itemId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return Response.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to update items" },
        { status: 401 }
      );
    }

    const { itemId } = context.params;
    const json = await request.json();
    const body = updateItemSchema.parse(json);

    // Check if item exists
    const existingItem = await getItemById(itemId);
    if (!existingItem) {
      return Response.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const updatedItem = await updateItem(
      itemId,
      {
        itemName: body.itemName,
        itemType: body.itemType,
        itemBrand: body.itemBrand,
        itemModel: body.itemModel,
        itemBarcode: body.itemBarcode,
        dimensions: body.dimensions,
        weightGrams: body.weightGrams ? Math.floor(body.weightGrams) : null,
        notes: body.notes,
      },
      body.ownerId,
      body.ownerType
    );

    return Response.json(updatedItem);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: 'Invalid item data: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating item:', error);
    return Response.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}