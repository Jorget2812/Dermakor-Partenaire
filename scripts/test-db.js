import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
    console.log('Checking Supabase connection and tables...');

    // Check partner_users
    const { data: partners, error: partnersError, count: partnersCount } = await supabase
        .from('partner_users')
        .select('*', { count: 'exact' });

    if (partnersError) {
        console.error('Error fetching partner_users:', partnersError.message);
    } else {
        console.log(`partner_users: Found ${partnersCount} rows.`);
        if (partners && partners.length > 0) {
            console.log('First partner sample:', partners[0].company_name || partners[0].id);
        }
    }

    // Check products
    const { data: products, error: productsError, count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

    if (productsError) {
        console.error('Error fetching products:', productsError.message);
    } else {
        console.log(`products: Found ${productsCount} rows.`);
    }

    // Check orders
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

    if (ordersError) {
        console.error('Error fetching orders:', ordersError.message);
    } else {
        console.log(`orders: Found ${ordersCount} rows.`);
    }
}

checkDatabase();
