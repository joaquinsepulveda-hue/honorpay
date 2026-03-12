import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  connectionString: 'postgresql://postgres:Js9462985!!!@db.icecmgvdewtrgsbkdqhi.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('✓ Connected to database');

  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
  ];

  for (const file of migrations) {
    const sql = readFileSync(join(__dirname, '../supabase/migrations', file), 'utf8');
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`✓ ${file} done`);
  }

  await client.end();
  console.log('\n✅ All migrations complete!');
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
