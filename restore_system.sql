-- ==========================================
-- RESTAURACIÓN MAESTRA DEL PORTAL DE SOCIOS (V2)
-- ATENCIÓN: Este script ELIMINARÁ y RECREARÁ las tablas para corregir errores de esquema.
-- ==========================================

-- 1. LIMPIEZA INICIAL (Para evitar conflictos de esquema antiguos)
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.partner_users CASCADE;
DROP TABLE IF EXISTS public.academy_resources CASCADE;

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

-- 4. TABLA DE PRODUCTOS
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_status TEXT NOT NULL CHECK (stock_status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    description TEXT,
    pricing JSONB DEFAULT '{"basePrice": 0, "standard": {"type": "PERCENTAGE", "value": 0}, "premium": {"type": "PERCENTAGE", "value": 10}}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE PEDIDOS
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PREPARATION' CHECK (status IN ('PREPARATION', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SEGURIDAD (RLS)
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS SIMPLIFICADAS PARA JORGE
CREATE POLICY "Public read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin CRUD products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read partners" ON public.partner_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin CRUD partners" ON public.partner_users FOR ALL TO authenticated USING (true);

CREATE POLICY "Orders access" ON public.orders FOR ALL TO authenticated USING (true);

-- 7. CARGA DE DATOS INICIALES (SEED)

-- Productos del Catálogo KRX Aesthetics
INSERT INTO public.products (sku, name, category, price, stock_status, description) VALUES
('KRX-GSP', 'Green Sea Peel', 'Peeling', 130.00, 'IN_STOCK', 'Spicules marins bio-microneedling.'),
('KRX-BC1', 'BioCell+ BC1 "AHA & BHA"', 'Peeling', 95.00, 'LOW_STOCK', 'Solution peeling AHA/BHA.'),
('KRX-MBA-BRX', 'Meso Booster Ampoule – Boto-RX', 'MesoBooster Ampoule', 110.00, 'IN_STOCK', 'Efecto botox-like.'),
('KRX-MDC', 'Mela Defense Cream', 'Crème', 65.00, 'IN_STOCK', 'Crème correctrice pigmentation.'),
('KRX-EXO', 'Exosome Mask', 'Masques', 85.00, 'IN_STOCK', 'Masque régénérant aux exosomes.')
ON CONFLICT (sku) DO NOTHING;

-- Socio de prueba para visibilidad en Dashboard
-- (Usamos el email de Jorge para que aparezca en su lista de socios)
INSERT INTO public.partner_users (id, company_name, contact_name, email, status, tier, city) VALUES
('d8e4f1a2-b3c4-4d5e-8f9a-0b1c2d3e4f5a', 'Institut Esthétique Léman', 'Jorge Torres', 'jorge@dermakorswiss.com', 'ACTIVE', 'PREMIUM', 'Genève')
ON CONFLICT (email) DO NOTHING;

-- Nota: No se insertan pedidos porque requieren un ID real de la tabla auth.users.
-- Una vez realices un pedido desde la web, aparecerá automáticamente.
