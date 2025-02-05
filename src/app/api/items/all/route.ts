import { NextResponse } from 'next/server';
import { getPaginatedItems } from '@/server/queries/items';
import type { Item } from '@/components/items/types';

// export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Get all items without pagination
    const { items } = await getPaginatedItems(1, 1000, {
      sortOrder: 'asc',
      sortBy: 'itemNumber'
    });
    // console.log("items", items);

    // Transform to match your Item type
    const formattedItems: Item[] = items.map(item => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
      dimensions: item.dimensions as {
        length?: number;
        width?: number;
        height?: number;
      } | null,
      customerId: item.customerId || '',
      createdBy: item.createdBy || '',
      customerName: item.customerName || ''
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
} 