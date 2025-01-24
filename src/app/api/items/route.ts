import { createItem, getItems } from "@/lib/db/queries";
import { createItemSchema } from "@/lib/validations/item";
import { auth } from "@/lib/auth";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to create items" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const body = createItemSchema.parse(json);

    const newItem = await createItem(
      {
        itemName: body.itemName,
        itemType: body.itemType,
        itemModel: body.itemModel,
        itemBrand: body.itemBrand,
        weightGrams: body.weightGrams ? Math.floor(body.weightGrams) : null,
        notes: body.notes,
        dimensions: body.dimensions,
        itemBarcode: body.itemBarcode,
        createdBy: session.user.id!,
      },
      body.ownerId,
      body.ownerType
    );

    return Response.json(newItem);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: 'Invalid item data: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error && 'code' in error) {
      const { code } = error as { code?: string };
      if (code === '23505') {
        return Response.json(
          { error: 'An item with this barcode already exists' },
          { status: 400 }
        );
      }
    }

    console.error('Error creating item:', error);
    return Response.json(
      { error: 'Failed to create item. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to view items" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const result = await getItems({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sortBy: searchParams.get('sortBy') || 'itemNumber',
      sortOrder: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || '',
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching items:", error);
    return Response.json(
      { error: "An error occurred while fetching items" },
      { status: 500 }
    );
  }
}