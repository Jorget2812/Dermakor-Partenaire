-- TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_status TEXT NOT NULL CHECK (stock_status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PREPARATION' CHECK (status IN ('PREPARATION', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE ACADEMIA
CREATE TABLE IF NOT EXISTS public.academy_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('VIDEO', 'PDF', 'CERTIFICATION')),
    tier_req TEXT NOT NULL CHECK (tier_req IN ('STANDARD', 'PREMIUM')),
    thumbnail_url TEXT,
    resource_url TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR SEGURIDAD (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_resources ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read on academy" ON public.academy_resources;
CREATE POLICY "Allow public read on academy" ON public.academy_resources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated 
USING (auth.uid() = partner_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager')));

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = partner_id);

-- CARGA INICIAL DE PRODUCTOS (SEED)
INSERT INTO public.products (sku, name, category, price, stock_status, description) VALUES
('KRX-BC1', 'BioCell+ BC1 "AHA & BHA" - 300 ml', 'Peeling', 95.00, 'LOW_STOCK', 'Solution peeling AHA/BHA professionnelle.'),
('KRX-PPT', 'Pre Peel Toner', 'Peeling', 45.00, 'LOW_STOCK', 'Préparation essentielle avant peeling.'),
('KRX-IBPS', 'Illumin Biphasic Peeling Solution', 'Peeling', 120.00, 'IN_STOCK', 'Solution peeling biphasique illuminatrice.'),
('KRX-BLP', 'Blue Peel - 50 ml', 'Peeling', 85.00, 'LOW_STOCK', 'Peeling bleu intensif.'),
('KRX-BRP', 'Brightening Peel', 'Peeling', 90.00, 'IN_STOCK', 'Peeling éclaircissant.'),
('KRX-PPC', 'Pre Peel Cleanser', 'Peeling', 42.00, 'LOW_STOCK', 'Nettoyant préparatoire peeling.'),
('KRX-POT', 'Post Peel Toner', 'Peeling', 45.00, 'IN_STOCK', 'Tonique apaisant post-peeling.'),
('KRX-GSP', 'Green Sea Peel', 'Peeling', 130.00, 'IN_STOCK', 'Spicules marins bio-microneedling.'),
('KRX-R3T', 'R3 Therapeel', 'Peeling', 110.00, 'IN_STOCK', 'Peeling thérapeutique régénérant.'),
('KRX-MPP', 'MelaPro Plus Cold Peel', 'Peeling', 140.00, 'IN_STOCK', 'Peeling froid dépigmentant.'),
('KRX-LZP', 'LaZer Peel', 'Peeling', 125.00, 'IN_STOCK', 'Peeling effet laser resurfacing.'),
('KRX-GM', 'Glass Mask (Édition Limitée)', 'Masques', 65.00, 'OUT_OF_STOCK', 'Masque effet peau de verre.'),
('KRX-EXO', 'Exosome Mask', 'Masques', 85.00, 'IN_STOCK', 'Masque régénérant aux exosomes.'),
('KRX-MBA-BRX', 'Meso Booster Ampoule – Boto-RX', 'MesoBooster Ampoule', 110.00, 'IN_STOCK', 'Ampoule efecto botox-like.'),
('KRX-CT500', 'Carboxy Therapy CO2 - 500 ml', 'Traitement Spécialisé', 160.00, 'LOW_STOCK', 'Gel carboxythérapie format pro.')
ON CONFLICT (sku) DO NOTHING;

-- CARGA INICIAL ACADEMIA
INSERT INTO public.academy_resources (title, type, tier_req, duration) VALUES
('Green Sea Peel: Protocoles Fondamentaux', 'PDF', 'STANDARD', '14 pages'),
('Carboxy Therapy: Application Professionnelle', 'VIDEO', 'STANDARD', '12 min'),
('Masterclass: Gestion de l''Hyperpigmentation', 'VIDEO', 'PREMIUM', '45 min')
ON CONFLICT DO NOTHING;
