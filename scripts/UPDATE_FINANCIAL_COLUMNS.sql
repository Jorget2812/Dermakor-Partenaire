-- Add financial and manual stock columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS accumulated_profit NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS monthly_rotation INTEGER DEFAULT 0;

-- Optional: Update existing records with some sample data if they are 0
-- UPDATE public.products SET stock_quantity = 50 WHERE stock_status = 'IN_STOCK' AND stock_quantity = 0;
