/* RESTORE SCHEMA AND CATEGORIES - DERMAKOR PARTNER PORTAL */

/* 1. Ensure Table categories exists */
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

/* 2. Update products table columns */
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS accumulated_profit NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS monthly_rotation INTEGER DEFAULT 0;

/* 3. Insert/Update official Collections */
INSERT INTO public.categories (name, slug, order_index) VALUES
('Peeling', 'peeling', 1),
('Masque Concentré', 'masque-concentre', 2),
('Meso Booster Ampoule', 'meso-booster-ampoule', 3),
('Sérum', 'serum', 4),
('Crème', 'creme', 5),
('Tonique', 'tonique', 6),
('Démaquillant - Nettoyant', 'demaquillant-nettoyant', 7),
('Traitement Spécialisé', 'traitement-specialise', 8),
('Solution HydraFacial', 'solution-hydrafacial', 9),
('Gamme HomeCare', 'gamme-homecare', 10),
('Exfoliant', 'exfoliant', 11),
('Accessoire', 'accessoire', 12),
('Gamme Pfect-A', 'gamme-pfect-a', 13)
ON CONFLICT (name) DO UPDATE SET order_index = EXCLUDED.order_index;

/* 4. Cross-link existing products to their categories */
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name AND p.category_id IS NULL;
