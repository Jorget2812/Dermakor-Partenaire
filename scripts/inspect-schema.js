const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function inspectSchema(tableName) {
    console.log(`Inspecting schema for: ${tableName}`);
    try {
        // We can use a trick: try to select a non-existent column to get the available ones in the error message, 
        // OR better, use the postgrest 'informational query' if available, but usually a select with a limit of 0 is enough if we could see headers.
        // Actually, let's just try to select * and see if it works with an empty table.
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Range': '0-0'
            }
        });

        if (!response.ok) {
            console.error(`Error inspecting ${tableName}: ${response.status} ${await response.text()}`);
            return;
        }

        // Try to get one row to see columns
        const data = await response.json();
        if (data.length > 0) {
            console.log(`${tableName} columns:`, Object.keys(data[0]));
        } else {
            console.log(`${tableName} is empty, can't derive columns from data.`);
            // Try to force an error with a fake column to see if Supabase lists valid ones
            const errResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=dummy_column_to_list_valid_ones`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const errData = await errResponse.json();
            console.log(`${tableName} schema error hint:`, errData.message);
        }
    } catch (e) {
        console.error(`Fetch failed for ${tableName}:`, e.message);
    }
}

async function run() {
    await inspectSchema('partner_users');
    await inspectSchema('products');
    await inspectSchema('orders');
}

run();
