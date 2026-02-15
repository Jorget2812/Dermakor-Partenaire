const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:8h9A5Yn6Pz1B2K3L@db.nieyivfiqqgianiboblk.supabase.co:5432/postgres",
});

async function checkSchema() {
    try {
        await client.connect();

        // Check columns
        console.log('--- COLUMNS ---');
        const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'academy_content'
      ORDER BY ordinal_position;
    `);
        cols.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

        // Check constraints
        console.log('\n--- CONSTRAINTS ---');
        const constraints = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND conrelid = 'academy_content'::regclass;
    `);
        constraints.rows.forEach(row => {
            console.log(`${row.conname}: ${row.pg_get_constraintdef}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkSchema();
