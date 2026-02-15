import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listProspects() {
    console.log('Fetching prospects...');
    try {
        const { data, error } = await supabase
            .from('prospects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error.message);
            return;
        }

        console.log('--- PROSPECTS ---');
        data.forEach(p => {
            console.log(`Email: ${p.email} | Status: ${p.status} | Company: ${p.company_name} | Created: ${p.created_at}`);
        });
        console.log('-----------------');
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

listProspects();
