const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function testInsert() {
    console.log('--- Attempting test insert to catch specific error ---');
    try {
        const payload = {
            name: 'Test Product',
            sku: 'TEST-' + Math.random().toString(36).substring(7),
            category: 'Consommables',
            price: 10,
            // purposely omitting stock_status to see if it fails
        };

        const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error('Insert failed:', res.status, await res.text());
        } else {
            console.log('Insert successful? (Wait, that might mean no RLS/constraints)');
        }
    } catch (e) {
        console.error('Error during test insert:', e.message);
    }
}

testInsert();
