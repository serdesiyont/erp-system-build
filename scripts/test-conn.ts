import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', url ? url.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
  if (!url) {
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  let timeoutId: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Query timed out')), 10000);
  });

  try {
    const result = await Promise.race([pool.query('SELECT 1 AS test'), timeout]);
    console.log('Query succeeded:', result);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    clearTimeout(timeoutId);
    await pool.end();
  }
}

main();
