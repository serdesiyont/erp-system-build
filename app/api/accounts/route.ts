import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    let query = 'SELECT * FROM accounts';
    const params = [];
    
    if (orgId) {
      query += ' WHERE organization_id = $1';
      params.push(orgId);
    }
    
    query += ' ORDER BY account_number';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching accounts:', error);
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
      account_number,
      account_name,
      account_type,
      account_subtype,
      description,
    } = body;

    if (!account_number || !account_name || !organization_id || !account_type) {
      return NextResponse.json(
        errorResponse('account_number, account_name, organization_id, and account_type are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO accounts (organization_id, account_number, account_name, account_type, account_subtype, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        organization_id,
        account_number,
        account_name,
        account_type,
        account_subtype,
        description,
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Account created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
