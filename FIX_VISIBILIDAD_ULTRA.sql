-- ========================================================
-- SOLUCIÓN DEFINITIVA: REPARACIÓN DE DATOS Y VISIBILIDAD
-- ========================================================

-- 1. Asegurar que los Admins tengan su perfil correcto
DO $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    SELECT id, email, 'admin', 'Jorge Torres (Admin)'
    FROM auth.users
    WHERE email IN ('jorge@dermakorswiss.com', 'torresjorge2812@gmail.com', 'jorgetorres2812@gmail.com', 'georgitorres2812@gmail.com', 'admin@dermakorswiss.com')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

-- 2. LIMPIEZA DE "HUÉRFANOS" (PEDIDOS SIN SOCIO)
-- Esto evita el error de la llave foránea (FK).
-- Buscamos si el ID del pedido existe en partner_users. Si no, creamos un registro básico.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT DISTINCT partner_id FROM public.orders) LOOP
        IF NOT EXISTS (SELECT 1 FROM public.partner_users WHERE id = r.partner_id) THEN
            -- Intentamos obtener el email desde auth.users para que el nombre sea real
            INSERT INTO public.partner_users (id, company_name, email, status, tier)
            SELECT r.partner_id, 'Partner Manual (Sync)', email, 'ACTIVE', 'STANDARD'
            FROM auth.users WHERE id = r.partner_id
            ON CONFLICT (email) DO NOTHING;
            
            -- Si aún no existe (porque no está en auth.users o el email ya estaba), ponemos un placeholder
            IF NOT EXISTS (SELECT 1 FROM public.partner_users WHERE id = r.partner_id) THEN
                INSERT INTO public.partner_users (id, company_name, email, status, tier)
                VALUES (r.partner_id, 'Huésped / Admin', 'unknown_' || r.partner_id || '@dermakor.ch', 'ACTIVE', 'STANDARD')
                ON CONFLICT (id) DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END $$;

-- 3. Restaurar la relación entre PEDIDOS y SOCIOS (Ahora no fallará)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_partner_id_fkey;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_partner_id_fkey 
FOREIGN KEY (partner_id) 
REFERENCES public.partner_users(id) 
ON DELETE SET NULL;

-- 4. Blindar las políticas RLS para visibilidad total
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can see all orders" ON public.orders;
CREATE POLICY "Admins can see all orders" ON public.orders 
FOR SELECT TO authenticated 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (auth.jwt() ->> 'email' IN ('jorge@dermakorswiss.com', 'torresjorge2812@gmail.com', 'jorgetorres2812@gmail.com', 'georgitorres2812@gmail.com', 'admin@dermakorswiss.com'))
);

DROP POLICY IF EXISTS "Everyone can select orders" ON public.orders;
CREATE POLICY "Everyone can select orders" ON public.orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Public select partner_users" ON public.partner_users;
CREATE POLICY "Public select partner_users" ON public.partner_users FOR SELECT TO authenticated USING (true);
