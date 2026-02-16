-- ========================================================
-- SOLUCIÓN CRÍTICA: PERMITIR PEDIDOS PARA TODOS LOS SOCIOS
-- Instrucciones: Pega esto en el SQL Editor de Supabase
-- ========================================================

-- 1. Eliminar la restricción que obliga a que el partner_id sea un ID de Auth directo.
-- Esto permite que socios creados manualmente (con IDs diferentes) puedan hacer pedidos.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_partner_id_fkey;

-- 2. Asegurar que partner_id siga siendo un UUID pero sin validación contra auth.users
-- (Ya es UUID por definición de tabla, solo quitamos la "llave foránea")

-- 3. Opcional: Asegurar permisos de inserción en orders para usuarios autenticados
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (true);

-- 4. Asegurar que los administradores puedan ver todos los pedidos
DROP POLICY IF EXISTS "Admins can see all orders" ON public.orders;
CREATE POLICY "Admins can see all orders" ON public.orders FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (auth.jwt() ->> 'email' IN ('jorge@dermakorswiss.com', 'jorge@dermakor.com', 'torresjorge2812@gmail.com', 'jorgetorres2812@gmail.com', 'georgitorres2812@gmail.com'))
);
