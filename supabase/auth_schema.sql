-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS but create wide-open policies for easy signup (since this is a demo/fast setup)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into companies (needed for signup)
CREATE POLICY "Allow anon insert to companies" ON public.companies FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Allow anyone to read companies
CREATE POLICY "Allow read companies" ON public.companies FOR SELECT USING (true);

-- Allow authenticated/anon to insert their profile
CREATE POLICY "Allow insert profile" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Allow users to read all profiles (or just their own)
CREATE POLICY "Allow read profiles" ON public.profiles FOR SELECT USING (true);
-- Allow users to update their own profile
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Enable Realtime if needed
ALTER PUBLICATION supabase_realtime ADD TABLE companies;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
