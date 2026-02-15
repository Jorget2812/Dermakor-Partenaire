const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listPartners() {
    const { data, error } = await supabase
        .from('partner_users')
        .select('*');

    if (error) {
        console.error('Error fetching partners:', error.message);
        return;
    }

    console.log('--- PARTNERS ---');
    console.table(data.map(p => ({
        id: p.id,
        email: p.email,
        status: p.status,
        company: p.company_name
    })));
}

listPartners();
