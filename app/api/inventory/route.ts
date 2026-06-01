import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouseId = searchParams.get('warehouseId');
    const productId = searchParams.get('productId');

    let query = `
      SELECT i.*, p.name as product_name, p.sku, w.name as warehouse_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN warehouses w ON i.warehouse_id = w.id
    `;
    const params = [];
    const conditions = [];
    
    if (warehouseId) {
      conditions.push(`i.warehouse_id = $${params.length + 1}`);
      params.push(warehouseId);
    }
    
    if (productId) {
      conditions.push(`i.product_id = $${params.length + 1}`);
      params.push(productId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.name';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      warehouse_id,
      product_id,
      quantity_on_hand,
      reserved_quantity,
    } = body;

    if (!warehouse_id || !product_id) {
      return NextResponse.json(
        errorResponse('warehouse_id and product_id are required'),
        { status: 400 }
      );
    }

    const available = (quantity_on_hand || 0) - (reserved_quantity || 0);
    
    const result = await sql.query(
      `INSERT INTO inventory (warehouse_id, product_id, quantity_on_hand, reserved_quantity, available_quantity)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (warehouse_id, product_id) DO UPDATE
       SET quantity_on_hand = $3, reserved_quantity = $4, available_quantity = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [warehouse_id, product_id, quantity_on_hand || 0, reserved_quantity || 0, available]
    );

    return NextResponse.json(
      successResponse(result[0], 'Inventory updated successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
