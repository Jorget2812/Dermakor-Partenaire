-- ASEGURAR VISIBILIDAD DE DATOS (RLS)
-- Cambiamos 'TO authenticated' por 'TO public' para permitir lectura con la anon key

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read partners" ON public.partner_users;
CREATE POLICY "Public read partners" ON public.partner_users FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Academy read" ON public.academy_resources;
CREATE POLICY "Academy read" ON public.academy_resources FOR SELECT TO public USING (true);
