const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function checkLatest() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc&limit=20`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await response.json();
        console.log('Latest 20 products:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}

checkLatest();
