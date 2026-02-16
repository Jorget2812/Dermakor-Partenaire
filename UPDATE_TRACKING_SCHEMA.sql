-- 1. Añadir columnas de seguimiento
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT;

-- 2. Actualizar la restricción de estados para incluir PENDING
-- Primero eliminamos la antigua si existe
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Creamos la nueva con los estados que Jorge necesita
-- PREPARATION -> En cours
-- PENDING    -> En attente
-- SHIPPED    -> Expédiée
-- DELIVERED  -> Livrée
-- CANCELLED  -> Annulée
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('PREPARATION', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'));

-- 3. Asegurar que los pedidos nuevos o existentes tengan un estado válido si es necesario
-- (Opcional, pero por seguridad)
UPDATE public.orders SET status = 'PENDING' WHERE status IS NULL;
