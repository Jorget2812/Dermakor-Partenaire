import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listUsers() {
    console.log('Fetching partner_users...');
    try {
        const { data, error } = await supabase
            .from('partner_users')
            .select('id, email, status, company_name, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error.message);
            return;
        }

        console.log('--- PARTNER USERS ---');
        data.forEach(u => {
            console.log(`Email: ${u.email} | Status: ${u.status} | Company: ${u.company_name} | Created: ${u.created_at} | ID: ${u.id}`);
        });
        console.log('---------------------');
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

listUsers();
