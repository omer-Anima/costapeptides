-- =========================================================================
--                     PEPTIDES COSTA RICA - DATABASE SCHEMA
-- =========================================================================
-- 
-- Run this SQL script in your Supabase Project SQL Editor to prepare your tables
-- and set up Row Level Security (RLS) policies.

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product TEXT NOT NULL,
    category TEXT NOT NULL,
    price_usd TEXT NOT NULL,
    price_crc TEXT,
    discount TEXT,
    status TEXT NOT NULL DEFAULT 'In Stock',
    coa TEXT,
    image_url TEXT,
    emoji TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone (public) can view products in the catalog
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
USING (true);

-- Authenticated policies: Only logged-in admin users can modify products
CREATE POLICY "Allow authenticated insert to products" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to products" 
ON public.products FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to products" 
ON public.products FOR DELETE 
TO authenticated 
USING (true);


-- 2. ORDERS LOG LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL, -- Format: [{ "product": "Retatrutide 10mg", "qty": 1, "price": 125 }]
    total_usd NUMERIC,
    total_crc NUMERIC,
    currency TEXT NOT NULL DEFAULT 'CRC',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Insert policy: Anyone can place a new order from the checkout screen
CREATE POLICY "Allow public insert access to orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Authenticated policies: Only logged-in admins can view or update customer orders
CREATE POLICY "Allow authenticated read access to orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated update access to orders" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access to orders" 
ON public.orders FOR DELETE 
TO authenticated 
USING (true);


-- 3. INITIALIZE ADMIN USER IN SUPABASE AUTH (Optional / Reference)
-- In Supabase, users are created via the Auth UI or Auth APIs.
-- To register the admin user directly via SQL in your Supabase Auth engine:
--
-- INSERT INTO auth.users (
--     instance_id, id, aud, role, email, encrypted_password, 
--     email_confirmed_at, recovery_sent_at, last_sign_in_at, 
--     raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
--     confirmation_token, email_change, email_change_token_new, email_change_confirm_status
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     gen_random_uuid(),
--     'authenticated',
--     'authenticated',
--     'admin@costapeptides.com',
--     crypt('CostaPeptides2026!', gen_salt('bf')),
--     now(),
--     NULL,
--     NULL,
--     '{"provider": "email", "providers": ["email"]}',
--     '{}',
--     now(),
--     now(),
--     '',
--     '',
--     '',
--     0
-- ) ON CONFLICT (email) DO NOTHING;
