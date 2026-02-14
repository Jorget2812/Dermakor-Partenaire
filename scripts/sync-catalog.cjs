const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PRODUCT_CATEGORIES = [
    "Gamme HomeCare",
    "Sérum",
    "Crème",
    "Tonique",
    "Démaquillant - Nettoyant",
    "Traitement Spécialisé",
    "Masque Concentré",
    "Meso Booster Ampoule",
    "Exfoliant",
    "Soin Peeling",
    "Gamme Pfect-A",
    "Solution HydraFacial",
    "Accessoire"
];

const RAW_PRODUCTS = [
    // --- PEELING ---
    { sku: 'KRX-BC1', name: 'BioCell+ BC1 "AHA & BHA" - 300 ml', category: 'Peeling', price: 95.00, stockStatus: 'LOW_STOCK', description: 'Solution peeling AHA/BHA professionnelle.' },
    { sku: 'KRX-PPT', name: 'Pre Peel Toner', category: 'Peeling', price: 45.00, stockStatus: 'LOW_STOCK', description: 'Préparation essentielle avant peeling.' },
    { sku: 'KRX-IBPS', name: 'Illumin Biphasic Peeling Solution', category: 'Peeling', price: 120.00, stockStatus: 'IN_STOCK', description: 'Solution peeling biphasique illuminatrice.' },
    { sku: 'KRX-BLP', name: 'Blue Peel - 50 ml', category: 'Peeling', price: 85.00, stockStatus: 'LOW_STOCK', description: 'Peeling bleu intensif.' },
    { sku: 'KRX-BRP', name: 'Brightening Peel', category: 'Peeling', price: 90.00, stockStatus: 'IN_STOCK', description: 'Peeling éclaircissant.' },
    { sku: 'KRX-PPC', name: 'Pre Peel Cleanser', category: 'Peeling', price: 42.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant préparatoire peeling.' },
    { sku: 'KRX-POT', name: 'Post Peel Toner', category: 'Peeling', price: 45.00, stockStatus: 'IN_STOCK', description: 'Tonique apaisant post-peeling.' },
    { sku: 'KRX-GLP', name: 'Glow Peel', category: 'Peeling', price: 95.00, stockStatus: 'IN_STOCK', description: 'Peeling éclat immédiat.' },
    { sku: 'KRX-CLP', name: 'Clear Peel', category: 'Peeling', price: 92.00, stockStatus: 'IN_STOCK', description: 'Peeling purifiant anti-imperfections.' },
    { sku: 'KRX-GSP', name: 'Green Sea Peel', category: 'Peeling', price: 130.00, stockStatus: 'IN_STOCK', description: 'Spicules marins bio-microneedling.' },
    { sku: 'KRX-R3T', name: 'R3 Therapeel', category: 'Peeling', price: 110.00, stockStatus: 'IN_STOCK', description: 'Peeling thérapeutique régénérant.' },
    { sku: 'KRX-MPP', name: 'MelaPro Plus Cold Peel', category: 'Peeling', price: 140.00, stockStatus: 'IN_STOCK', description: 'Peeling frío dépigmentant.' },
    { sku: 'KRX-LZP', name: 'LaZer Peel', category: 'Peeling', price: 125.00, stockStatus: 'IN_STOCK', description: 'Peeling efecto laser resurfacing.' },
    // --- MASQUES ---
    { sku: 'KRX-GM', name: 'Glass Mask (Édition Limitée)', category: 'Masque Concentré', price: 65.00, stockStatus: 'OUT_OF_STOCK', description: 'Masque effet peau de verre.' },
    { sku: 'KRX-EXO', name: 'Exosome Mask', category: 'Masque Concentré', price: 85.00, stockStatus: 'IN_STOCK', description: 'Masque régénérant aux exosomes.' },
    { sku: 'KRX-HSM-TA', name: 'Home Care Sheet Mask (Acide Tranéxamique + Arbutin)', category: 'Masque Concentré', price: 35.00, stockStatus: 'OUT_OF_STOCK', description: 'Pack masques éclaircissants.' },
    { sku: 'KRX-HSM-RET', name: 'Home Care Sheet Mask Pack (Retinol)', category: 'Masque Concentré', price: 38.00, stockStatus: 'IN_STOCK', description: 'Pack masques anti-âge rétinol.' },
    { sku: 'KRX-HSM-GLY', name: 'Home Care Sheet Mask Pack (Acide Glycolique)', category: 'Masque Concentré', price: 35.00, stockStatus: 'IN_STOCK', description: 'Pack masques exfoliants doux.' },
    { sku: 'KRX-JM-LC', name: 'Jelly Mask Lifting Collagen', category: 'Masque Concentré', price: 55.00, stockStatus: 'LOW_STOCK', description: 'Masque hydrogel collagène liftant.' },
    { sku: 'KRX-JM-HH', name: 'Jelly Mask Hydrating Hyaluron', category: 'Masque Concentré', price: 55.00, stockStatus: 'LOW_STOCK', description: 'Masque hydrogel hydratation intense.' },
    { sku: 'KRX-JM-GG', name: 'Jelly Mask Glowing Gold', category: 'Masque Concentré', price: 58.00, stockStatus: 'LOW_STOCK', description: 'Masque hydrogel or éclat.' },
    { sku: 'KRX-JM-SA', name: 'Jelly Mask Whitening Arbutin', category: 'Masque Concentré', price: 58.00, stockStatus: 'LOW_STOCK', description: 'Masque hydrogel éclaircissant.' },
    { sku: 'KRX-TBM', name: 'Treatment & Booster Biocellullose Mask', category: 'Masque Concentré', price: 70.00, stockStatus: 'IN_STOCK', description: 'Masque biocellulose booster.' },
    { sku: 'KRX-PESM', name: 'Pre Extraction Softening Mask - 220 g', category: 'Masque Concentré', price: 48.00, stockStatus: 'LOW_STOCK', description: 'Masque émollient avant extraction.' },
    { sku: 'KRX-CFI', name: 'Cryofacial Icy Mask', category: 'Masque Concentré', price: 62.00, stockStatus: 'IN_STOCK', description: 'Masque effet cryo apaisant.' },
    { sku: 'KRX-HCSM-C', name: 'Home Care Sheet Mask (CICA)', category: 'Masque Concentré', price: 32.00, stockStatus: 'IN_STOCK', description: 'Masque apaisant Cica.' },
    { sku: 'KRX-MTS', name: 'Mud to Sheet Mask', category: 'Masque Concentré', price: 40.00, stockStatus: 'IN_STOCK', description: 'Masque boue purifiant en feuille.' },
    { sku: 'KRX-HCSM-S', name: 'Home Care Sheet Mask (Acide Salicylic)', category: 'Masque Concentré', price: 34.00, stockStatus: 'IN_STOCK', description: 'Masque purifiant acide salicylique.' },
    { sku: 'KRX-VTX', name: 'V-Tox Higher Power', category: 'Masque Concentré', price: 85.00, stockStatus: 'IN_STOCK', description: 'Masque effet lifting V-Shape.' },
    // --- MESOBOOSTER AMPOULE ---
    { sku: 'KRX-MBA-BRX', name: 'Meso Booster Ampoule – Boto-RX', category: 'Meso Booster Ampoule', price: 110.00, stockStatus: 'IN_STOCK', description: 'Ampoule effet botox-like.' },
    { sku: 'KRX-MBA-HA', name: 'MesoBooster HA+', category: 'Meso Booster Ampoule', price: 105.00, stockStatus: 'IN_STOCK', description: 'Acide hyaluronique pur stérile.' },
    { sku: 'KRX-MBA-DAC', name: 'Meso Booster Ampoule – Hydro Stemcell', category: 'Meso Booster Ampoule', price: 115.00, stockStatus: 'IN_STOCK', description: 'Cellules souches hydratantes.' },
    { sku: 'KRX-PABP', name: 'Premium Ampoule - Bio Placenta', category: 'Meso Booster Ampoule', price: 130.00, stockStatus: 'IN_STOCK', description: 'Facteurs de croissance bio-placenta.' },
    { sku: 'KRX-MBA-GOLD', name: 'Meso Booster Ampoule – Gold Peptide', category: 'Meso Booster Ampoule', price: 140.00, stockStatus: 'IN_STOCK', description: 'Peptides et or 24k.' },
    { sku: 'KRX-PAHP', name: 'Premium Ampoule - HA Filling Powder', category: 'Meso Booster Ampoule', price: 125.00, stockStatus: 'IN_STOCK', description: 'Poudre HA comblante.' },
    { sku: 'KRX-PAHM', name: 'Premium Ampoule - Hair Meso Solution', category: 'Meso Booster Ampoule', price: 110.00, stockStatus: 'IN_STOCK', description: 'Meso capillaire.' },
    { sku: 'KRX-MBA-PDRN', name: 'Meso Booster Ampoule – Salmon DNA (PDRN)', category: 'Meso Booster Ampoule', price: 135.00, stockStatus: 'IN_STOCK', description: 'ADN de saumon régénérant.' },
    { sku: 'KRX-ATF', name: 'Thread Fill Ampoule', category: 'Meso Booster Ampoule', price: 120.00, stockStatus: 'IN_STOCK', description: 'Ampoule efecto fils tenseurs.' },
    { sku: 'KRX-AUES', name: 'Premium Ampoule - Undereye Solution', category: 'Meso Booster Ampoule', price: 95.00, stockStatus: 'IN_STOCK', description: 'Spécial contour des yeux.' },
    { sku: 'KRX-MBA-WB', name: 'Meso Booster Ampoule – White and Bright', category: 'Meso Booster Ampoule', price: 115.00, stockStatus: 'IN_STOCK', description: 'Complexe éclaircissant.' },
    { sku: 'KRX-MBA-DAC1', name: 'Meso Booster Ampoule – Derm Acne Control', category: 'Meso Booster Ampoule', price: 110.00, stockStatus: 'IN_STOCK', description: 'Control acné et sébum.' },
    // --- SÉRUM ---
    { sku: 'KRX-GLU', name: 'Gluthatione Solution', category: 'Sérum', price: 75.00, stockStatus: 'LOW_STOCK', description: 'Solution éclat au glutathion.' },
    { sku: 'KRX-HPS', name: 'Hyal Plus Solution', category: 'Sérum', price: 72.00, stockStatus: 'LOW_STOCK', description: 'Booster hydratation intense.' },
    { sku: 'KRX-MDS', name: 'Mela Defense Serum', category: 'Sérum', price: 89.00, stockStatus: 'IN_STOCK', description: 'Sérum anti-taches.' },
    { sku: 'KRX-YFLS', name: 'Clinical Line Youthplex Face Lift Serum - 30 ml', category: 'Sérum', price: 110.00, stockStatus: 'OUT_OF_STOCK', description: 'Sérum liftant gamme clinique.' },
    { sku: 'KRX-HBS', name: 'Hair Boost Solution', category: 'Sérum', price: 80.00, stockStatus: 'LOW_STOCK', description: 'Solution boost capillaire.' },
    { sku: 'KRX-BS4', name: 'Booster Set 4 Solutions', category: 'Sérum', price: 250.00, stockStatus: 'LOW_STOCK', description: 'Kit complet 4 boosters.' },
    { sku: 'KRX-ADGVS', name: 'All Day Glow Vitamin Serum', category: 'Sérum', price: 68.00, stockStatus: 'OUT_OF_STOCK', description: 'Sérum vitaminé éclat quotidien.' },
    { sku: 'KRX-TFLS', name: 'The Face Lift Intensive Firming Serum', category: 'Sérum', price: 95.00, stockStatus: 'IN_STOCK', description: 'Sérum raffermissant intensif.' },
    { sku: 'KRX-BCRS', name: 'Big Cica Recovery Serum', category: 'Sérum', price: 78.00, stockStatus: 'LOW_STOCK', description: 'Grand format sérum Cica.' },
    { sku: 'KRX-PES', name: 'PhytoXome', category: 'Sérum', price: 145.00, stockStatus: 'IN_STOCK', description: 'Sérum avancé aux exosomes.' },
    { sku: 'KRX-SRS', name: 'sDNA Repair Shot', category: 'Sérum', price: 85.00, stockStatus: 'LOW_STOCK', description: 'Shot réparateur ADN.' },
    // --- CRÈME ---
    { sku: 'KRX-MDC', name: 'Mela Defense Cream - 50 g', category: 'Crème', price: 65.00, stockStatus: 'IN_STOCK', description: 'Crème correctrice pigmentation.' },
    { sku: 'KRX-ECP', name: 'Essence Cream Pad', category: 'Crème', price: 45.00, stockStatus: 'IN_STOCK', description: 'Disques imprégnés de crème essence.' },
    { sku: 'KRX-HNL', name: 'Holiday Crème Neck Lift (Édition Limitée)', category: 'Crème', price: 70.00, stockStatus: 'IN_STOCK', description: 'Crème cou liftante édition fêtes.' },
    { sku: 'KRX-YFLC', name: 'Clinical Line Youthplex Face Lift Cream - 50 g', category: 'Crème', price: 98.00, stockStatus: 'OUT_OF_STOCK', description: 'Crème liftante gamme clinique.' },
    { sku: 'KRX-RC', name: 'Repair Cream', category: 'Crème', price: 42.00, stockStatus: 'LOW_STOCK', description: 'Crème réparatrice barrière cutanée.' },
    { sku: 'KRX-NLFC', name: 'Neck Lift Intensive Firming Cream', category: 'Crème', price: 75.00, stockStatus: 'OUT_OF_STOCK', description: 'Crème raffermissante cou.' },
    { sku: 'KRX-BCRAC', name: 'Big Cica Recovery All Day Cream', category: 'Crème', price: 58.00, stockStatus: 'LOW_STOCK', description: 'Crème jour recuperación Cica.' },
    { sku: 'KRX-SPPC', name: 'Strengthen Protect Probiotic Cream', category: 'Crème', price: 62.00, stockStatus: 'IN_STOCK', description: 'Crème probiotique protectrice.' },
    { sku: 'KRX-ADGAC', name: 'All Day Glow Aqua Cream', category: 'Crème', price: 55.00, stockStatus: 'IN_STOCK', description: 'Gel-crème hydratant éclat.' },
    { sku: 'KRX-A31', name: 'Active-31 Revitalizing Eye Cream', category: 'Crème', price: 52.00, stockStatus: 'LOW_STOCK', description: 'Crème yeux revitalisante.' },
    { sku: 'KRX-CFMC', name: 'Cocoa Facial Massage Cream', category: 'Crème', price: 48.00, stockStatus: 'OUT_OF_STOCK', description: 'Crème de massage au cacao.' },
    { sku: 'KRX-CPAC', name: 'Clear & Prevent Anti Acne Cream', category: 'Crème', price: 45.00, stockStatus: 'LOW_STOCK', description: 'Crème traitante anti-acné.' },
    // --- TONIQUE ---
    { sku: 'KRX-CPAT', name: 'Clear & Prevent Anti Acne Face Toner', category: 'Tonique', price: 38.00, stockStatus: 'LOW_STOCK', description: 'Tonique purifiant acné.' },
    { sku: 'KRX-BCRT', name: 'Big Cica Recovery Ultra Healing Toner', category: 'Tonique', price: 42.00, stockStatus: 'LOW_STOCK', description: 'Tonique réparateur grand format.' },
    { sku: 'KRX-SPPT', name: 'Strengthen & Protect Probiotic Toner', category: 'Tonique', price: 40.00, stockStatus: 'LOW_STOCK', description: 'Tonique équilibrant probiotique.' },
    { sku: 'KRX-YPT', name: 'Clinical Line Youthplex Face Lift Toning Solution', category: 'Tonique', price: 55.00, stockStatus: 'OUT_OF_STOCK', description: 'Lotion tonique liftante.' },
    { sku: 'KRX-QTADG', name: 'Quenching Toner All Day Glow', category: 'Tonique', price: 38.00, stockStatus: 'IN_STOCK', description: 'Tonique hydratant éclat.' },
    { sku: 'KRX-BC3', name: 'BioCell+ BC3 "Cica" - 300 ml', category: 'Tonique', price: 58.00, stockStatus: 'LOW_STOCK', description: 'Solution tonique apaisante Cica.' },
    { sku: 'KRX-BC2', name: 'BioCell+ BC2 "HA & Collagen" - 300 ml', category: 'Tonique', price: 58.00, stockStatus: 'LOW_STOCK', description: 'Solution tonique hydratante collagène.' },
    // --- DÉMAQUILLANT - NETTOYANT ---
    { sku: 'KRX-OGBC', name: 'Oxy Glow Bubble Cleanser "Pumpkin + Blue Tansy + Spirulina"', category: 'Démaquillant - Nettoyant', price: 35.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant moussant oxygénant.' },
    { sku: 'KRX-YPC', name: 'Clinical Line Youthplex Face Lift Cleansing Fluid', category: 'Démaquillant - Nettoyant', price: 48.00, stockStatus: 'OUT_OF_STOCK', description: 'Fluide nettoyant liftant.' },
    { sku: 'KRX-GCADG', name: 'Gel Cleanser All Day Glow', category: 'Démaquillant - Nettoyant', price: 32.00, stockStatus: 'IN_STOCK', description: 'Gel nettoyant éclat.' },
    { sku: 'KRX-LDNE', name: 'Lait Démaquillant Nettoyant Enzymatique - 1000 ml', category: 'Démaquillant - Nettoyant', price: 85.00, stockStatus: 'OUT_OF_STOCK', description: 'Lait nettoyant format cabine.' },
    { sku: 'KRX-LDNEA', name: 'Lait Démaquillant Nettoyant Enzymatique & Antibactérien - 1000 ml', category: 'Démaquillant - Nettoyant', price: 90.00, stockStatus: 'OUT_OF_STOCK', description: 'Lait antibactérien cabine.' },
    { sku: 'KRX-CR21', name: 'Cica Recovery 2 in 1 Mask Cleanser', category: 'Démaquillant - Nettoyant', price: 42.00, stockStatus: 'OUT_OF_STOCK', description: 'Nettoyant et masque apaisant.' },
    { sku: 'KRX-OGBS', name: 'Oxy Glow Bubble Cleanser Spirulina - 150 ml', category: 'Démaquillant - Nettoyant', price: 35.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant spiruline.' },
    { sku: 'KRX-OGBB', name: 'Oxy Glow Bubble Cleanser Blue Tansy - 150 ml', category: 'Démaquillant - Nettoyant', price: 35.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant tanaisie bleue.' },
    { sku: 'KRX-OGBP', name: 'Oxy Glow Bubble Cleanser Pumpkin - 150 ml', category: 'Démaquillant - Nettoyant', price: 35.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant citrouille.' },
    { sku: 'KRX-CPAW', name: 'Clear & Prevent Anti Acne Face Wash', category: 'Démaquillant - Nettoyant', price: 30.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant visage anti-acné.' },
    { sku: 'KRX-SPPW', name: 'Strengthen & Protect Probiotic Face Wash', category: 'Démaquillant - Nettoyant', price: 34.00, stockStatus: 'LOW_STOCK', description: 'Nettoyant visage probiotique.' },
    { sku: 'KRX-LNEA-250', name: 'Lait Démaquillant Nettoyant Enzymatique - 250 ml', category: 'Démaquillant - Nettoyant', price: 38.00, stockStatus: 'IN_STOCK', description: 'Lait nettoyant revente.' },
    { sku: 'KRX-LNEA-250-AB', name: 'Lait Démaquillant Nettoyant Enzymatique & Antibactérien - 250 ml', category: 'Démaquillant - Nettoyant', price: 40.00, stockStatus: 'IN_STOCK', description: 'Lait antibactérien revente.' },
    { sku: 'KRX-HND', name: 'Pre Cleansing Oil', category: 'Démaquillant - Nettoyant', price: 45.00, stockStatus: 'LOW_STOCK', description: 'Huile démaquillante.' },
    // --- TRAITEMENT SPÉCIALISÉ ---
    { sku: 'KRX-CT500', name: 'Carboxy Therapy CO2 - 500 ml', category: 'Traitement Spécialisé', price: 160.00, stockStatus: 'LOW_STOCK', description: 'Gel carboxythérapie format pro.' },
    { sku: 'KRX-CT1000', name: 'Carboxy Therapy CO2 - 1000ml', category: 'Traitement Spécialisé', price: 290.00, stockStatus: 'OUT_OF_STOCK', description: 'Gel carboxythérapie format maxi.' },
    { sku: 'KRX-IHA', name: 'Inflacure Healing Active', category: 'Traitement Spécialisé', price: 85.00, stockStatus: 'IN_STOCK', description: 'Traitement actif anti-inflammatoire.' },
    { sku: 'KRX-PD13', name: 'PD-13 Therapy', category: 'Traitement Spécialisé', price: 140.00, stockStatus: 'LOW_STOCK', description: 'Thérapie photodynamique.' },
    { sku: 'KRX-CT150', name: 'Carboxy Therapy CO₂ Mini – 150 ml', category: 'Traitement Spécialisé', price: 65.00, stockStatus: 'LOW_STOCK', description: 'Kit ensayo carboxythérapie.' },
    { sku: 'KRX-ZTX', name: 'ZE-TOX', category: 'Traitement Spécialisé', price: 120.00, stockStatus: 'IN_STOCK', description: 'Traitement détoxifiant avancé.' },
    { sku: 'KRX-VTM', name: 'VITAMEDI Solution', category: 'Traitement Spécialisé', price: 95.00, stockStatus: 'IN_STOCK', description: 'Solution vitaminée médi-esthétique.' },
    // --- SOLUTION HYDRAFACIAL ---
    { sku: 'KRX-SH3', name: 'Solutions BioCell+ "BC1/BC2/BC3" - Pack 3 x 300 ml', category: 'Solution HydraFacial', price: 150.00, stockStatus: 'LOW_STOCK', description: 'Pack complet solutions hydrodermabrasion.' },
    { sku: 'KRX-HDS', name: 'HydraSkin', category: 'Solution HydraFacial', price: 55.00, stockStatus: 'OUT_OF_STOCK', description: 'Solution hydratante pour machine.' },
    // --- GAMME HOMECARE ---
    { sku: 'KRX-HP-ACNE', name: 'Holiday Set Acné Line (Édition Limitée)', category: 'Gamme HomeCare', price: 85.00, stockStatus: 'IN_STOCK', description: 'Coffret fêtes anti-acné.' },
    { sku: 'KRX-HP-GLOW', name: 'Holiday Set Glow Line (Édition Limitée)', category: 'Gamme HomeCare', price: 85.00, stockStatus: 'IN_STOCK', description: 'Coffret fêtes éclat.' },
    { sku: 'KRX-HP-PROBIO', name: 'Holiday Set Probiotic Line (Édition Limitée)', category: 'Gamme HomeCare', price: 85.00, stockStatus: 'IN_STOCK', description: 'Coffret fêtes probiotiques.' },
    { sku: 'KRX-GC-SPP', name: 'Gamme Complète Strenghten & Protect Probiotic', category: 'Gamme HomeCare', price: 180.00, stockStatus: 'LOW_STOCK', description: 'Routine complète probiotique.' },
    { sku: 'KRX-GC-CPA', name: 'Gamme Complète Clear & Prevent Anti Acné', category: 'Gamme HomeCare', price: 175.00, stockStatus: 'LOW_STOCK', description: 'Routine complète acné.' },
    { sku: 'KRX-GC-ADG', name: 'Gamme Complète All Day Glow', category: 'Gamme HomeCare', price: 190.00, stockStatus: 'OUT_OF_STOCK', description: 'Routine complète éclat.' },
    { sku: 'KRX-GC-YFL', name: 'Gamme Clinical Line Youthplex Face Lift', category: 'Gamme HomeCare', price: 250.00, stockStatus: 'OUT_OF_STOCK', description: 'Routine complète lifting.' },
    { sku: 'KRX-CSF-LM', name: 'Clinical Skin Filler Tinted Sunscreen (Light-Medium)', category: 'Gamme HomeCare', price: 58.00, stockStatus: 'IN_STOCK', description: 'Protection solaire teintée claire.' },
    { sku: 'KRX-CSF-MD', name: 'Clinical Skin Filler Tinted Sunscreen (Medium-Dark)', category: 'Gamme HomeCare', price: 58.00, stockStatus: 'IN_STOCK', description: 'Protection solaire teintée foncée.' },
    { sku: 'KRX-ADGS', name: 'All Day Glow Sunblocker SPF 50', category: 'Gamme HomeCare', price: 48.00, stockStatus: 'IN_STOCK', description: 'Protection solaire SPF 50 éclat.' },
    { sku: 'KRX-TPKB', name: 'Trial Package Kit Booster', category: 'Gamme HomeCare', price: 45.00, stockStatus: 'IN_STOCK', description: 'Kit découverte boosters.' },
    { sku: 'KRX-CRS', name: 'Cica Recovery Set', category: 'Gamme HomeCare', price: 95.00, stockStatus: 'LOW_STOCK', description: 'Set récupération Cica.' },
    { sku: 'KRX-JM', name: 'Jelly Mist', category: 'Gamme HomeCare', price: 35.00, stockStatus: 'IN_STOCK', description: 'Brume hydratante gélifiée.' },
    { sku: 'KRX-PMC', name: 'Patch Microneedling Cernes', category: 'Gamme HomeCare', price: 25.00, stockStatus: 'IN_STOCK', description: 'Patchs yeux micro-aiguilles.' },
    { sku: 'KRX-PML', name: 'Patch Microneedling Lèvres', category: 'Gamme HomeCare', price: 25.00, stockStatus: 'IN_STOCK', description: 'Patchs lèvres micro-aiguilles.' },
    // --- EXFOLIANT ---
    { sku: 'KRX-CFPW', name: 'Cocoa Facial Powder Wash - 100 g', category: 'Exfoliant', price: 42.00, stockStatus: 'LOW_STOCK', description: 'Poudre nettoyante enzymatique cacao.' },
    { sku: 'KRX-SPES', name: 'Skin Prep Exfoliant Solution - 150 ml', category: 'Exfoliant', price: 38.00, stockStatus: 'IN_STOCK', description: 'Solution exfoliante préparatoire.' },
    // --- ACCESSOIRE ---
    { sku: 'KRX-ACC-SIL', name: 'Pinceau Silicone KRX', category: 'Accessoire', price: 15.00, stockStatus: 'OUT_OF_STOCK', description: 'Pinceau application silicone.' },
    { sku: 'KRX-ACC-FAN', name: 'Pinceau Eventail KRX', category: 'Accessoire', price: 18.00, stockStatus: 'OUT_OF_STOCK', description: 'Pinceau éventail poils doux.' },
    { sku: 'KRX-ACC-HB', name: 'Bandeau KRX', category: 'Accessoire', price: 12.00, stockStatus: 'OUT_OF_STOCK', description: 'Bandeau soin visage.' },
];

async function syncCatalog() {
    console.log('--- STARTING CATALOG SYNC ---');

    // 1. Sync Categories
    console.log('Syncing categories...');
    const allUniqueCategories = [...new Set(RAW_PRODUCTS.map(p => p.category))];
    const categoriesToInsert = allUniqueCategories.map((name, index) => ({
        name,
        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        order_index: index + 1
    }));

    const { data: catData, error: catError } = await supabase
        .from('categories')
        .upsert(categoriesToInsert, { onConflict: 'name' })
        .select();

    if (catError) {
        console.error('Error syncing categories:', catError);
        return;
    }
    console.log(`Successfully synced ${catData?.length} categories.`);

    // Map names to IDs for product linking
    const categoryMap = catData.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
    }, {});

    // 2. Sync Products
    console.log('Syncing products...');
    const productsToInsert = RAW_PRODUCTS.map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        category_id: categoryMap[p.category] || null,
        price: p.price,
        cost_price: p.costPrice || (p.price * 0.45),
        retail_price: p.retailPrice || (p.price * 1.8),
        stock_status: p.stockStatus,
        description: p.description,
        status: 'ACTIVE'
    }));

    // Chunking to avoid large request limits
    const chunkSize = 50;
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
        const chunk = productsToInsert.slice(i, i + chunkSize);
        const { error: prodError } = await supabase
            .from('products')
            .upsert(chunk, { onConflict: 'sku' });

        if (prodError) {
            console.error(`Error syncing product chunk ${i}:`, prodError);
        } else {
            console.log(`Synced products ${i} to ${Math.min(i + chunkSize, productsToInsert.length)}`);
        }
    }

    console.log('--- CATALOG SYNC COMPLETE ---');
}

syncCatalog();
