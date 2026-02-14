const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function checkTable(tableName) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Range': '0-0'
            }
        });

        if (!response.ok) {
            console.error(`${tableName}: ${response.status} ${await response.text()}`);
            return;
        }

        const data = await response.json();
        console.log(`${tableName}: Found ${data.length} rows.`);
    } catch (e) {
        console.error(`${tableName}: Fetch failed: ${e.message}`);
    }
}

async function run() {
    await checkTable('partner_users');
    await checkTable('profiles');
    await checkTable('products');
    await checkTable('orders');
    await checkTable('leads');
}

run();
