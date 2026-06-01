import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql.query(
      `SELECT * FROM organizations WHERE id = $1`,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        errorResponse('Organization not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(successResponse(result[0]));
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const keys = Object.keys(body).filter(key => key !== 'id' && key !== 'created_at');
    const values = keys.map(key => body[key]);
    
    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const result = await sql.query(
      `UPDATE organizations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        errorResponse('Organization not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(successResponse(result[0]));
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql.query(
      `DELETE FROM organizations WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        errorResponse('Organization not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      successResponse({ id }, 'Organization deleted successfully')
    );
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
