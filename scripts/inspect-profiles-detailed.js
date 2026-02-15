const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function inspectSchemaDetailed() {
    try {
        // Use RPC or a trick to list columns and their nullable status
        // Since we can't easily run arbitrary SQL via REST without an RPC, 
        // we'll try to trigger errors for common columns to see if they exist.

        console.log('Probing columns for nullability...');
        const cols = ['email', 'full_name', 'role', 'avatar_url', 'updated_at'];
        for (const col of cols) {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=${col}`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Range': '0-0' }
            });
            console.log(`Column ${col}: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}

inspectSchemaDetailed();
