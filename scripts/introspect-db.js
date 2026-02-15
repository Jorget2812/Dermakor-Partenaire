const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function introspectOrders() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Range': '0-0',
                'Prefer': 'count=exact'
            }
        });

        if (!response.ok) {
            console.error(`Orders: ${response.status} ${await response.text()}`);
            return;
        }

        const data = await response.json();
        console.log('Orders data:', JSON.stringify(data, null, 2));

        // try to see columns by selecting a non-existent column to trigger error with column list
        const errResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=non_existent_column`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        });
        const errData = await errResponse.json();
        console.log('Introspection attempt:', JSON.stringify(errData, null, 2));

    } catch (e) {
        console.error(`Fetch failed: ${e.message}`);
    }
}

introspectOrders();
