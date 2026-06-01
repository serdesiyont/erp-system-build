import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError, generateOrderNumber } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    
    let query = `
      SELECT so.*, c.name as customer_name, COUNT(soi.id) as item_count
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
    `;
    const params = [];
    
    if (orgId) {
      query += ' WHERE so.organization_id = $1';
      params.push(orgId);
    }
    
    query += ' GROUP BY so.id, c.id ORDER BY so.created_at DESC';
    
    const result = await sql.query(query, params);
    
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching sales orders:', error);
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
      customer_id,
      order_date,
      due_date,
      status,
      notes,
      created_by,
    } = body;

    if (!organization_id || !customer_id) {
      return NextResponse.json(
        errorResponse('organization_id and customer_id are required'),
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber('SO', Date.now());
    
    const result = await sql.query(
      `INSERT INTO sales_orders (organization_id, order_number, customer_id, order_date, due_date, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        organization_id,
        orderNumber,
        customer_id,
        order_date || new Date().toISOString().split('T')[0],
        due_date,
        status || 'draft',
        notes,
        created_by || 'system',
      ]
    );
    
    return NextResponse.json(
      successResponse(result[0], 'Sales order created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sales order:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
