-- ========================================================
-- REPARACIÓN DEFINITIVA: PROSPECTOS Y ACCESO DE CLIENTES
-- Instrucciones: Pega esto en el SQL Editor de Supabase
-- ========================================================

-- STEP 1: Asegurar tabla prospects y sus columnas
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    contact_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    zip TEXT,
    tier TEXT DEFAULT 'STANDARD',
    notes TEXT,
    status TEXT DEFAULT 'NEW',
    source TEXT DEFAULT 'WEB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Añadir columnas si no existen (vía SQL directo por si acaso el paso anterior solo creó la tabla vacía)
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'STANDARD';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NEW';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'WEB';

-- STEP 3: Limpiar y re-crear la restricción de status
ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_status_check 
    CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'PENDING', 'pending', 'APPROVED', 'REJECTED'));

-- STEP 4: Seguridad - Abrir acceso para inserción y lectura durante el login
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir el registro público
DROP POLICY IF EXISTS "Public insert prospects" ON public.prospects;
CREATE POLICY "Public insert prospects" ON public.prospects FOR INSERT TO public WITH CHECK (true);

-- Políticas para permitir la lectura necesaria durante el login (Evita bloqueos de RLS)
DROP POLICY IF EXISTS "Public select partner_users" ON public.partner_users;
CREATE POLICY "Public select partner_users" ON public.partner_users FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public select profiles" ON public.profiles;
CREATE POLICY "Public select profiles" ON public.profiles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public select prospects" ON public.prospects;
CREATE POLICY "Public select prospects" ON public.prospects FOR SELECT TO public USING (true);
