-- ==========================================
-- FIX ORDERS SCHEMA - DERMAKOR SWISS
-- ==========================================

-- 1. Añadir columna metadata si no existe
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Asegurar que los ítems sean JSONB (ya lo son, pero por seguridad)
-- ALTER TABLE public.orders ALTER COLUMN items SET DATA TYPE JSONB USING items::JSONB;

-- 3. Actualizar políticas de RLS para permitir inserción de metadatos (ya deberían permitirlo al ser SELECT *)
-- No es necesario cambiar políticas si usan FOR ALL o FOR INSERT sobre la tabla completa.

-- 4. Verificar integridad de partner_users
-- Si un usuario existe en auth.users pero no en partner_users, el admin no verá su nombre.
-- Sugerencia: Asegurar que el registro de socios cree una entrada en partner_users.
