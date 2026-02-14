-- ==========================================
-- MASTER DATABASE REPAIR SCRIPT - DERMAKOR SWISS
-- ==========================================

-- 1. Crear tabla de categorías (Colecciones)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Asegurar columnas en tabla de productos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- 3. Habilitar RLS (Seguridad)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all on categories for admins" ON public.categories;
CREATE POLICY "Allow all on categories for admins" ON public.categories FOR ALL TO authenticated USING (true);

-- 4. INSERTAR LAS 13 COLECCIONES OFICIALES (ORDEN EXACTO)
-- Borrar anteriores para evitar conflictos de orden si es necesario
DELETE FROM public.categories;

INSERT INTO public.categories (name, slug, order_index) VALUES
('Gamme HomeCare', 'gamme-homecare', 1),
('Sérum', 'serum', 2),
('Crème', 'creme', 3),
('Tonique', 'tonique', 4),
('Démaquillant - Nettoyant', 'demaquillant-nettoyant', 5),
('Traitement Spécialisé', 'traitement-specialise', 6),
('Masque Concentré', 'masque-concentre', 7),
('Meso Booster Ampoule', 'meso-booster-ampoule', 8),
('Exfoliant', 'exfoliant', 9),
('Soin Peeling', 'soin-peeling', 10),
('Gamme Pfect-A', 'gamme-pfect-a', 11),
('Solution HydraFacial', 'solution-hydrafacial', 12),
('Accessoire', 'accessoire', 13);

-- 5. Vincular productos existentes a las nuevas categorías por nombre
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name;

-- 6. Crear tabla de configuraciones si no existe
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insertar márgenes por defecto
INSERT INTO public.site_settings (key, value)
VALUES ('global_margins', '{"standard": 50, "premium": 70}')
ON CONFLICT (key) DO NOTHING;
