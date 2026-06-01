import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
let pool: Pool | null = null;

function getPool() {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
}

// Create SQL client using raw SQL queries
export const sql = {
  async query(text: string, params?: any[]) {
    const result = await getPool().query(text, params);
    return result.rows;
  },
};

export async function query(text: string, params?: any[]) {
  try {
    return await sql.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute raw SQL queries
export async function executeQuery(sqlString: string) {
  try {
    return await sql.query(sqlString);
  } catch (error) {
    console.error('Database execution error:', error);
    throw error;
  }
}

// Create a parameterized query helper
export function createQuery(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  let query = '';
  let paramIndex = 1;

  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${paramIndex}`;
      paramIndex++;
    }
  }

  return { query, values };
}
