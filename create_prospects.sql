-- TABLA DE PROSPECTOS (LEADS)
-- Esta tabla recibe datos del formulario externo (Typeform)
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT UNIQUE NOT NULL,
    city TEXT,
    source TEXT DEFAULT 'WEB',
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR SEGURIDAD (RLS)
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO
CREATE POLICY "Admin CRUD prospects" ON public.prospects FOR ALL TO authenticated USING (true);

-- REGISTRO DE PRUEBA
INSERT INTO public.prospects (company_name, contact_name, email, city, notes) 
VALUES ('Institut de Beauté Test', 'Marie Lead', 'marie@lead.ch', 'Genève', 'Intéressée par le plan Premium via Landing Page.')
ON CONFLICT (email) DO NOTHING;
