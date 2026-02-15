-- ==========================================
-- MASTER PRODUCT IMPORT V3 - REAL DATA
-- ==========================================

DO $$ 
DECLARE 
    cat_id UUID;
BEGIN
    -- Limpiar productos previos si se desea un fresh start de datos reales
    -- TRUNCATE TABLE products;

    -- 1. SOIN PEELING
    SELECT id INTO cat_id FROM categories WHERE name = 'Soin Peeling';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-SP-001', 'BioCell+ BC1 "AHA & BHA" - 300 ml', 'Soin Peeling', cat_id, 95.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-002', 'BioCell+ BC2 "Toning" - 300 ml', 'Soin Peeling', cat_id, 95.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-003', 'BioCell+ BC3 "Hydrating" - 300 ml', 'Soin Peeling', cat_id, 95.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-004', 'Solution Neutralizer', 'Soin Peeling', cat_id, 45.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-005', 'Peel Solution A', 'Soin Peeling', cat_id, 80.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-006', 'Peel Solution B', 'Soin Peeling', cat_id, 80.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-007', 'Peel Solution C', 'Soin Peeling', cat_id, 80.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-SP-008', 'Neutralizing Solution', 'Soin Peeling', cat_id, 40.00, 7, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 2. SOLUTION HYDRAFACIAL
    SELECT id INTO cat_id FROM categories WHERE name = 'Solution HydraFacial';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-SH-001', 'Solutions BioCell+ "BC1/BC2/BC3" - Pack 3 x 30 ml', 'Solution HydraFacial', cat_id, 150.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-SH-002', 'Hydrafacial Serum A', 'Solution HydraFacial', cat_id, 60.00, 10, 'IN_STOCK', 'ACTIVE'),
    ('DK-SH-003', 'Hydrafacial Serum B', 'Solution HydraFacial', cat_id, 60.00, 12, 'IN_STOCK', 'ACTIVE'),
    ('DK-SH-004', 'Hydrafacial Serum C', 'Solution HydraFacial', cat_id, 60.00, 9, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 3. TONIQUE
    SELECT id INTO cat_id FROM categories WHERE name = 'Tonique';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-TQ-001', 'Pre Peel Toner', 'Tonique', cat_id, 45.00, 10, 'IN_STOCK', 'ACTIVE'),
    ('DK-TQ-002', 'Calming Toner', 'Tonique', cat_id, 40.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-TQ-003', 'Purifying Toner', 'Tonique', cat_id, 40.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-TQ-004', 'Brightening Toner', 'Tonique', cat_id, 40.00, 7, 'IN_STOCK', 'ACTIVE'),
    ('DK-TQ-005', 'Toner Pads', 'Tonique', cat_id, 35.00, 12, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 4. MASQUE CONCENTRÉ
    SELECT id INTO cat_id FROM categories WHERE name = 'Masque Concentré';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-MC-001', 'Glass Mask (Édition Limitée)', 'Masque Concentré', cat_id, 65.00, 0, 'OUT_OF_STOCK', 'ACTIVE'),
    ('DK-MC-002', 'Exosome Mask', 'Masque Concentré', cat_id, 85.00, 10, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-003', 'Hydrogel Eye Patch', 'Masque Concentré', cat_id, 45.00, 9, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-004', 'Soothing Gel Mask', 'Masque Concentré', cat_id, 55.00, 7, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-005', 'Charcoal Mask', 'Masque Concentré', cat_id, 50.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-006', 'Clay Mask', 'Masque Concentré', cat_id, 50.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-007', 'Sheet Mask Aloe', 'Masque Concentré', cat_id, 8.00, 15, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-008', 'Sheet Mask Collagen', 'Masque Concentré', cat_id, 8.00, 17, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-009', 'Sheet Mask Hyaluronic', 'Masque Concentré', cat_id, 8.00, 18, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-010', 'Sheet Mask Vitamin C', 'Masque Concentré', cat_id, 8.00, 16, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-011', 'Sheet Mask Green Tea', 'Masque Concentré', cat_id, 8.00, 11, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-012', 'Sheet Mask Snail', 'Masque Concentré', cat_id, 8.00, 13, 'IN_STOCK', 'ACTIVE'),
    ('DK-MC-013', 'Recovery Mask', 'Masque Concentré', cat_id, 60.00, 4, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 5. GAMME HOMECARE
    SELECT id INTO cat_id FROM categories WHERE name = 'Gamme HomeCare';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-HC-001', 'PDRN Repair Cream', 'Gamme HomeCare', cat_id, 42.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-002', 'Retinol Night Cream', 'Gamme HomeCare', cat_id, 55.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-003', 'SPF 50+ Sunblock', 'Gamme HomeCare', cat_id, 35.00, 13, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-004', 'Aqua Cream', 'Gamme HomeCare', cat_id, 45.00, 9, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-005', 'Barrier Repair Cream', 'Gamme HomeCare', cat_id, 48.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-006', 'After Peel Cream', 'Gamme HomeCare', cat_id, 40.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-007', 'Firming Cream', 'Gamme HomeCare', cat_id, 52.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-008', 'Elasticity Cream', 'Gamme HomeCare', cat_id, 52.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-009', 'Day Protection Cream', 'Gamme HomeCare', cat_id, 45.00, 7, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-010', 'BB Cream', 'Gamme HomeCare', cat_id, 38.00, 9, 'IN_STOCK', 'ACTIVE'),
    ('DK-HC-011', 'CC Cream', 'Gamme HomeCare', cat_id, 38.00, 6, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 6. EXFOLIANT
    SELECT id INTO cat_id FROM categories WHERE name = 'Exfoliant';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-EX-001', 'Enzyme Powder Cleanser', 'Exfoliant', cat_id, 38.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-EX-002', 'Exfoliating Pads', 'Exfoliant', cat_id, 42.00, 9, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 7. MESO BOOSTER AMPOULE
    SELECT id INTO cat_id FROM categories WHERE name = 'Meso Booster Ampoule';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-MA-001', 'Vitamin C Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 12, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-002', 'Collagen Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-003', 'Peptide Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-004', 'Stem Cell Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-005', 'Gold Ampoule', 'Meso Booster Ampoule', cat_id, 130.00, 2, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-006', 'Caviar Ampoule', 'Meso Booster Ampoule', cat_id, 130.00, 1, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-007', 'Placenta Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-008', 'Exosome Ampoule', 'Meso Booster Ampoule', cat_id, 150.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-009', 'Soothing Ampoule', 'Meso Booster Ampoule', cat_id, 90.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-010', 'Hydration Ampoule', 'Meso Booster Ampoule', cat_id, 90.00, 10, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-011', 'Lifting Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-012', 'Night Repair Ampoule', 'Meso Booster Ampoule', cat_id, 110.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-MA-013', 'Hair Ampoule', 'Meso Booster Ampoule', cat_id, 95.00, 4, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 8. SÉRUM
    SELECT id INTO cat_id FROM categories WHERE name = 'Sérum';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-SR-001', 'Hyaluronic Booster', 'Sérum', cat_id, 65.00, 11, 'IN_STOCK', 'ACTIVE'),
    ('DK-SR-002', 'Niacinamide Serum', 'Sérum', cat_id, 60.00, 14, 'IN_STOCK', 'ACTIVE'),
    ('DK-SR-003', 'Anti-Redness Serum', 'Sérum', cat_id, 65.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-SR-004', 'Acne Control Serum', 'Sérum', cat_id, 65.00, 9, 'IN_STOCK', 'ACTIVE'),
    ('DK-SR-005', 'Pore Tightening Serum', 'Sérum', cat_id, 65.00, 7, 'IN_STOCK', 'ACTIVE'),
    ('DK-SR-006', 'Whitening Serum', 'Sérum', cat_id, 70.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-SR-007', 'Hair Serum', 'Sérum', cat_id, 55.00, 5, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 9. DÉMAQUILLANT - NETTOYANT
    SELECT id INTO cat_id FROM categories WHERE name = 'Démaquillant - Nettoyant';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-DN-001', 'Foam Cleanser', 'Démaquillant - Nettoyant', cat_id, 30.00, 10, 'IN_STOCK', 'ACTIVE'),
    ('DK-DN-002', 'Oil Cleanser', 'Démaquillant - Nettoyant', cat_id, 32.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-DN-003', 'Micellar Water', 'Démaquillant - Nettoyant', cat_id, 25.00, 12, 'IN_STOCK', 'ACTIVE'),
    ('DK-DN-004', 'Makeup Remover', 'Démaquillant - Nettoyant', cat_id, 28.00, 5, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 10. TRAITEMENT SPÉCIALISÉ
    SELECT id INTO cat_id FROM categories WHERE name = 'Traitement Spécialisé';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-TS-001', 'Lip Sleeping Mask', 'Traitement Spécialisé', cat_id, 20.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-002', 'Scalp Tonic', 'Traitement Spécialisé', cat_id, 45.00, 3, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-003', 'Facial Mist', 'Traitement Spécialisé', cat_id, 25.00, 10, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-004', 'Pimple Patches', 'Traitement Spécialisé', cat_id, 15.00, 20, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-005', 'Blackhead Strips', 'Traitement Spécialisé', cat_id, 12.00, 18, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-006', 'Nose Patches', 'Traitement Spécialisé', cat_id, 12.00, 15, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-007', 'Chin Patches', 'Traitement Spécialisé', cat_id, 10.00, 14, 'IN_STOCK', 'ACTIVE'),
    ('DK-TS-008', 'Forehead Patches', 'Traitement Spécialisé', cat_id, 10.00, 13, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 11. ACCESSOIRE
    SELECT id INTO cat_id FROM categories WHERE name = 'Accessoire';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-AC-001', 'Dermapen Cartridges', 'Accessoire', cat_id, 5.00, 20, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-002', 'Hydrafacial Tips', 'Accessoire', cat_id, 4.00, 25, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-003', 'Hydrafacial Tubes', 'Accessoire', cat_id, 15.00, 18, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-004', 'Hydrafacial Filters', 'Accessoire', cat_id, 8.00, 15, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-005', 'LED Mask', 'Accessoire', cat_id, 350.00, 2, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-006', 'Ultrasound Gel', 'Accessoire', cat_id, 25.00, 14, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-007', 'Disposable Headbands', 'Accessoire', cat_id, 0.50, 30, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-008', 'Disposable Sheets', 'Accessoire', cat_id, 1.20, 40, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-009', 'Disposable Towels', 'Accessoire', cat_id, 0.80, 50, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-010', 'Gloves Small', 'Accessoire', cat_id, 12.00, 60, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-011', 'Gloves Medium', 'Accessoire', cat_id, 12.00, 80, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-012', 'Gloves Large', 'Accessoire', cat_id, 12.00, 70, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-013', 'Face Sponges', 'Accessoire', cat_id, 1.50, 25, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-014', 'Cotton Pads', 'Accessoire', cat_id, 3.00, 100, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-015', 'Cotton Swabs', 'Accessoire', cat_id, 2.00, 120, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-016', 'Alcohol Pads', 'Accessoire', cat_id, 5.00, 90, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-017', 'Sterile Gauze', 'Accessoire', cat_id, 8.00, 85, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-018', 'Syringes 1ml', 'Accessoire', cat_id, 1.50, 40, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-019', 'Syringes 3ml', 'Accessoire', cat_id, 2.00, 35, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-020', 'Needles 30G', 'Accessoire', cat_id, 0.80, 60, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-021', 'Needles 32G', 'Accessoire', cat_id, 1.00, 55, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-022', 'Sharps Container', 'Accessoire', cat_id, 15.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-023', 'Cooling Gel', 'Accessoire', cat_id, 20.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-024', 'Numbing Cream', 'Accessoire', cat_id, 45.00, 7, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-025', 'Post-Procedure Cream', 'Accessoire', cat_id, 35.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-AC-026', 'Foundation Cushion', 'Accessoire', cat_id, 45.00, 8, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

    -- 12. CRÈME (Añadiendo el resto del cuerpo y cabello aquí o crear categoría Hair si existiera)
    SELECT id INTO cat_id FROM categories WHERE name = 'Crème';
    INSERT INTO products (sku, name, category, category_id, price, stock_quantity, stock_status, status) VALUES
    ('DK-CR-001', 'Hand Cream', 'Crème', cat_id, 15.00, 9, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-002', 'Foot Cream', 'Crème', cat_id, 18.00, 4, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-003', 'Body Lotion', 'Crème', cat_id, 35.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-004', 'Body Scrub', 'Crème', cat_id, 30.00, 5, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-005', 'Body Oil', 'Crème', cat_id, 40.00, 7, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-006', 'Hair Mask', 'Crème', cat_id, 35.00, 6, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-007', 'Hair Shampoo', 'Crème', cat_id, 25.00, 8, 'IN_STOCK', 'ACTIVE'),
    ('DK-CR-008', 'Hair Conditioner', 'Crème', cat_id, 25.00, 7, 'IN_STOCK', 'ACTIVE')
    ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

END $$;
