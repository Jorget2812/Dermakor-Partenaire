-- ==========================================
-- ULTIMATE REPAIR SCRIPT V5 - ROBUST FIX
-- ==========================================

-- 1. ASEGURAR TABLA PROFILES Y SUS COLUMNAS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Asegurar que todos los usuarios de Auth tengan un perfil Admin para esta fase
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. ASEGURAR TABLA PRODUCTS Y SUS COLUMNAS
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

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price NUMERIC(10, 2) DEFAULT 0;

UPDATE public.products SET status = 'ACTIVE' WHERE status IS NULL;

-- 3. ASEGURAR TABLA ORDERS Y SUS COLUMNAS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PREPARATION' CHECK (status IN ('PREPARATION', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'Online Store';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pagado';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'En attente';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'Livraison standard';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 4. PERMISOS (RLS) - PUBLIC READ
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (para desarrollo)
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read partners" ON public.partner_users;
CREATE POLICY "Public read partners" ON public.partner_users FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow all on orders for anyone" ON public.orders;
CREATE POLICY "Allow all on orders for anyone" ON public.orders FOR ALL TO public USING (true);

-- 5. CARGA DE DATOS SEED (OPCIONAL SI YA ESTÁN)
INSERT INTO public.products (sku, name, category, price, stock_status, status, description) VALUES
('RECOVERY-001', 'BioCell+ BC1 (Recovery)', 'Soin Peeling', 95.00, 'IN_STOCK', 'ACTIVE', 'Producto de recuperación rápida.')
ON CONFLICT (sku) DO NOTHING;
