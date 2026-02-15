import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listProfiles() {
    console.log('Fetching profiles...');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) {
            console.error('Error:', error.message);
            return;
        }

        console.log('--- PROFILES ---');
        data.forEach(p => {
            console.log(`ID: ${p.id} | Name: ${p.full_name || p.first_name} | Role: ${p.role}`);
        });
        console.log('-----------------');
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

listProfiles();
