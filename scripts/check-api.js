const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function checkTable(tableName) {
    console.log(`Checking table: ${tableName}`);
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Range': '0-0' // Just get the first row and count
            }
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`Error checking ${tableName}: ${response.status} ${err}`);
            return;
        }

        const data = await response.json();
        const countHeader = response.headers.get('content-range');
        console.log(`${tableName}: Found ${data.length} rows in this request. Range Header: ${countHeader}`);
        if (data.length > 0) {
            console.log(`Sample data from ${tableName}:`, JSON.stringify(data[0]).substring(0, 100));
        }
    } catch (e) {
        console.error(`Fetch failed for ${tableName}:`, e.message);
    }
}

async function run() {
    await checkTable('partner_users');
    await checkTable('products');
    await checkTable('orders');
}

run();
