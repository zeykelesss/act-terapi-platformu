import 'dotenv/config';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/(\w+)\.supabase\.co/)?.[1];

if (!dbPassword || !projectRef) {
  console.error('Missing SUPABASE_DB_PASSWORD or SUPABASE_URL');
  process.exit(1);
}

const sql = postgres({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  username: `postgres.${projectRef}`,
  password: dbPassword,
  ssl: 'require',
  max: 1,
  prepare: false,
});

const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

try {
  await sql.unsafe(schemaSql);
  console.log('✓ Schema applied');
  const rows = await sql`select table_name from information_schema.tables where table_schema = 'public'`;
  console.log('Public tables:', rows.map(r => r.table_name));
} catch (e) {
  console.error('✗ Failed:', e.message);
  process.exit(1);
} finally {
  await sql.end();
}
