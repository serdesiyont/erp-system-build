import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import fs from 'fs';
import path from 'path';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        errorResponse('DATABASE_URL is not set'),
        { status: 500 }
      );
    }

    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results: string[] = [];

    for (const stmt of statements) {
      try {
        await sql.query(`${stmt};`);
        const tableMatch = stmt.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i);
        const indexMatch = stmt.match(/CREATE INDEX IF NOT EXISTS\s+(\w+)/i);
        if (tableMatch) {
          results.push(`✓ Created table: ${tableMatch[1]}`);
        } else if (indexMatch) {
          results.push(`✓ Created index: ${indexMatch[1]}`);
        }
      } catch (err: any) {
        results.push(`✗ Failed: ${err.message}`);
      }
    }

    return NextResponse.json(
      successResponse({ results, count: results.length }, 'Migration complete'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      errorResponse(error.message || 'Migration failed'),
      { status: 500 }
    );
  }
}
