const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function checkAll() {
    const tables = ['products', 'categories', 'orders', 'partner_users', 'profiles'];
    for (const table of tables) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Range': '0-0',
                    'Prefer': 'count=exact'
                }
            });
            const count = response.headers.get('content-range')?.split('/')[1] || '0';
            console.log(`${table}: ${count} rows.`);
        } catch (e) {
            console.error(`${table}: failed: ${e.message}`);
        }
    }
}

checkAll();
