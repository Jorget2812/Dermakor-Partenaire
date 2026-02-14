-- 1. Añadir precio de venta final (Web) a productos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price NUMERIC(10, 2) DEFAULT 0;

-- 2. Inicializar con un valor estimado (ejemplo: 2.5x el costo o un margen sobre el precio base)
UPDATE public.products SET retail_price = price * 1.5 WHERE retail_price = 0;
