import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const invoiceId = searchParams.get('invoiceId');

    let query = 'SELECT * FROM payments';
    const params = [];
    const conditions = [];
    
    if (orgId) {
      conditions.push(`organization_id = $${params.length + 1}`);
      params.push(orgId);
    }
    
    if (invoiceId) {
      conditions.push(`invoice_id = $${params.length + 1}`);
      params.push(invoiceId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching payments:', error);
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
      invoice_id,
      payment_date,
      amount,
      payment_method,
      reference_number,
      notes,
      recorded_by,
    } = body;

    if (!organization_id || !invoice_id || !amount) {
      return NextResponse.json(
        errorResponse('organization_id, invoice_id, and amount are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO payments (organization_id, invoice_id, payment_date, amount, payment_method, reference_number, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        organization_id,
        invoice_id,
        payment_date || new Date().toISOString().split('T')[0],
        amount,
        payment_method,
        reference_number,
        notes,
        recorded_by || 'system',
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Payment recorded successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
