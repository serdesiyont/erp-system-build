import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const result = await sql.query(
      `SELECT * FROM organizations ORDER BY created_at DESC`
    );
    
    return NextResponse.json(
      successResponse(result, 'Organizations retrieved successfully')
    );
  } catch (error) {
    console.error('Error fetching organizations:', error);
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
      user_id,
      name,
      description,
      address,
      city,
      state,
      postal_code,
      country,
      phone,
      email,
      website,
      tax_id,
      registration_number,
    } = body;

    if (!name || !user_id) {
      return NextResponse.json(
        errorResponse('Name and user_id are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO organizations (user_id, name, description, address, city, state, postal_code, country, phone, email, website, tax_id, registration_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        user_id,
        name,
        description,
        address,
        city,
        state,
        postal_code,
        country,
        phone,
        email,
        website,
        tax_id,
        registration_number,
      ]
    );
    
    return NextResponse.json(
      successResponse(result[0], 'Organization created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
