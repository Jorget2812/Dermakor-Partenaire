-- SCRIPT DE CREACIÓN DE COLECCIONES OFICIALES
-- Basado en la imagen proporcionada por Jorge

-- 1. Limpiar categorías anteriores si es necesario (Opcional, mejor insertar ON CONFLICT)
-- DELETE FROM public.categories;

-- 2. Insertar las 13 colecciones oficiales
INSERT INTO public.categories (name, slug, order_index) VALUES
('Démaquillant - Nettoyant', 'demaquillant-nettoyant', 1),
('Gamme HomeCare', 'gamme-homecare', 2),
('Traitement Spécialisé', 'traitement-specialise', 3),
('Masque Concentré', 'masque-concentre', 4),
('Meso Booster Ampoule', 'meso-booster-ampoule', 5),
('Crème', 'creme', 6),
('Tonique', 'tonique', 7),
('Exfoliant', 'exfoliant', 8),
('Soin Peeling', 'soin-peeling', 9),
('Gamme Pfect-A', 'gamme-pfect-a', 10),
('Solution HydraFacial', 'solution-hydrafacial', 11),
('Sérum', 'serum', 12),
('Accessoire', 'accessoire', 13)
ON CONFLICT (name) DO UPDATE SET order_index = EXCLUDED.order_index;

-- 3. Actualizar productos huérfanos si los nombres coincidieran
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name;
