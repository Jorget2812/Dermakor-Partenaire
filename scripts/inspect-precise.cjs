const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nieyivfiqqgianiboblk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXlpdmZpcXFnaWFuaWJvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTU0MjEsImV4cCI6MjA4NjQzMTQyMX0.omRrm2fS0bYAUIKLL3LETBr9bsd9pRRcqElIbRAbW2k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
    console.log('--- INSPECTING PRODUCTS COLUMNS ---');
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'products' });

    if (error) {
        console.log('RPC get_table_columns failed, trying raw query via REST...');
        const { data: rawData, error: rawError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (rawError) {
            console.error('Error fetching data:', rawError.message);
        } else if (rawData && rawData.length > 0) {
            console.log('Columns found from data:', Object.keys(rawData[0]));
        } else {
            console.log('Table is empty, cannot derive columns from SELECT *');
        }
    } else {
        console.log('Columns:', data);
    }
}

inspectColumns();
