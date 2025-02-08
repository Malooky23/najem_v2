import { NextResponse } from 'next/server';
import { getPaginatedItems } from '@/server/queries/items';
import type { Item } from '@/components/items/types';

// export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url); // Get query parameters
    const since = searchParams.get('since'); // Extract 'since' parameter
    const page = parseInt(searchParams.get('page') || '1', 10); // Extract 'page' parameter
    const limit = parseInt(searchParams.get('limit') || '50', 10); // Extract 'limit' parameter
    const sinceTimestamp = since ? parseInt(since, 10) : undefined; // Parse to integer if provided

    let filter = {}; // Default filter is empty object

    if (sinceTimestamp) {
      filter = {
        updatedAt: { gt: new Date(sinceTimestamp) }, // Filter for updatedAt > sinceTimestamp
      };
    }

    // Get items with pagination and optional filter
    const { items, total, totalPages } = await getPaginatedItems(page, limit, {
      sortOrder: 'asc',
      sortBy: 'itemNumber',
      filter: filter, // Pass the filter to getPaginatedItems
    });

    // Transform to match your Item type
    const formattedItems: Item[] = items.map(item => {
      let createdAtDate: Date | null = null;
      if (item.createdAt) {
        const date = item.createdAt instanceof Date 
          ? item.createdAt 
          : new Date(item.createdAt);
          
        if (!isNaN(date.getTime())) {
          createdAtDate = date;
        } else {
          console.error("Invalid createdAt value:", item.createdAt);
        }
      }

      let updatedAtDate: Date | null = null;
      if (item.updatedAt) {
        const date = item.updatedAt instanceof Date 
          ? item.updatedAt 
          : new Date(item.updatedAt);
          
        if (!isNaN(date.getTime())) {
          updatedAtDate = date;
        } else {
          console.error("Invalid updatedAt value:", item.updatedAt);
        }
      }

      return {
        ...item,
        createdAt: createdAtDate,
        updatedAt: updatedAtDate,
        dimensions: item.dimensions as { /* ... */ } | null,
        customerId: item.customerId || '',
        createdBy: item.createdBy || '',
        customerName: item.customerName || '',
      };
    });

    return NextResponse.json({ items: formattedItems, total, totalPages, page });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}