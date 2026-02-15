import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkEmail(email) {
    console.log(`Checking email: ${email}`);

    // Check partner_users
    const { data: partner, error: partnerErr } = await supabase
        .from('partner_users')
        .select('*')
        .eq('email', email);

    console.log('partner_users matches:', partner?.length || 0);
    if (partner?.length) console.log(partner);

    // Check profiles
    const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    console.log('profiles matches:', profile?.length || 0);
    if (profile?.length) console.log(profile);
}

const emailToCheck = 'georgitorres2812@gmail.com';
checkEmail(emailToCheck);
checkEmail('test@partner.com');
checkEmail('jorgetorres2812@gmail.com');
