-- ========================================================
-- FAMILY FINANCE HUB - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES CREATION

-- Family Members Table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Table (Columns: member_id, note)
CREATE TABLE IF NOT EXISTS public.income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    source TEXT NOT NULL,
    member_id UUID REFERENCES public.family_members(id),
    received_by TEXT DEFAULT 'Family Account',
    added_by TEXT DEFAULT 'Admin',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    attachment_url TEXT,
    attachment_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table (Columns: member_id, note)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    expense_name TEXT NOT NULL,
    member_id UUID REFERENCES public.family_members(id),
    paid_by TEXT DEFAULT 'Family Member',
    added_by TEXT DEFAULT 'Admin',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    attachment_url TEXT,
    attachment_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table (Column: body)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'receipt', 'system', 'monthly_report', 'budget', 'backup')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device Tokens Table (FCM & PWA Device Token Store)
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.family_members(id),
    device_token TEXT UNIQUE NOT NULL,
    platform TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name TEXT DEFAULT 'Family Finance',
    currency_symbol TEXT DEFAULT '₹',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MIGRATION BLOCK: Update column names to match EXACT schema (member_id, note)

DO $$
BEGIN
    -- Notifications Table Rename message -> body if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'message'
    ) THEN
        ALTER TABLE public.notifications RENAME COLUMN message TO body;
    END IF;

    -- Income Table Migration (member_name -> member_id, notes -> note)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'income' AND column_name = 'member_name'
    ) THEN
        ALTER TABLE public.income DROP COLUMN member_name;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'income' AND column_name = 'member_id'
    ) THEN
        ALTER TABLE public.income ADD COLUMN member_id UUID REFERENCES public.family_members(id);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'income' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.income RENAME COLUMN notes TO note;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'income' AND column_name = 'note'
    ) THEN
        ALTER TABLE public.income ADD COLUMN note TEXT;
    END IF;

    -- Expenses Table Migration (member_name -> member_id, notes -> note)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'member_name'
    ) THEN
        ALTER TABLE public.expenses DROP COLUMN member_name;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'member_id'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN member_id UUID REFERENCES public.family_members(id);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.expenses RENAME COLUMN notes TO note;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'note'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN note TEXT;
    END IF;

    -- Income & Expenses Table attachment columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'income' AND column_name = 'attachment_name'
    ) THEN
        ALTER TABLE public.income ADD COLUMN attachment_name TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'income' AND column_name = 'attachment_url'
    ) THEN
        ALTER TABLE public.income ADD COLUMN attachment_url TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'attachment_name'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN attachment_name TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'attachment_url'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN attachment_url TEXT;
    END IF;
END $$;

-- 4. SEED DEFAULT DATA IF TABLES ARE EMPTY

INSERT INTO public.family_members (name, gender, status) VALUES
  ('Bava', 'Male', 'Active'),
  ('Monutty', 'Male', 'Active'),
  ('Cherimoon', 'Male', 'Active'),
  ('Moolu', 'Female', 'Active'),
  ('Cherimool', 'Female', 'Active'),
  ('Mulla', 'Female', 'Active'),
  ('Sinu', 'Female', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO public.settings (family_name, currency_symbol) VALUES
  ('Family Finance', '₹')
ON CONFLICT DO NOTHING;

-- 5. AUTOMATIC NOTIFICATION TRIGGERS (JOINING family_members with member_id)

-- Trigger for New Income
CREATE OR REPLACE FUNCTION handle_income_notification()
RETURNS TRIGGER AS $$
DECLARE
    m_name TEXT;
BEGIN
    SELECT name INTO m_name FROM public.family_members WHERE id = NEW.member_id;
    IF m_name IS NULL THEN m_name := 'Family Member'; END IF;
    
    INSERT INTO public.notifications (title, body, type)
    VALUES (
        'Income Added',
        m_name || ' added ₹' || NEW.amount || ' (' || NEW.source || ')',
        'income'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_income_added
    AFTER INSERT ON public.income
    FOR EACH ROW EXECUTE FUNCTION handle_income_notification();

-- Trigger for New Expense & Receipt Upload
CREATE OR REPLACE FUNCTION handle_expense_notification()
RETURNS TRIGGER AS $$
DECLARE
    m_name TEXT;
BEGIN
    SELECT name INTO m_name FROM public.family_members WHERE id = NEW.member_id;
    IF m_name IS NULL THEN m_name := 'Family Member'; END IF;

    INSERT INTO public.notifications (title, body, type)
    VALUES (
        'Expense Added',
        m_name || ' spent ₹' || NEW.amount || ' (' || NEW.expense_name || ')',
        'expense'
    );
    
    IF NEW.attachment_url IS NOT NULL AND NEW.attachment_url <> '' THEN
        INSERT INTO public.notifications (title, body, type)
        VALUES (
            'Receipt Uploaded',
            'Receipt uploaded for ' || NEW.expense_name || ' expense',
            'receipt'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_expense_added
    AFTER INSERT ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION handle_expense_notification();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public All Family Members" ON public.family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Income" ON public.income FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Device Tokens" ON public.device_tokens FOR ALL USING (true) WITH CHECK (true);

-- Drop old notification policies if existing
DROP POLICY IF EXISTS "Public Read Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public All Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin All Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Select Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Insert Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Update Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Delete Notifications" ON public.notifications;

-- Create explicit Policies for Notifications Table
CREATE POLICY "Public Select Notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public Insert Notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Notifications" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Notifications" ON public.notifications FOR DELETE USING (true);

-- 7. STORAGE BUCKET setup ("receipts")
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Public Upload Receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Public Delete Receipts" ON storage.objects FOR DELETE USING (bucket_id = 'receipts');
