-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL, -- 'ORDER', 'STOCK', 'PARTNER', 'PAYMENT'
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can update notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Trigger for stock notifications (example logic)
-- This would be handled by edge functions or backend logic normally, 
-- but we can insert them manually for now from the frontend or db triggers.
