const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:8h9A5Yn6Pz1B2K3L@db.nieyivfiqqgianiboblk.supabase.co:5432/postgres",
});

const sql = `
-- Columnas de visibilidad y niveles
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS allowed_tiers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS visibility_mode TEXT DEFAULT 'LOCKED';
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS academy_level TEXT DEFAULT 'STANDARD';
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS strategic_label TEXT;
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS volume_impact TEXT;
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS required_volume NUMERIC DEFAULT 0;

-- Eliminar restricción antigua y crear una flexible
DO $$ 
BEGIN 
    ALTER TABLE public.academy_content DROP CONSTRAINT IF EXISTS academy_content_tier_requirement_check;
END $$;

ALTER TABLE public.academy_content ADD CONSTRAINT academy_content_tier_requirement_check 
CHECK (tier_requirement IN ('STANDARD', 'PREMIUM', 'PREMIUM_BASE', 'PREMIUM_PRO', 'PREMIUM_ELITE', 'SPECIFIC', 'MULTIPLE'));
`;

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query(sql);
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
