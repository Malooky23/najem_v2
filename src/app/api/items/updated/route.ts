import { db } from '@/server/db';
import { items, deletedItems } from '@/server/db/schema';
import { eq, gt, and, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = Number(searchParams.get('since')) || 0;

  // Return full dataset if since=0
  if (since === 0) {
    const allItems = await db.query.items.findMany();
    return NextResponse.json({
      newItems: allItems,
      updatedItems: [],
      deletedIds: [],
      isFullRefresh: true
    });
  }

  const newItems = await db.query.items.findMany({
    where: gt(items.createdAt, new Date(since))
  });

  const updatedItems = await db.query.items.findMany({
    where: and(
      gt(items.updatedAt, new Date(since)),
      lte(items.createdAt, new Date(since))
    )
  });

  const deletedIds = await db.query.deletedItems.findMany({
    where: gt(deletedItems.deletedAt, new Date(since))
  });

  return NextResponse.json({
    newItems,
    updatedItems,
    deletedIds: deletedIds.map(d => d.itemId),
    isFullRefresh: since === 0
  });
} 