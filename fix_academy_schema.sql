-- Asegurar que las columnas nuevas existen en academy_content
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS allowed_tiers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS visibility_mode TEXT DEFAULT 'LOCKED';
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS academy_level TEXT DEFAULT 'STANDARD';
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS strategic_label TEXT;
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS volume_impact TEXT;
ALTER TABLE public.academy_content ADD COLUMN IF NOT EXISTS required_volume NUMERIC DEFAULT 0;

-- Eliminar o relajar la restricción de tier_requirement si existe para permitir valores extendidos
DO $$ 
BEGIN 
    ALTER TABLE public.academy_content DROP CONSTRAINT IF EXISTS academy_content_tier_requirement_check;
END $$;

-- Añadir una versión más flexible de la restricción
ALTER TABLE public.academy_content ADD CONSTRAINT academy_content_tier_requirement_check 
CHECK (tier_requirement IN ('STANDARD', 'PREMIUM', 'PREMIUM_BASE', 'PREMIUM_PRO', 'PREMIUM_ELITE', 'SPECIFIC', 'MULTIPLE'));
