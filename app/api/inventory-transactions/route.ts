import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const warehouseId = searchParams.get('warehouseId');

    let query = `
      SELECT it.*, p.name as product_name, p.sku, w.name as warehouse_name
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      JOIN warehouses w ON it.warehouse_id = w.id
    `;
    const params = [];
    const conditions = [];
    
    if (productId) {
      conditions.push(`it.product_id = $${params.length + 1}`);
      params.push(productId);
    }
    
    if (warehouseId) {
      conditions.push(`it.warehouse_id = $${params.length + 1}`);
      params.push(warehouseId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY it.created_at DESC';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
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
      product_id,
      warehouse_id,
      transaction_type,
      quantity,
      reference_type,
      reference_id,
      notes,
      created_by,
    } = body;

    if (!product_id || !warehouse_id || !transaction_type || quantity === undefined) {
      return NextResponse.json(
        errorResponse('product_id, warehouse_id, transaction_type, and quantity are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity, reference_type, reference_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        product_id,
        warehouse_id,
        transaction_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        created_by || 'system',
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Inventory transaction recorded successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording inventory transaction:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
