import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError, generateOrderNumber } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    let query = `
      SELECT po.*, p.name as product_name, p.sku
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
    `;
    const params = [];
    
    if (orgId) {
      query += ' WHERE po.organization_id = $1';
      params.push(orgId);
    }
    
    query += ' ORDER BY po.created_at DESC';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching production orders:', error);
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
      organization_id,
      product_id,
      quantity_ordered,
      start_date,
      completion_date,
      status,
      notes,
      created_by,
    } = body;

    if (!organization_id || !product_id || !quantity_ordered) {
      return NextResponse.json(
        errorResponse('organization_id, product_id, and quantity_ordered are required'),
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber('MO', Date.now());
    
    const result = await sql.query(
      `INSERT INTO production_orders (organization_id, order_number, product_id, quantity_ordered, start_date, completion_date, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        organization_id,
        orderNumber,
        product_id,
        quantity_ordered,
        start_date,
        completion_date,
        status || 'planned',
        notes,
        created_by || 'system',
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Production order created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating production order:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
