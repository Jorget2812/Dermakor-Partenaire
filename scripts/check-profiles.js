const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function checkProfiles() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'count=exact',
                'Range': '0-0'
            }
        });
        const count = response.headers.get('content-range')?.split('/')[1] || '0';
        console.log(`Profiles: ${count} rows.`);
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}

checkProfiles();
