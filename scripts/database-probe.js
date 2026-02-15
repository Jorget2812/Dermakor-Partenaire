const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function probe() {
    const tables = ['products', 'categories', 'orders', 'partner_users'];
    for (const table of tables) {
        console.log(`--- Probing ${table} ---`);
        try {
            // Check existence and columns via error trick
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=non_existent`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            console.log(`Schema check for ${table}:`, data.message);

            // Check count with no RLS assumptions (though REST always respects RLS)
            const countRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'count=exact',
                    'Range': '0-0'
                }
            });
            console.log(`Count result for ${table}:`, countRes.status, countRes.headers.get('content-range'));
        } catch (e) {
            console.error(`Error probing ${table}:`, e.message);
        }
    }
}

probe();
