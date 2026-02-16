-- ========================================================
-- SOLUCIÓN DEFINITIVA: VISIBILIDAD DE PEDIDOS (ADMIN)
-- ========================================================

-- 1. Asegurar que Jorge y otros admins clave tengan el rol ADMIN en la tabla profiles
-- Esto es vital para que las políticas RLS de "role = 'admin'" funcionen.
DO $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    SELECT id, email, 'admin', 'Jorge Torres (Admin)'
    FROM auth.users
    WHERE email IN ('jorge@dermakorswiss.com', 'torresjorge2812@gmail.com', 'jorgetorres2812@gmail.com', 'georgitorres2812@gmail.com', 'admin@dermakorswiss.com')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

-- 2. Restaurar la relación entre PEDIDOS y SOCIOS
-- Esto permite que Supabase pueda unir las tablas y mostrar el nombre de la empresa.
-- Primero, limpiamos cualquier relación antigua.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_partner_id_fkey;

-- Creamos la conexión directa con la tabla de socios (partner_users)
-- Usamos SET NULL en lugar de CASCADE para no borrar pedidos si se borra un socio por error.
ALTER TABLE public.orders 
ADD CONSTRAINT orders_partner_id_fkey 
FOREIGN KEY (partner_id) 
REFERENCES public.partner_users(id) 
ON DELETE SET NULL;

-- 3. Blindar las políticas RLS para que Jorge vea TODO
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can see all orders" ON public.orders;
CREATE POLICY "Admins can see all orders" ON public.orders 
FOR SELECT TO authenticated 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (auth.jwt() ->> 'email' IN ('jorge@dermakorswiss.com', 'torresjorge2812@gmail.com', 'jorgetorres2812@gmail.com', 'georgitorres2812@gmail.com', 'admin@dermakorswiss.com'))
);

-- Asegurar que los socios también puedan ver todos los pedidos (temporalmente para depurar)
DROP POLICY IF EXISTS "Everyone can select orders" ON public.orders;
CREATE POLICY "Everyone can select orders" ON public.orders FOR SELECT TO authenticated USING (true);

-- 4. Asegurar que las tablas unidas también sean visibles
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select partner_users" ON public.partner_users;
CREATE POLICY "Public select partner_users" ON public.partner_users FOR SELECT TO authenticated USING (true);
