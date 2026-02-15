-- ==========================================
-- ULTIMATE RECOVERY V6 - CONSTRAINT FIX
-- ==========================================

-- 1. REPARAR TABLA PROFILES (Remover restricciones que bloquean)
DO $$ 
BEGIN
    -- Asegurar que la tabla existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE);
    END IF;

    -- Añadir columnas si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'admin';
    END IF;

    -- QUITAR RESTRICCIONES NOT NULL (Para evitar el error 23502)
    ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
    ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
    ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;
END $$;

-- Sincronizar perfiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin', email = EXCLUDED.email;

-- 2. REPARAR PRODUCTOS (Asegurar columna status)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.products'::regclass AND attname = 'status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'ACTIVE';
    END IF;
END $$;

UPDATE public.products SET status = 'ACTIVE' WHERE status IS NULL;

-- 3. PERMISOS (Hacer todo legible para la App)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public bypass" ON public.profiles;
CREATE POLICY "Public bypass" ON public.profiles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public bypass products" ON public.products;
CREATE POLICY "Public bypass products" ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public bypass categories" ON public.categories;
CREATE POLICY "Public bypass categories" ON public.categories FOR SELECT TO public USING (true);

-- 4. INSERTAR PRODUCTO DE PRUEBA PARA CONFIRMAR VISIBILIDAD
INSERT INTO public.products (sku, name, category, price, stock_status, status, description) 
VALUES ('RECOVERY-V6', 'BioCell+ (V6 Active)', 'Soin Peeling', 95.00, 'IN_STOCK', 'ACTIVE', 'Sistema restaurado v6')
ON CONFLICT (sku) DO UPDATE SET status = 'ACTIVE';
