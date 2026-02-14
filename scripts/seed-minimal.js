const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

async function seedTable(tableName, data) {
    console.log(`Seeding table: ${tableName}...`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(data)
    });
    const resText = await response.text();
    console.log(`${tableName} status: ${response.status} ${resText}`);
}

async function run() {
    // Products without pricing column
    const basicProducts = [
        { id: 'p1', sku: 'KRX-B1', name: 'Product 1', price: 100, category: 'Peeling' },
        { id: 'p2', sku: 'KRX-B2', name: 'Product 2', price: 200, category: 'Sérum' }
    ];
    await seedTable('products', basicProducts);

    // Partner users without city column
    const basicPartners = [
        { id: '11111111-1111-1111-1111-111111111111', company_name: 'Test Partner 1', tier: 'STANDARD', status: 'approved' }
    ];
    await seedTable('partner_users', basicPartners);
}

run();
