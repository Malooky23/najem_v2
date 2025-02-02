import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { items, itemStock, stockMovements, businessCustomers, individualCustomers, customers, users } from '@/server/db/schema';
import { eq, asc, desc,sql} from 'drizzle-orm';
import { z } from 'zod';

// GET /api/items - Fetch paginated items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    // Parse query parameters
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;
    const sortBy = searchParams.get('sortBy') || 'itemNumber';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';

    // Add validation for sortable columns
    const validSortColumns = [
      'itemNumber', 'itemName', 'itemType', 'createdAt', 'updatedAt'
    ] as const;

    // Validate sortBy parameter
    const validSortBy = validSortColumns.includes(sortBy as any) 
      ? sortBy as keyof typeof items.$inferSelect
      : 'itemNumber';

    // Build query
    const query = db
      .select({
        item: items,
        customer: {
          businessName: businessCustomers.businessName,
          individualName: sql<string>`concat(${individualCustomers.firstName}, ' ', ${individualCustomers.lastName})`
        },
        stock: itemStock,
        movements: stockMovements,
        user: users
      })
      .from(items)
      .leftJoin(itemStock, eq(items.itemId, itemStock.itemId))
      .leftJoin(stockMovements, eq(items.itemId, stockMovements.itemId))
      .leftJoin(customers, eq(items.customerId, customers.customerId))
      .leftJoin(
        businessCustomers, 
        eq(customers.customerId, businessCustomers.businessCustomerId)
      )
      .leftJoin(
        individualCustomers, 
        eq(customers.customerId, individualCustomers.individualCustomerId)
      )
      .leftJoin(
        users,
        eq(items.createdBy, users.userId)
      )
      .where(search ? sql`items.item_name ILIKE ${`%${search}%`}` : undefined)
      .orderBy(sortOrder === 'asc' ? asc(items[validSortBy]) : desc(items[validSortBy]))
      .limit(limit)
      .offset((page - 1) * limit);

    const [itemsData, total] = await Promise.all([
      query,
      db.select({ count: sql<number>`count(*)` }).from(items)
    ]);

    return NextResponse.json({
      items: itemsData.map(result => ({
        ...result.item,
        customerName: result.customer?.businessName || result.customer?.individualName,
        stock: result.stock,
        movements: result.movements,
        createdBy: result.user?.firstName + " " + result.user?.lastName
      })),
      total: Number(total[0].count),
      page,
      totalPages: Math.ceil(Number(total[0].count) / limit),
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create new item
export async function POST(request: Request) {
  const itemSchema = z.object({
    itemName: z.string().min(1),
    itemType: z.string().optional(),
    itemBrand: z.string().optional(),
    itemModel: z.string().optional(),
    itemBarcode: z.string().optional(),
    itemCountryOfOrigin: z.string().optional(),
    packingType: z.string().optional(),
    weightGrams: z.coerce.number().nonnegative().optional(),
    dimensions: z.object({
      width: z.number(),
      height: z.number(),
      length: z.number(),
    }).optional(),
    notes: z.string().optional(),
    customerId: z.string().uuid(),
    createdBy: z.string().uuid(),
  });

  try {
    const body = await request.json();
    const validatedData = itemSchema.parse(body);
    
    const [newItem] = await db.insert(items).values(validatedData).returning();
    
    // Initialize stock


    return NextResponse.json(newItem, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 400 }
    );
  }
} 