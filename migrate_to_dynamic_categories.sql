-- 1. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS para categorías
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para categorías
DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT TO authenticated USING (true);

-- 4. Insertar categorías base
INSERT INTO public.categories (name, slug, order_index) VALUES
('Peeling', 'peeling', 1),
('Masques', 'masques', 2),
('MesoBooster Ampoule', 'mesobooster-ampoule', 3),
('Traitement Spécialisé', 'traitement-specialise', 4),
('Solution HydraFacial', 'solution-hydrafacial', 5),
('Gamme HomeCare', 'gamme-homecare', 6),
('Démaquillant - Nettoyant', 'demaquillant-nettoyant', 7),
('Tonique', 'tonique', 8),
('Exfoliant', 'exfoliant', 9),
('Accessoire - Appareillage', 'accessoire-appareillage', 10),
('Consommables', 'consommables', 11)
ON CONFLICT (name) DO NOTHING;

-- 5. Modificar tabla de productos para incluir category_id
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- 6. Migrar datos existentes (vincular category string con category_id)
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name;
