import { supabase } from './supabase';

interface ShopifyProduct {
    variants: {
        sku: string;
        inventory_quantity: number;
    }[];
}

export const syncShopifyInventory = async (shopifyUrl: string, accessToken: string) => {
    console.log('Starting Shopify inventory sync...');

    try {
        // 1. Fetch products from Shopify
        // Note: This uses the REST Admin API. For very large catalogs, pagination would be needed.
        const response = await fetch(`${shopifyUrl}/admin/api/2024-01/products.json?limit=250&fields=variants`, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.statusText}`);
        }

        const { products } = await response.json() as { products: ShopifyProduct[] };
        console.log(`Fetched ${products.length} products from Shopify.`);

        // 2. Extract SKU and Inventory levels
        const shopifyInventoryMap: Record<string, number> = {};
        products.forEach(p => {
            p.variants.forEach(v => {
                if (v.sku) {
                    shopifyInventoryMap[v.sku] = v.inventory_quantity;
                }
            });
        });

        // 3. Update Supabase products
        // We fetch our current SKUs to narrow down updates
        const { data: localProducts, error: fetchError } = await supabase
            .from('products')
            .select('id, sku');

        if (fetchError) throw fetchError;

        let updatedCount = 0;
        for (const localP of localProducts || []) {
            const newQty = shopifyInventoryMap[localP.sku];

            if (newQty !== undefined) {
                // Derive stock status from quantity
                let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
                if (newQty <= 0) status = 'OUT_OF_STOCK';
                else if (newQty < 5) status = 'LOW_STOCK';

                const { error: updateError } = await supabase
                    .from('products')
                    .update({
                        stock_quantity: newQty,
                        stock_status: status
                    })
                    .eq('id', localP.id);

                if (!updateError) updatedCount++;
            }
        }

        return {
            success: true,
            updated: updatedCount,
            totalShopify: Object.keys(shopifyInventoryMap).length
        };

    } catch (error: any) {
        console.error('Sync Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
