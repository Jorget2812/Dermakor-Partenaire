const SUPABASE_URL = 'https://nieyivfiqqgianiboblk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

// Hardcoded sample products for seeding (extracted from constants)
const PRODUCTS_TO_SEED = [
    { id: 'biocell-bc1-aha-bha', sku: 'KRX-BC1', name: 'BioCell+ BC1 "AHA & BHA" - 300 ml', category: 'Peeling', price: 95.00, stock_status: 'LOW_STOCK', description: 'Solution peeling AHA/BHA professionnelle.' },
    { id: 'green-sea-peel', sku: 'KRX-GSP', name: 'Green Sea Peel', category: 'Peeling', price: 130.00, stock_status: 'IN_STOCK', description: 'Spicules marins bio-microneedling.' },
    { id: 'meso-booster-ampoule-boto-rx', sku: 'KRX-MBA-BRX', name: 'Meso Booster Ampoule – Boto-RX', category: 'MesoBooster Ampoule', price: 110.00, stock_status: 'IN_STOCK', description: 'Ampoule efecto botox-like.' },
    { id: 'mela-defense-cream', sku: 'KRX-MDC', name: 'Mela Defense Cream - 50 g', category: 'Crème', price: 65.00, stock_status: 'IN_STOCK', description: 'Crème correctrice pigmentation.' }
];

// Add pricing logic to products
const productsWithPricing = PRODUCTS_TO_SEED.map(p => ({
    ...p,
    pricing: {
        basePrice: p.price,
        standard: { type: 'PERCENTAGE', value: 0 },
        premium: { type: 'PERCENTAGE', value: 10 }
    }
}));

async function seedTable(tableName, data) {
    console.log(`Seeding table: ${tableName} with ${data.length} rows...`);
    try {
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

        if (!response.ok) {
            const err = await response.text();
            console.error(`Error seeding ${tableName}: ${response.status} ${err}`);
        } else {
            console.log(`Successfully seeded ${tableName}`);
        }
    } catch (e) {
        console.error(`Fetch failed for ${tableName}:`, e.message);
    }
}

async function runSeeding() {
    // 1. Seed Products
    await seedTable('products', productsWithPricing);

    // 2. Seed some Partner Users
    const dummyPartners = [
        {
            id: 'd8e4f1a2-b3c4-4d5e-8f9a-0b1c2d3e4f5a', // Dummy UUID
            company_name: 'Institut de Beauté Genève',
            tier: 'PREMIUM',
            status: 'approved',
            address: 'Rue du Rhône 12',
            city: 'Genève',
            zip: '1204',
            email: 'geneve@test.com'
        },
        {
            id: 'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d',
            company_name: 'Derma Spa Zurich',
            tier: 'STANDARD',
            status: 'approved',
            address: 'Bahnhofstrasse 5',
            city: 'Zurich',
            zip: '8001',
            email: 'zurich@test.com'
        }
    ];
    await seedTable('partner_users', dummyPartners);

    // 3. Seed some Orders
    const dummyOrders = [
        {
            partner_id: 'd8e4f1a2-b3c4-4d5e-8f9a-0b1c2d3e4f5a',
            total_amount: 450.00,
            status: 'SHIPPED',
            items: [
                { id: 'biocell-bc1-aha-bha', name: 'BioCell+ BC1', quantity: 2, price: 95 },
                { id: 'green-sea-peel', name: 'Green Sea Peel', quantity: 2, price: 130 }
            ]
        },
        {
            partner_id: 'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d',
            total_amount: 110.00,
            status: 'PREPARATION',
            items: [
                { id: 'meso-booster-ampoule-boto-rx', name: 'Boto-RX', quantity: 1, price: 110 }
            ]
        }
    ];
    await seedTable('orders', dummyOrders);

    console.log('Seeding process finished.');
}

runSeeding();
