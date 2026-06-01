import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const productId = searchParams.get('productId');

    let query = `
      SELECT bom.*, 
             p.name as product_name, p.sku as product_sku,
             cp.name as component_name, cp.sku as component_sku
      FROM bill_of_materials bom
      JOIN products p ON bom.product_id = p.id
      JOIN products cp ON bom.component_product_id = cp.id
    `;
    const params = [];
    const conditions = [];
    
    if (orgId) {
      conditions.push(`bom.organization_id = $${params.length + 1}`);
      params.push(orgId);
    }
    
    if (productId) {
      conditions.push(`bom.product_id = $${params.length + 1}`);
      params.push(productId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.name, cp.name';
    
    const result = await sql.query(query, params);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching bill of materials:', error);
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
      component_product_id,
      quantity_required,
      unit_of_measure,
    } = body;

    if (!organization_id || !product_id || !component_product_id || !quantity_required) {
      return NextResponse.json(
        errorResponse('organization_id, product_id, component_product_id, and quantity_required are required'),
        { status: 400 }
      );
    }

    const result = await sql.query(
      `INSERT INTO bill_of_materials (organization_id, product_id, component_product_id, quantity_required, unit_of_measure)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        organization_id,
        product_id,
        component_product_id,
        quantity_required,
        unit_of_measure,
      ]
    );

    return NextResponse.json(
      successResponse(result[0], 'Bill of materials created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bill of materials:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}
