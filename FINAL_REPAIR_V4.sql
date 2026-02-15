-- ==========================================
-- MASTER DATABASE REPAIR V4 - FINAL VERSION
-- ==========================================

-- 1. PERFILES (PROFILES) - CRÍTICO PARA RLS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'admin', -- Set to admin for recovery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vincular usuarios existentes a perfiles como admin
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. PRODUCTOS - AÑADIR COLUMNA STATUS SI NO EXISTE
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'ACTIVE';
    END IF;
END $$;

UPDATE public.products SET status = 'ACTIVE' WHERE status IS NULL;

-- 3. CATEGORÍAS - ASEGURAR VISIBILIDAD
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read on categories" ON public.categories;
CREATE POLICY "Public read on categories" ON public.categories FOR SELECT TO public USING (true);

-- 4. PRODUCTOS - ASEGURAR VISIBILIDAD
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read on products" ON public.products;
CREATE POLICY "Public read on products" ON public.products FOR SELECT TO public USING (true);

-- 5. SOCIOS (PARTNER_USERS) - ASEGURAR VISIBILIDAD
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read on partners" ON public.partner_users;
CREATE POLICY "Public read on partners" ON public.partner_users FOR SELECT TO public USING (true);

-- 6. PEDIDOS (ORDERS) - RLS FLEXIBLE PARA ADMINS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can see all orders" ON public.orders;
CREATE POLICY "Admins can see all orders" ON public.orders FOR SELECT TO public 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = partner_id);

-- 7. RE-CARGA DE PRODUCTOS DEL SCHEMA ORIGINAL (PARA ASEGURAR)
INSERT INTO public.products (sku, name, category, price, stock_status, status, description) VALUES
('KRX-BC1', 'BioCell+ BC1 "AHA & BHA" - 300 ml', 'Soin Peeling', 95.00, 'IN_STOCK', 'ACTIVE', 'Solution peeling AHA/BHA professionnelle.'),
('KRX-PPT', 'Pre Peel Toner', 'Tonique', 45.00, 'IN_STOCK', 'ACTIVE', 'Préparation essentielle avant peeling.'),
('KRX-EXO', 'Exosome Mask', 'Masque Concentré', 85.00, 'IN_STOCK', 'ACTIVE', 'Masque régénérant aux exosomes.')
ON CONFLICT (sku) DO UPDATE SET status = 'ACTIVE';

-- Vincular productos a categorías por nombre si no están vinculados
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name AND p.category_id IS NULL;
