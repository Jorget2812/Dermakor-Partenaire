require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrices() {
    const { data, error } = await supabase
        .from('products')
        .select('name, price, retail_price');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total products: ${data.length}`);
    const withRetail = data.filter(p => p.retail_price !== null && p.retail_price > 0);
    console.log(`Products with retail_price: ${withRetail.length}`);

    console.log('\nSample products:');
    data.slice(0, 10).forEach(p => {
        console.log(`- ${p.name}: Base=${p.price}, Retail=${p.retail_price}`);
    });
}

checkPrices();
