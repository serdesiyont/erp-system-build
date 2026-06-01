import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';
import { DUMMY_USER_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    let query = 'SELECT * FROM invoices';
    const params = [];
    
    if (orgId) {
      query += ' WHERE organization_id = $1';
      params.push(orgId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching invoices:', error);
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
      invoice_number,
      customer_id,
      supplier_id,
      invoice_type,
      invoice_date,
      due_date,
      status,
      subtotal,
      tax,
      total,
      notes,
      created_by,
    } = body;

    if (!invoice_number || !organization_id || !invoice_type) {
      return NextResponse.json(
        errorResponse('invoice_number, organization_id, and invoice_type are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO invoices (organization_id, invoice_number, customer_id, supplier_id, invoice_type, invoice_date, due_date, status, subtotal, tax, total, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        organization_id,
        invoice_number,
        customer_id,
        supplier_id,
        invoice_type,
        invoice_date || new Date().toISOString().split('T')[0],
        due_date,
        status || 'draft',
        subtotal || 0,
        tax || 0,
        total || 0,
        notes,
        created_by || DUMMY_USER_ID,
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Invoice created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
