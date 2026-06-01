import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    let query = 'SELECT * FROM suppliers';
    const params = [];
    
    if (orgId) {
      query += ' WHERE organization_id = $1';
      params.push(orgId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
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
      name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      tax_id,
      payment_terms,
      lead_time_days,
    } = body;

    if (!name || !organization_id) {
      return NextResponse.json(
        errorResponse('Name and organization_id are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO suppliers (organization_id, name, email, phone, address, city, state, postal_code, country, tax_id, payment_terms, lead_time_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        organization_id,
        name,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        country,
        tax_id,
        payment_terms,
        lead_time_days,
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Supplier created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
