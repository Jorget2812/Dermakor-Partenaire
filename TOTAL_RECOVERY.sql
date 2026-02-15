-- ==========================================
-- TOTAL RECOVERY SCRIPT - DERMAKOR SWISS (V3)
-- LIMPIEZA TOTAL Y RECREACIÓN DE ESQUEMA CON NUEVAS COLUMNAS
-- ==========================================

-- 1. LIMPIEZA INICIAL
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.partner_users CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.academy_resources CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLA DE SOCIOS (PARTNER_USERS)
CREATE TABLE public.partner_users (
    id UUID PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT UNIQUE NOT NULL,
    address TEXT,
    city TEXT,
    zip TEXT,
    tier TEXT DEFAULT 'STANDARD' CHECK (tier IN ('STANDARD', 'PREMIUM')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE CATEGORÍAS (COLECCIONES)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE PRODUCTOS
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Legacy field
    category_id UUID REFERENCES public.categories(id),
    price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) DEFAULT 0,
    retail_price NUMERIC(10, 2) DEFAULT 0,
    stock_status TEXT NOT NULL CHECK (stock_status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    stock_quantity INTEGER DEFAULT 0,
    description TEXT,
    strategic_label TEXT,
    pricing JSONB DEFAULT '{"basePrice": 0, "standard": {"type": "PERCENTAGE", "value": 0}, "premium": {"type": "PERCENTAGE", "value": 10}}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE PEDIDOS (CON NUEVAS COLUMNAS)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PREPARATION' CHECK (status IN ('PREPARATION', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    items JSONB NOT NULL,
    channel TEXT DEFAULT 'Online Store',
    payment_status TEXT DEFAULT 'Pagado',
    delivery_status TEXT DEFAULT 'En attente',
    delivery_method TEXT DEFAULT 'Livraison standard',
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE ACADEMIA
CREATE TABLE public.academy_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('VIDEO', 'PDF', 'CERTIFICATION')),
    tier_req TEXT NOT NULL CHECK (tier_req IN ('STANDARD', 'PREMIUM')),
    thumbnail_url TEXT,
    resource_url TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SEGURIDAD (RLS)
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_resources ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS SIMPLIFICADAS
CREATE POLICY "Public read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin categories" ON public.categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read partners" ON public.partner_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin partners" ON public.partner_users FOR ALL TO authenticated USING (true);

CREATE POLICY "Orders access" ON public.orders FOR ALL TO authenticated USING (true);

CREATE POLICY "Academy read" ON public.academy_resources FOR SELECT TO authenticated USING (true);

-- 9. CARGA DE DATOS (SEED)

-- Insertar las 13 colecciones oficiales
INSERT INTO public.categories (name, slug, order_index) VALUES
('Démaquillant - Nettoyant', 'demaquillant-nettoyant', 1),
('Gamme HomeCare', 'gamme-homecare', 2),
('Traitement Spécialisé', 'traitement-specialise', 3),
('Masque Concentré', 'masque-concentre', 4),
('Meso Booster Ampoule', 'meso-booster-ampoule', 5),
('Crème', 'creme', 6),
('Tonique', 'tonique', 7),
('Exfoliant', 'exfoliant', 8),
('Soin Peeling', 'soin-peeling', 9),
('Gamme Pfect-A', 'gamme-pfect-a', 10),
('Solution HydraFacial', 'solution-hydrafacial', 11),
('Sérum', 'serum', 12),
('Accessoire', 'accessoire', 13);

-- Socio de prueba para visibilidad
INSERT INTO public.partner_users (id, company_name, contact_name, email, status, tier, city) VALUES
('d8e4f1a2-b3c4-4d5e-8f9a-0b1c2d3e4f5a', 'Institut Esthétique Léman', 'Jorge Torres', 'jorge@dermakorswiss.com', 'ACTIVE', 'PREMIUM', 'Genève')
ON CONFLICT (email) DO NOTHING;

-- Inserción de algunos productos clave vinculados a categorías
DO $$ 
DECLARE 
    cat_peel UUID;
    cat_cleans UUID;
    cat_home UUID;
BEGIN
    SELECT id INTO cat_peel FROM categories WHERE slug = 'soin-peeling';
    SELECT id INTO cat_cleans FROM categories WHERE slug = 'demaquillant-nettoyant';
    SELECT id INTO cat_home FROM categories WHERE slug = 'gamme-homecare';

    INSERT INTO products (sku, name, category, category_id, price, retail_price, stock_status, description) 
    VALUES ('KRX-DN-001', 'Foam Cleanser', 'Démaquillant - Nettoyant', cat_cleans, 30.00, 45.00, 'IN_STOCK', 'Nettoyant moussant doux');

    INSERT INTO products (sku, name, category, category_id, price, retail_price, stock_status, description) 
    VALUES ('KRX-SP-001', 'BioCell+ BC1 "AHA & BHA" - 300 ml', 'Soin Peeling', cat_peel, 95.00, 140.00, 'IN_STOCK', 'Peeling professionale');

    INSERT INTO products (sku, name, category, category_id, price, retail_price, stock_status, description) 
    VALUES ('KRX-HC-001', 'PDRN Repair Cream', 'Gamme HomeCare', cat_home, 42.00, 65.00, 'IN_STOCK', 'Crème réparatrice PDRN');
END $$;
