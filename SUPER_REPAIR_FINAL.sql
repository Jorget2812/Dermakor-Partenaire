-- ==========================================
-- SÚPER REPARACIÓN: ACCESO DE CLIENTES Y REGISTRO
-- Ejecuta este script completo en el SQL Editor de Supabase
-- ==========================================

DO $$ 
BEGIN
    -- 1. REPARACIÓN DE LA TABLA PROSPECTOS (Para el Formulario de Registro)
    -- Aseguramos que la tabla existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prospects') THEN
        CREATE TABLE public.prospects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL);
    END IF;

    -- Añadimos columnas una por una de forma segura
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS company_name TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS contact_name TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS phone TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS address TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS city TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS zip TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT ''STANDARD''';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS notes TEXT';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT ''NEW''';
    EXECUTE 'ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS source TEXT DEFAULT ''WEB''';

    -- Aplicamos la restricción de estados (limpiando primero la antigua)
    ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
    ALTER TABLE public.prospects ADD CONSTRAINT prospects_status_check 
        CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'PENDING', 'pending', 'APPROVED', 'REJECTED'));

    -- Habilitar RLS y permitir inserción pública
    ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public insert prospects" ON public.prospects;
    CREATE POLICY "Public insert prospects" ON public.prospects FOR INSERT TO public WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow all read prospects" ON public.prospects;
    CREATE POLICY "Allow all read prospects" ON public.prospects FOR SELECT TO public USING (true);

    -- 2. REPARACIÓN DE ACCESO PARA LOGUEO (Tabla partner_users)
    -- El problema principal: Si el ID no coincide, RLS bloquea la lectura durante el login.
    -- Permitimos lectura pública para que el sistema de login pueda validar el Email y Status.
    ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can check partner status" ON public.partner_users;
    CREATE POLICY "Anyone can check partner status" ON public.partner_users FOR SELECT TO public USING (true);

    -- 3. REPARACIÓN DE PERFILES
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
    CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO public USING (true);

END $$;

-- Confirmación: Insertar un log o aviso si es necesario (opcional)
-- NOTA: Ahora el sistema de login podrá encontrar a los clientes por Email 
-- aunque su ID de Supabase sea diferente al ID de la tabla.
