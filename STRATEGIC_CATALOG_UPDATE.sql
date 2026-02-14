-- ==========================================
-- STRATEGIC CATALOG EVOLUTION - DERMAKOR SWISS
-- ==========================================

-- 1. Añadir columnas de métricas avanzadas
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OUT_OF_STOCK', 'LOW_ROTATION'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS accumulated_profit NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS monthly_rotation INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS last_restock_at TIMESTAMP WITH TIME ZONE;

-- 2. Asegurar índices para búsqueda rápida (Escalabilidad 1000+)
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);

-- 3. Función para calcular rentabilidad media por categoría
CREATE OR REPLACE VIEW public.category_financial_insights AS
SELECT 
    c.id,
    c.name,
    COUNT(p.id) as product_count,
    COALESCE(AVG((p.retail_price - p.cost_price) / NULLIF(p.retail_price, 0)) * 100, 0) as avg_margin_pct
FROM public.categories c
LEFT JOIN public.products p ON c.id = p.category_id
GROUP BY c.id, c.name;
