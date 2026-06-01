import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, parseError } from '@/lib/api-utils';
import { sql } from '@/lib/db/client';
import { DUMMY_USER_ID, DUMMY_ORG_ID } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        errorResponse('Database not configured. Set DATABASE_URL environment variable.'),
        { status: 500 }
      );
    }

    // Ensure dummy user and org exist with known IDs
    await sql.query(
      `INSERT INTO users (id, email, name, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET id = $1`,
      [DUMMY_USER_ID, 'owner@erppro.com', 'ERP Pro Owner']
    );

    await sql.query(
      `INSERT INTO organizations (id, user_id, name, description, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [DUMMY_ORG_ID, DUMMY_USER_ID, 'Demo Company', 'Default ERP organization for demo purposes']
    );

    // Check if already fully seeded
    const existingOrgs = await sql.query(
      `SELECT id FROM organizations WHERE id = $1`,
      [DUMMY_ORG_ID]
    );

    if (existingOrgs.length > 0) {
      const existingWarehouses = await sql.query(
        `SELECT id FROM warehouses WHERE organization_id = $1`,
        [DUMMY_ORG_ID]
      );
      if (existingWarehouses.length > 0) {
        return NextResponse.json(
          successResponse(null, 'Database already seeded with dummy IDs'),
          { status: 200 }
        );
      }
    }

    const defaultUser = [{ id: DUMMY_USER_ID }];
    const defaultOrg = [{ id: DUMMY_ORG_ID }];

    // Create default warehouse
    const defaultWarehouse = await sql.query(
      `INSERT INTO warehouses (organization_id, name, address, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
      [defaultOrg[0].id, 'Main Warehouse', 'Central Distribution Center']
    );

    // Create sample categories
    const categories = ['Electronics', 'Furniture', 'Supplies'];
    for (const category of categories) {
      await sql.query(
        `INSERT INTO categories (organization_id, name, created_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [defaultOrg[0].id, category]
      );
    }

    // Create sample products
    const products = [
      { name: 'Laptop', sku: 'LPT-001', price: 999.99, category: 'Electronics' },
      { name: 'Office Chair', sku: 'CHR-001', price: 249.99, category: 'Furniture' },
      { name: 'Notebook Pack', sku: 'NTB-001', price: 9.99, category: 'Supplies' },
    ];

    for (const product of products) {
      const category = await sql.query(
        `SELECT id FROM categories WHERE organization_id = $1 AND name = $2`,
        [defaultOrg[0].id, product.category]
      );

      if (category.length > 0) {
        await sql.query(
          `INSERT INTO products (organization_id, category_id, name, sku, selling_price, reorder_level, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
          [defaultOrg[0].id, category[0].id, product.name, product.sku, product.price, 10]
        );
      }
    }

    // Create sample customer
    await sql.query(
      `INSERT INTO customers (organization_id, name, email, phone, city, state, country, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [defaultOrg[0].id, 'Sample Customer Inc', 'customer@sample.com', '555-0100', 'New York', 'NY', 'USA']
    );

    // Create sample supplier
    await sql.query(
      `INSERT INTO suppliers (organization_id, name, email, phone, city, state, country, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [defaultOrg[0].id, 'Sample Supplier Ltd', 'supplier@sample.com', '555-0200', 'Los Angeles', 'CA', 'USA']
    );

    return NextResponse.json(
      successResponse(
        {
          user: defaultUser[0],
          organization: defaultOrg[0],
          warehouse: defaultWarehouse[0],
        },
        'Default ERP owner and demo data created successfully'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      errorResponse(parseError(error)),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Trigger seed data initialization on app startup
  try {
    // Just check if tables exist and contain data
    const userCount = await sql.query('SELECT COUNT(*) FROM users');
    return NextResponse.json(
      successResponse({ userCount: userCount[0]?.count || 0 }, 'Database is ready'),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse('Database not initialized yet'),
      { status: 500 }
    );
  }
}
