-- 1. CLEANUP & PREPARATION
-- Ensure we have the categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. UPDATE PRODUCTS SCHEMA
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- 3. INSERT OFFICIAL COLLECTIONS
INSERT INTO public.categories (name, slug, order_index) VALUES
('Peeling', 'peeling', 1),
('Masque Concentré', 'masque-concentre', 2),
('Meso Booster Ampoule', 'meso-booster-ampoule', 3),
('Sérum', 'serum', 4),
('Crème', 'creme', 5),
('Tonique', 'tonique', 6),
('Démaquillant - Nettoyant', 'demaquillant-nettoyant', 7),
('Traitement Spécialisé', 'traitement-specialise', 8),
('Solution HydraFacial', 'solution-hydrafacial', 9),
('Gamme HomeCare', 'gamme-homecare', 10),
('Exfoliant', 'exfoliant', 11),
('Accessoire', 'accessoire', 12),
('Gamme Pfect-A', 'gamme-pfect-a', 13)
ON CONFLICT (name) DO UPDATE SET order_index = EXCLUDED.order_index;

-- 4. UPSERT ALL 100+ PRODUCTS
DO $$
DECLARE
    cat_id UUID;
BEGIN

-- PEELING
SELECT id INTO cat_id FROM public.categories WHERE name = 'Peeling';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-BC1', 'BioCell+ BC1 "AHA & BHA" - 300 ml', 'Peeling', cat_id, 95.00, 42.75, 171.00, 'LOW_STOCK', 'ACTIVE', 'Solution peeling AHA/BHA professionnelle.'),
('KRX-PPT', 'Pre Peel Toner', 'Peeling', cat_id, 45.00, 20.25, 81.00, 'LOW_STOCK', 'ACTIVE', 'Préparation essentielle avant peeling.'),
('KRX-IBPS', 'Illumin Biphasic Peeling Solution', 'Peeling', cat_id, 120.00, 54.00, 216.00, 'IN_STOCK', 'ACTIVE', 'Solution peeling biphasique illuminatrice.'),
('KRX-BLP', 'Blue Peel - 50 ml', 'Peeling', cat_id, 85.00, 38.25, 153.00, 'LOW_STOCK', 'ACTIVE', 'Peeling bleu intensif.'),
('KRX-BRP', 'Brightening Peel', 'Peeling', cat_id, 90.00, 40.50, 162.00, 'IN_STOCK', 'ACTIVE', 'Peeling éclaircissant.'),
('KRX-PPC', 'Pre Peel Cleanser', 'Peeling', cat_id, 42.00, 18.90, 75.60, 'LOW_STOCK', 'ACTIVE', 'Nettoyant préparatoire peeling.'),
('KRX-POT', 'Post Peel Toner', 'Peeling', cat_id, 45.00, 20.25, 81.00, 'IN_STOCK', 'ACTIVE', 'Tonique apaisant post-peeling.'),
('KRX-GLP', 'Glow Peel', 'Peeling', cat_id, 95.00, 42.75, 171.00, 'IN_STOCK', 'ACTIVE', 'Peeling éclat immédiat.'),
('KRX-CLP', 'Clear Peel', 'Peeling', cat_id, 92.00, 41.40, 165.60, 'IN_STOCK', 'ACTIVE', 'Peeling purifiant anti-imperfections.'),
('KRX-GSP', 'Green Sea Peel', 'Peeling', cat_id, 130.00, 58.50, 234.00, 'IN_STOCK', 'ACTIVE', 'Spicules marins bio-microneedling.'),
('KRX-R3T', 'R3 Therapeel', 'Peeling', cat_id, 110.00, 49.50, 198.00, 'IN_STOCK', 'ACTIVE', 'Peeling thérapeutique régénérant.'),
('KRX-MPP', 'MelaPro Plus Cold Peel', 'Peeling', cat_id, 140.00, 63.00, 252.00, 'IN_STOCK', 'ACTIVE', 'Peeling frío dépigmentant.'),
('KRX-LZP', 'LaZer Peel', 'Peeling', cat_id, 125.00, 56.25, 225.00, 'IN_STOCK', 'ACTIVE', 'Peeling efecto laser resurfacing.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- MASQUE CONCENTRÉ
SELECT id INTO cat_id FROM public.categories WHERE name = 'Masque Concentré';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-GM', 'Glass Mask (Édition Limitée)', 'Masque Concentré', cat_id, 65.00, 29.25, 117.00, 'OUT_OF_STOCK', 'ACTIVE', 'Masque effet peau de verre.'),
('KRX-EXO', 'Exosome Mask', 'Masque Concentré', cat_id, 85.00, 38.25, 153.00, 'IN_STOCK', 'ACTIVE', 'Masque régénérant aux exosomes.'),
('KRX-HSM-TA', 'Home Care Sheet Mask (Acide Tranéxamique + Arbutin)', 'Masque Concentré', cat_id, 35.00, 15.75, 63.00, 'OUT_OF_STOCK', 'ACTIVE', 'Pack masques éclaircissants.'),
('KRX-HSM-RET', 'Home Care Sheet Mask Pack (Retinol)', 'Masque Concentré', cat_id, 38.00, 17.10, 68.40, 'IN_STOCK', 'ACTIVE', 'Pack masques anti-âge rétinol.'),
('KRX-HSM-GLY', 'Home Care Sheet Mask Pack (Acide Glycolique)', 'Masque Concentré', cat_id, 35.00, 15.75, 63.00, 'IN_STOCK', 'ACTIVE', 'Pack masques exfoliants doux.'),
('KRX-JM-LC', 'Jelly Mask Lifting Collagen', 'Masque Concentré', cat_id, 55.00, 24.75, 99.00, 'LOW_STOCK', 'ACTIVE', 'Masque hydrogel collagène liftant.'),
('KRX-JM-HH', 'Jelly Mask Hydrating Hyaluron', 'Masque Concentré', cat_id, 55.00, 24.75, 99.00, 'LOW_STOCK', 'ACTIVE', 'Masque hydrogel hydratation intense.'),
('KRX-JM-GG', 'Jelly Mask Glowing Gold', 'Masque Concentré', cat_id, 58.00, 26.10, 104.40, 'LOW_STOCK', 'ACTIVE', 'Masque hydrogel or éclat.'),
('KRX-JM-SA', 'Jelly Mask Whitening Arbutin', 'Masque Concentré', cat_id, 58.00, 26.10, 104.40, 'LOW_STOCK', 'ACTIVE', 'Masque hydrogel éclaircissant.'),
('KRX-TBM', 'Treatment & Booster Biocellullose Mask', 'Masque Concentré', cat_id, 70.00, 31.50, 126.00, 'IN_STOCK', 'ACTIVE', 'Masque biocellulose booster.'),
('KRX-PESM', 'Pre Extraction Softening Mask - 220 g', 'Masque Concentré', cat_id, 48.00, 21.60, 86.40, 'LOW_STOCK', 'ACTIVE', 'Masque émollient avant extraction.'),
('KRX-CFI', 'Cryofacial Icy Mask', 'Masque Concentré', cat_id, 62.00, 27.90, 111.60, 'IN_STOCK', 'ACTIVE', 'Masque effet cryo apaisant.'),
('KRX-HCSM-C', 'Home Care Sheet Mask (CICA)', 'Masque Concentré', cat_id, 32.00, 14.40, 57.60, 'IN_STOCK', 'ACTIVE', 'Masque apaisant Cica.'),
('KRX-MTS', 'Mud to Sheet Mask', 'Masque Concentré', cat_id, 40.00, 18.00, 72.00, 'IN_STOCK', 'ACTIVE', 'Masque boue purifiant en feuille.'),
('KRX-HCSM-S', 'Home Care Sheet Mask (Acide Salicylic)', 'Masque Concentré', cat_id, 34.00, 15.30, 61.20, 'IN_STOCK', 'ACTIVE', 'Masque purifiant acide salicylique.'),
('KRX-VTX', 'V-Tox Higher Power', 'Masque Concentré', cat_id, 85.00, 38.25, 153.00, 'IN_STOCK', 'ACTIVE', 'Masque efecto lifting V-Shape.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- MESO BOOSTER AMPOULE
SELECT id INTO cat_id FROM public.categories WHERE name = 'Meso Booster Ampoule';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-MBA-BRX', 'Meso Booster Ampoule – Boto-RX', 'Meso Booster Ampoule', cat_id, 110.00, 49.50, 198.00, 'IN_STOCK', 'ACTIVE', 'Ampoule efecto botox-like.'),
('KRX-MBA-HA', 'MesoBooster HA+', 'Meso Booster Ampoule', cat_id, 105.00, 47.25, 189.00, 'IN_STOCK', 'ACTIVE', 'Acide hyaluronique pur stérile.'),
('KRX-MBA-DAC', 'Meso Booster Ampoule – Hydro Stemcell', 'Meso Booster Ampoule', cat_id, 115.00, 51.75, 207.00, 'IN_STOCK', 'ACTIVE', 'Cellules souches hydratantes.'),
('KRX-PABP', 'Premium Ampoule - Bio Placenta', 'Meso Booster Ampoule', cat_id, 130.00, 58.50, 234.00, 'IN_STOCK', 'ACTIVE', 'Facteurs de croissance bio-placenta.'),
('KRX-MBA-GOLD', 'Meso Booster Ampoule – Gold Peptide', 'Meso Booster Ampoule', cat_id, 140.00, 63.00, 252.00, 'IN_STOCK', 'ACTIVE', 'Peptides et or 24k.'),
('KRX-PAHP', 'Premium Ampoule - HA Filling Powder', 'Meso Booster Ampoule', cat_id, 125.00, 56.25, 225.00, 'IN_STOCK', 'ACTIVE', 'Poudre HA comblante.'),
('KRX-PAHM', 'Premium Ampoule - Hair Meso Solution', 'Meso Booster Ampoule', cat_id, 110.00, 49.50, 198.00, 'IN_STOCK', 'ACTIVE', 'Meso capillaire.'),
('KRX-MBA-PDRN', 'Meso Booster Ampoule – Salmon DNA (PDRN)', 'Meso Booster Ampoule', cat_id, 135.00, 60.75, 243.00, 'IN_STOCK', 'ACTIVE', 'ADN de saumon régénérant.'),
('KRX-ATF', 'Thread Fill Ampoule', 'Meso Booster Ampoule', cat_id, 120.00, 54.00, 216.00, 'IN_STOCK', 'ACTIVE', 'Ampoule efecto fils tenseurs.'),
('KRX-AUES', 'Premium Ampoule - Undereye Solution', 'Meso Booster Ampoule', cat_id, 95.00, 42.75, 171.00, 'IN_STOCK', 'ACTIVE', 'Spécial contour des yeux.'),
('KRX-MBA-WB', 'Meso Booster Ampoule – White and Bright', 'Meso Booster Ampoule', cat_id, 115.00, 51.75, 207.00, 'IN_STOCK', 'ACTIVE', 'Complexe éclaircissant.'),
('KRX-MBA-DAC1', 'Meso Booster Ampoule – Derm Acne Control', 'Meso Booster Ampoule', cat_id, 110.00, 49.50, 198.00, 'IN_STOCK', 'ACTIVE', 'Control acné et sébum.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- SÉRUM
SELECT id INTO cat_id FROM public.categories WHERE name = 'Sérum';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-GLU', 'Gluthatione Solution', 'Sérum', cat_id, 75.00, 33.75, 135.00, 'LOW_STOCK', 'ACTIVE', 'Solution éclat au glutathion.'),
('KRX-HPS', 'Hyal Plus Solution', 'Sérum', cat_id, 72.00, 32.40, 129.60, 'LOW_STOCK', 'ACTIVE', 'Booster hydratation intense.'),
('KRX-MDS', 'Mela Defense Serum', 'Sérum', cat_id, 89.00, 40.05, 160.20, 'IN_STOCK', 'ACTIVE', 'Sérum anti-taches.'),
('KRX-YFLS', 'Clinical Line Youthplex Face Lift Serum - 30 ml', 'Sérum', cat_id, 110.00, 49.50, 198.00, 'OUT_OF_STOCK', 'ACTIVE', 'Sérum liftant gamme clinique.'),
('KRX-HBS', 'Hair Boost Solution', 'Sérum', cat_id, 80.00, 36.00, 144.00, 'LOW_STOCK', 'ACTIVE', 'Solution boost capillaire.'),
('KRX-BS4', 'Booster Set 4 Solutions', 'Sérum', cat_id, 250.00, 112.50, 450.00, 'LOW_STOCK', 'ACTIVE', 'Kit complet 4 boosters.'),
('KRX-ADGVS', 'All Day Glow Vitamin Serum', 'Sérum', cat_id, 68.00, 30.60, 122.40, 'OUT_OF_STOCK', 'ACTIVE', 'Sérum vitaminé éclat quotidien.'),
('KRX-TFLS', 'The Face Lift Intensive Firming Serum', 'Sérum', cat_id, 95.00, 42.75, 171.00, 'IN_STOCK', 'ACTIVE', 'Sérum raffermissant intensif.'),
('KRX-BCRS', 'Big Cica Recovery Serum', 'Sérum', cat_id, 78.00, 35.10, 140.40, 'LOW_STOCK', 'ACTIVE', 'Grand format sérum Cica.'),
('KRX-PES', 'PhytoXome', 'Sérum', cat_id, 145.00, 65.25, 261.00, 'IN_STOCK', 'ACTIVE', 'Sérum avanzado aux exosomes.'),
('KRX-SRS', 'sDNA Repair Shot', 'Sérum', cat_id, 85.00, 38.25, 153.00, 'LOW_STOCK', 'ACTIVE', 'Shot réparateur ADN.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- CRÈME
SELECT id INTO cat_id FROM public.categories WHERE name = 'Crème';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-MDC', 'Mela Defense Cream - 50 g', 'Crème', cat_id, 65.00, 29.25, 117.00, 'IN_STOCK', 'ACTIVE', 'Crème correctrice pigmentation.'),
('KRX-ECP', 'Essence Cream Pad', 'Crème', cat_id, 45.00, 20.25, 81.00, 'IN_STOCK', 'ACTIVE', 'Disques imprégnés de crème essence.'),
('KRX-HNL', 'Holiday Crème Neck Lift (Édition Limitée)', 'Crème', cat_id, 70.00, 31.50, 126.00, 'IN_STOCK', 'ACTIVE', 'Crème cou liftante édition fêtes.'),
('KRX-YFLC', 'Clinical Line Youthplex Face Lift Cream - 50 g', 'Crème', cat_id, 98.00, 44.10, 176.40, 'OUT_OF_STOCK', 'ACTIVE', 'Crème liftante gamme clinique.'),
('KRX-RC', 'Repair Cream', 'Crème', cat_id, 42.00, 18.90, 75.60, 'LOW_STOCK', 'ACTIVE', 'Crème réparatrice barrière cutanée.'),
('KRX-NLFC', 'Neck Lift Intensive Firming Cream', 'Crème', cat_id, 75.00, 33.75, 135.00, 'OUT_OF_STOCK', 'ACTIVE', 'Crème raffermissante cou.'),
('KRX-BCRAC', 'Big Cica Recovery All Day Cream', 'Crème', cat_id, 58.00, 26.10, 104.40, 'LOW_STOCK', 'ACTIVE', 'Crème jour recuperación Cica.'),
('KRX-SPPC', 'Strengthen Protect Probiotic Cream', 'Crème', cat_id, 62.00, 27.90, 111.60, 'IN_STOCK', 'ACTIVE', 'Crème probiotique protectrice.'),
('KRX-ADGAC', 'All Day Glow Aqua Cream', 'Crème', cat_id, 55.00, 24.75, 99.00, 'IN_STOCK', 'ACTIVE', 'Gel-crème hydratant éclat.'),
('KRX-A31', 'Active-31 Revitalizing Eye Cream', 'Crème', cat_id, 52.00, 23.40, 93.60, 'LOW_STOCK', 'ACTIVE', 'Crème yeux revitalisante.'),
('KRX-CFMC', 'Cocoa Facial Massage Cream', 'Crème', cat_id, 48.00, 21.60, 86.40, 'OUT_OF_STOCK', 'ACTIVE', 'Crème de massage au cacao.'),
('KRX-CPAC', 'Clear & Prevent Anti Acne Cream', 'Crème', cat_id, 45.00, 20.25, 81.00, 'LOW_STOCK', 'ACTIVE', 'Crème traitante anti-acné.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- TONIQUE
SELECT id INTO cat_id FROM public.categories WHERE name = 'Tonique';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-CPAT', 'Clear & Prevent Anti Acne Face Toner', 'Tonique', cat_id, 38.00, 17.10, 68.40, 'LOW_STOCK', 'ACTIVE', 'Tonique purifiant acné.'),
('KRX-BCRT', 'Big Cica Recovery Ultra Healing Toner', 'Tonique', cat_id, 42.00, 18.90, 75.60, 'LOW_STOCK', 'ACTIVE', 'Tonique réparateur grand format.'),
('KRX-SPPT', 'Strengthen & Protect Probiotic Toner', 'Tonique', cat_id, 40.00, 18.00, 72.00, 'LOW_STOCK', 'ACTIVE', 'Tonique équilibrant probiotique.'),
('KRX-YPT', 'Clinical Line Youthplex Face Lift Toning Solution', 'Tonique', cat_id, 55.00, 24.75, 99.00, 'OUT_OF_STOCK', 'ACTIVE', 'Lotion tonique liftante.'),
('KRX-QTADG', 'Quenching Toner All Day Glow', 'Tonique', cat_id, 38.00, 17.10, 68.40, 'IN_STOCK', 'ACTIVE', 'Tonique hydratant éclat.'),
('KRX-BC3', 'BioCell+ BC3 "Cica" - 300 ml', 'Tonique', cat_id, 58.00, 26.10, 104.40, 'LOW_STOCK', 'ACTIVE', 'Solution tonique apaisante Cica.'),
('KRX-BC2', 'BioCell+ BC2 "HA & Collagen" - 300 ml', 'Tonique', cat_id, 58.00, 26.10, 104.40, 'LOW_STOCK', 'ACTIVE', 'Solution tonique hydratante collagène.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- DÉMAQUILLANT - NETTOYANT
SELECT id INTO cat_id FROM public.categories WHERE name = 'Démaquillant - Nettoyant';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-OGBC', 'Oxy Glow Bubble Cleanser "Pumpkin + Blue Tansy + Spirulina"', 'Démaquillant - Nettoyant', cat_id, 35.00, 15.75, 63.00, 'LOW_STOCK', 'ACTIVE', 'Nettoyant moussant oxygénant.'),
('KRX-YPC', 'Clinical Line Youthplex Face Lift Cleansing Fluid', 'Démaquillant - Nettoyant', cat_id, 48.00, 21.60, 86.40, 'OUT_OF_STOCK', 'ACTIVE', 'Fluide nettoyant liftant.'),
('KRX-GCADG', 'Gel Cleanser All Day Glow', 'Démaquillant - Nettoyant', cat_id, 32.00, 14.40, 57.60, 'IN_STOCK', 'ACTIVE', 'Gel nettoyant éclat.'),
('KRX-LDNE', 'Lait Démaquillant Nettoyant Enzymatique - 1000 ml', 'Démaquillant - Nettoyant', cat_id, 85.00, 38.25, 153.00, 'OUT_OF_STOCK', 'ACTIVE', 'Lait nettoyant format cabine.'),
('KRX-LDNEA', 'Lait Démaquillant Nettoyant Enzymatique & Antibactérien - 1000 ml', 'Démaquillant - Nettoyant', cat_id, 90.00, 40.50, 162.00, 'OUT_OF_STOCK', 'ACTIVE', 'Lait antibactérien cabine.'),
('KRX-CR21', 'Cica Recovery 2 in 1 Mask Cleanser', 'Démaquillant - Nettoyant', cat_id, 42.00, 18.90, 75.60, 'OUT_OF_STOCK', 'ACTIVE', 'Nettoyant et masque apaisant.'),
('KRX-OGBS', 'Oxy Glow Bubble Cleanser Spirulina - 150 ml', 'Démaquillant - Nettoyant', cat_id, 35.00, 15.75, 63.00, 'LOW_STOCK', 'ACTIVE', 'Nettoyant spiruline.'),
('KRX-OGBB', 'Oxy Glow Bubble Cleanser Blue Tansy - 150 ml', 'Démaquillant - Nettoyant', cat_id, 35.00, 15.75, 63.00, 'LOW_STOCK', 'ACTIVE', 'Nettoyant tanaisie bleue.'),
('KRX-OGBP', 'Oxy Glow Bubble Cleanser Pumpkin - 150 ml', 'Démaquillant - Nettoyant', cat_id, 35.00, 15.75, 63.00, 'LOW_STOCK', 'ACTIVE', 'Nettoyant citrouille.'),
('KRX-CPAW', 'Clear & Prevent Anti Acne Face Wash', 'Démaquillant - Nettoyant', cat_id, 30.00, 13.50, 54.00, 'LOW_STOCK', 'ACTIVE', 'Nettoyant visage anti-acné.'),
('KRX-SPPW', 'Strengthen & Protect Probiotic Face Wash', 'Démaquillant - Nettoyant', cat_id, 34.00, 15.30, 61.20, 'LOW_STOCK', 'ACTIVE', 'Nettoyant visage probiotique.'),
('KRX-LNEA-250', 'Lait Démaquillant Nettoyant Enzymatique - 250 ml', 'Démaquillant - Nettoyant', cat_id, 38.00, 17.10, 68.40, 'IN_STOCK', 'ACTIVE', 'Lait nettoyant revente.'),
('KRX-LNEA-250-AB', 'Lait Démaquillant Nettoyant Enzymatique & Antibactérien - 250 ml', 'Démaquillant - Nettoyant', cat_id, 40.00, 18.00, 72.00, 'IN_STOCK', 'ACTIVE', 'Lait antibactérien revente.'),
('KRX-HND', 'Pre Cleansing Oil', 'Démaquillant - Nettoyant', cat_id, 45.00, 20.25, 81.00, 'LOW_STOCK', 'ACTIVE', 'Huile démaquillante.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- TRAITEMENT SPÉCIALISÉ
SELECT id INTO cat_id FROM public.categories WHERE name = 'Traitement Spécialisé';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-CT500', 'Carboxy Therapy CO2 - 500 ml', 'Traitement Spécialisé', cat_id, 160.00, 72.00, 288.00, 'LOW_STOCK', 'ACTIVE', 'Gel carboxythérapie format pro.'),
('KRX-CT1000', 'Carboxy Therapy CO2 - 1000ml', 'Traitement Spécialisé', cat_id, 290.00, 130.50, 522.00, 'OUT_OF_STOCK', 'ACTIVE', 'Gel carboxythérapie format maxi.'),
('KRX-IHA', 'Inflacure Healing Active', 'Traitement Spécialisé', cat_id, 85.00, 38.25, 153.00, 'IN_STOCK', 'ACTIVE', 'Traitement activo anti-inflammatoire.'),
('KRX-PD13', 'PD-13 Therapy', 'Traitement Spécialisé', cat_id, 140.00, 63.00, 252.00, 'LOW_STOCK', 'ACTIVE', 'Thérapie photodynamique.'),
('KRX-CT150', 'Carboxy Therapy CO₂ Mini – 150 ml', 'Traitement Spécialisé', cat_id, 65.00, 29.25, 117.00, 'LOW_STOCK', 'ACTIVE', 'Kit ensayo carboxythérapie.'),
('KRX-ZTX', 'ZE-TOX', 'Traitement Spécialisé', cat_id, 120.00, 54.00, 216.00, 'IN_STOCK', 'ACTIVE', 'Traitement détoxifiant avanzado.'),
('KRX-VTM', 'VITAMEDI Solution', 'Traitement Spécialisé', cat_id, 95.00, 42.75, 171.00, 'IN_STOCK', 'ACTIVE', 'Solution vitaminada médi-esthétique.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- SOLUTION HYDRAFACIAL
SELECT id INTO cat_id FROM public.categories WHERE name = 'Solution HydraFacial';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-SH3', 'Solutions BioCell+ "BC1/BC2/BC3" - Pack 3 x 300 ml', 'Solution HydraFacial', cat_id, 150.00, 67.50, 270.00, 'LOW_STOCK', 'ACTIVE', 'Pack completo soluciones hydrodermabrasion.'),
('KRX-HDS', 'HydraSkin', 'Solution HydraFacial', cat_id, 55.00, 24.75, 99.00, 'OUT_OF_STOCK', 'ACTIVE', 'Solution hydratante pour machine.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- GAMME HOMECARE
SELECT id INTO cat_id FROM public.categories WHERE name = 'Gamme HomeCare';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-HP-ACNE', 'Holiday Set Acné Line (Édition Limitée)', 'Gamme HomeCare', cat_id, 85.00, 38.25, 153.00, 'IN_STOCK', 'ACTIVE', 'Coffret fiestas anti-acné.'),
('KRX-HP-GLOW', 'Holiday Set Glow Line (Édition Limitée)', 'Gamme HomeCare', cat_id, 85.00, 38.25, 153.00, 'IN_STOCK', 'ACTIVE', 'Coffret fiestas éclat.'),
('KRX-HP-PROBIO', 'Holiday Set Probiotic Line (Édition Limitée)', 'Gamme HomeCare', cat_id, 85.00, 38.25, 153.00, 'IN_STOCK', 'ACTIVE', 'Coffret fiestas probiotiques.'),
('KRX-GC-SPP', 'Gamme Complète Strenghten & Protect Probiotic', 'Gamme HomeCare', cat_id, 180.00, 81.00, 324.00, 'LOW_STOCK', 'ACTIVE', 'Routine completa probiotique.'),
('KRX-GC-CPA', 'Gamme Complète Clear & Prevent Anti Acné', 'Gamme HomeCare', cat_id, 175.00, 78.75, 315.00, 'LOW_STOCK', 'ACTIVE', 'Routine completa acné.'),
('KRX-GC-ADG', 'Gamme Complète All Day Glow', 'Gamme HomeCare', cat_id, 190.00, 85.50, 342.00, 'OUT_OF_STOCK', 'ACTIVE', 'Routine completa éclat.'),
('KRX-GC-YFL', 'Gamme Clinical Line Youthplex Face Lift', 'Gamme HomeCare', cat_id, 250.00, 112.50, 450.00, 'OUT_OF_STOCK', 'ACTIVE', 'Routine completa lifting.'),
('KRX-CSF-LM', 'Clinical Skin Filler Tinted Sunscreen (Light-Medium)', 'Gamme HomeCare', cat_id, 58.00, 26.10, 104.40, 'IN_STOCK', 'ACTIVE', 'Protección solar teintée claire.'),
('KRX-CSF-MD', 'Clinical Skin Filler Tinted Sunscreen (Medium-Dark)', 'Gamme HomeCare', cat_id, 58.00, 26.10, 104.40, 'IN_STOCK', 'ACTIVE', 'Protección solar teintée foncée.'),
('KRX-ADGS', 'All Day Glow Sunblocker SPF 50', 'Gamme HomeCare', cat_id, 48.00, 21.60, 86.40, 'IN_STOCK', 'ACTIVE', 'Protección solar SPF 50 éclat.'),
('KRX-TPKB', 'Trial Package Kit Booster', 'Gamme HomeCare', cat_id, 45.00, 20.25, 81.00, 'IN_STOCK', 'ACTIVE', 'Kit découverte boosters.'),
('KRX-CRS', 'Cica Recovery Set', 'Gamme HomeCare', cat_id, 95.00, 42.75, 171.00, 'LOW_STOCK', 'ACTIVE', 'Set recuperación Cica.'),
('KRX-JM', 'Jelly Mist', 'Gamme HomeCare', cat_id, 35.00, 15.75, 63.00, 'IN_STOCK', 'ACTIVE', 'Brume hydratante gélifiée.'),
('KRX-PMC', 'Patch Microneedling Cernes', 'Gamme HomeCare', cat_id, 25.00, 11.25, 45.00, 'IN_STOCK', 'ACTIVE', 'Patchs yeux micro-aiguilles.'),
('KRX-PML', 'Patch Microneedling Lèvres', 'Gamme HomeCare', cat_id, 25.00, 11.25, 45.00, 'IN_STOCK', 'ACTIVE', 'Patchs lèvres micro-aiguilles.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- EXFOLIANT
SELECT id INTO cat_id FROM public.categories WHERE name = 'Exfoliant';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-CFPW', 'Cocoa Facial Powder Wash - 100 g', 'Exfoliant', cat_id, 42.00, 18.90, 75.60, 'LOW_STOCK', 'ACTIVE', 'Poudre nettoyante enzymatique cacao.'),
('KRX-SPES', 'Skin Prep Exfoliant Solution - 150 ml', 'Exfoliant', cat_id, 38.00, 17.10, 68.40, 'IN_STOCK', 'ACTIVE', 'Solution exfoliante préparatoire.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- ACCESSOIRE
SELECT id INTO cat_id FROM public.categories WHERE name = 'Accessoire';
INSERT INTO public.products (sku, name, category, category_id, price, cost_price, retail_price, stock_status, status, description) VALUES
('KRX-ACC-SIL', 'Pinceau Silicone KRX', 'Accessoire', cat_id, 15.00, 6.75, 27.00, 'OUT_OF_STOCK', 'ACTIVE', 'Pinceau aplicación silicone.'),
('KRX-ACC-FAN', 'Pinceau Eventail KRX', 'Accessoire', cat_id, 18.00, 8.10, 32.40, 'OUT_OF_STOCK', 'ACTIVE', 'Pinceau éventail poils doux.'),
('KRX-ACC-HB', 'Bandeau KRX', 'Accessoire', cat_id, 12.00, 5.40, 21.60, 'OUT_OF_STOCK', 'ACTIVE', 'Bandeau soin visage.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    retail_price = EXCLUDED.retail_price,
    stock_status = EXCLUDED.stock_status,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

END $$;
