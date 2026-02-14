import { createClient } from '@supabase/supabase-js';
import { PRODUCT_CATEGORIES, PRODUCTS } from './constants.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCatalog() {
    console.log('--- STARTING CATALOG SYNC ---');

    // 1. Sync Categories
    console.log('Syncing categories...');
    const categoriesToInsert = PRODUCT_CATEGORIES.filter(c => c !== 'Tous les productos').map((name, index) => ({
        name,
        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        order_index: index + 1
    }));

    const { data: catData, error: catError } = await supabase
        .from('categories')
        .upsert(categoriesToInsert, { onConflict: 'name' })
        .select();

    if (catError) {
        console.error('Error syncing categories:', catError);
        return;
    }
    console.log(`Successfully synced ${catData?.length} categories.`);

    // Map names to IDs for product linking
    const categoryMap = catData.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
    }, {});

    // 2. Sync Products
    console.log('Syncing products...');
    const productsToInsert = PRODUCTS.map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        category_id: categoryMap[p.category] || null,
        price: p.price,
        cost_price: p.costPrice || (p.price * 0.4), // Fallback if no cost price
        retail_price: p.retailPrice || (p.price * 1.5), // Fallback if no retail price
        stock_status: p.stockStatus,
        description: p.description,
        status: 'ACTIVE'
    }));

    // Chunking to avoid large request limits
    const chunkSize = 50;
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
        const chunk = productsToInsert.slice(i, i + chunkSize);
        const { error: prodError } = await supabase
            .from('products')
            .upsert(chunk, { onConflict: 'sku' });

        if (prodError) {
            console.error(`Error syncing product chunk ${i}:`, prodError);
        } else {
            console.log(`Synced products ${i} to ${Math.min(i + chunkSize, productsToInsert.length)}`);
        }
    }

    console.log('--- CATALOG SYNC COMPLETE ---');
}

syncCatalog();
