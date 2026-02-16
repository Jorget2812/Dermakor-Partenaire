-- FIX PROSPECTS TABLE SCHEMA AND RLS (CORRECTED)
DO $$ 
BEGIN
    -- 1. Asegurar que la tabla existe (por si acaso)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prospects') THEN
        CREATE TABLE public.prospects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- 2. Asegurar todas las columnas necesarias
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'status') THEN
        ALTER TABLE public.prospects ADD COLUMN status TEXT DEFAULT 'NEW';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'contact_name') THEN
        ALTER TABLE public.prospects ADD COLUMN contact_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'phone') THEN
        ALTER TABLE public.prospects ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'address') THEN
        ALTER TABLE public.prospects ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'city') THEN
        ALTER TABLE public.prospects ADD COLUMN city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'zip') THEN
        ALTER TABLE public.prospects ADD COLUMN zip TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'tier') THEN
        ALTER TABLE public.prospects ADD COLUMN tier TEXT DEFAULT 'STANDARD';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'notes') THEN
        ALTER TABLE public.prospects ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.prospects'::regclass AND attname = 'source') THEN
        ALTER TABLE public.prospects ADD COLUMN source TEXT DEFAULT 'WEB';
    END IF;

    -- 3. Corregir restricción de status
    ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
    ALTER TABLE public.prospects ADD CONSTRAINT prospects_status_check 
        CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'PENDING', 'pending', 'APPROVED', 'REJECTED'));

    -- 4. Habilitar RLS
    ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

    -- 5. Permitir inserción pública
    DROP POLICY IF EXISTS "Public insert prospects" ON public.prospects;
    CREATE POLICY "Public insert prospects" ON public.prospects FOR INSERT TO public WITH CHECK (true);

    -- 6. lectura para todos (para simplificar administración ahora)
    DROP POLICY IF EXISTS "Admin CRUD prospects" ON public.prospects;
    CREATE POLICY "Admin CRUD prospects" ON public.prospects FOR ALL TO public USING (true);

END $$;
