import { NextResponse } from 'next/server';
import { getPaginatedItems, createItem, itemSchema, SortParams } from '@/server/queries/items';

// GET /api/items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;
    const sortParams = {
      sortBy: searchParams.get('sortBy') || 'itemNumber',
      sortOrder: searchParams.get('sortOrder') || 'asc',
      search: searchParams.get('search') || ''
    };

    const result = await getPaginatedItems(page, limit, sortParams as SortParams);
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response;
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = itemSchema.parse(body);
    console.log("validatedData", validatedData);
    const newItem = await createItem(validatedData);
    return NextResponse.json(newItem, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 400 }
    );
  }
} 