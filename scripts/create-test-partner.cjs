const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createPartner() {
    const email = 'partner@test.com';
    const password = 'password123';

    console.log(`Attempting to sign up ${email}...`);

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('User already exists in Auth. Proceeding to check/create partner profile.');
        } else {
            console.error('Error signing up:', authError.message);
            return;
        }
    } else {
        console.log('User signed up successfully!');
        if (!authData.session && authData.user?.identities?.length === 0) {
            console.log('Note: User might need email confirmation if enabled in Supabase.');
        }
    }

    // 2. Create partner profile (even if user exists, we ensures profile is there)
    // We use a fixed ID for simplicity or get it from authData if available
    const userId = authData?.user?.id;

    console.log('Creating partner profile in partner_users...');
    const { error: profileError } = await supabase
        .from('partner_users')
        .insert([{
            email: email,
            company_name: 'Institut de Beauté Test',
            contact_name: 'Sophie Socio',
            tier: 'STANDARD',
            status: 'APPROVED',
            id: userId // If we have it
        }]);

    if (profileError) {
        console.error('Error creating partner profile:', profileError.message);
        console.log('Trying update if it already exists...');
        const { error: updateError } = await supabase
            .from('partner_users')
            .update({ status: 'APPROVED', tier: 'STANDARD' })
            .eq('email', email);
        if (updateError) console.error('Update error:', updateError.message);
        else console.log('Partner profile updated successfully!');
    } else {
        console.log('Partner profile created successfully!');
    }

    console.log('\n--- SUCCESS ---');
    console.log('Email: partner@test.com');
    console.log('Password: password123');
    console.log('URL: /login (standard portal)');
}

createPartner();
