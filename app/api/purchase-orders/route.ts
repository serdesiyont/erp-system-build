import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError, generateOrderNumber } from '@/lib/api-utils';
import { DUMMY_USER_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    let query = `
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
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
    console.error('Error fetching purchase orders:', error);
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
      supplier_id,
      order_date,
      expected_delivery_date,
      status,
      notes,
      created_by,
    } = body;

    if (!organization_id || !supplier_id) {
      return NextResponse.json(
        errorResponse('organization_id and supplier_id are required'),
        { status: 400 }
      );
    }

    const poNumber = generateOrderNumber('PO', Date.now());
    
    const result = await sql.query(
      `INSERT INTO purchase_orders (organization_id, po_number, supplier_id, order_date, expected_delivery_date, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        organization_id,
        poNumber,
        supplier_id,
        order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date,
        status || 'draft',
        notes,
        created_by || DUMMY_USER_ID,
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Purchase order created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
