const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:8h9A5Yn6Pz1B2K3L@db.nieyivfiqqgianiboblk.supabase.co:5432/postgres",
});

const sql = `
-- FIX PROSPECTS TABLE - ENSURE COLUMN 'email' EXISTS
DO $$ 
BEGIN
    -- 1. Si existe contact_email pero no email, podemos duplicar los datos o añadir la columna
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prospects' AND column_name = 'email') THEN
        ALTER TABLE public.prospects ADD COLUMN email TEXT;
    END IF;

    -- 2. Asegurar que las columnas del formulario existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prospects' AND column_name = 'phone') THEN
        ALTER TABLE public.prospects ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prospects' AND column_name = 'address') THEN
        ALTER TABLE public.prospects ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prospects' AND column_name = 'zip') THEN
        ALTER TABLE public.prospects ADD COLUMN zip TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prospects' AND column_name = 'tier') THEN
        ALTER TABLE public.prospects ADD COLUMN tier TEXT DEFAULT 'STANDARD';
    END IF;

    -- 3. Copiar datos de contact_email a email si email está vacío
    UPDATE public.prospects SET email = contact_email WHERE email IS NULL AND contact_email IS NOT NULL;

    -- 4. RLS Policy - Permitir inserción anónima
    DROP POLICY IF EXISTS "Public insert prospects" ON public.prospects;
    CREATE POLICY "Public insert prospects" ON public.prospects FOR INSERT TO public WITH CHECK (true);

END $$;
`;

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query(sql);
        console.log('Prospects schema migration successful');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

run();
