const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addAdminAsPartner() {
    const email = 'georgitorres2812@gmail.com';

    console.log(`Adding ${email} as an approved partner...`);

    // We don't necessarily need the ID if autolink is working, 
    // but better to get it if we can. Actually, let's just insert with email.

    const { error } = await supabase
        .from('partner_users')
        .upsert([{
            email: email,
            company_name: 'Dermakor HQ (Test Partner)',
            contact_name: 'Jorge Torres',
            status: 'APPROVED',
            tier: 'PREMIUM'
        }], { onConflict: 'email' });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success! Jorge is now also a partner in the database.');
    }
}

addAdminAsPartner();
