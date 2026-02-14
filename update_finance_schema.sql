-- 1. Añadir costo a productos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT 0;

-- 2. Crear tabla de ajustes globales para márgenes
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insertar márgenes por defecto sugeridos por Jorge
INSERT INTO public.site_settings (key, value) VALUES
('global_margins', '{"standard": 50, "premium": 70}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Actualizar productos existentes con un costo base (ejemplo: 40% del precio base)
UPDATE public.products SET cost_price = price * 0.4 WHERE cost_price = 0;
