-- ==========================================
-- AuditAI Database Schema (Supabase)
-- ==========================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (tied to Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Audits Table
CREATE TABLE public.audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT,
    screenshot_url TEXT,
    overall_score INTEGER,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audits
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- 3. Audit Scores Table (1-to-1 breakdown)
CREATE TABLE public.audit_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE UNIQUE NOT NULL,
    ux_score INTEGER DEFAULT 0 NOT NULL,
    accessibility_score INTEGER DEFAULT 0 NOT NULL,
    design_score INTEGER DEFAULT 0 NOT NULL,
    conversion_score INTEGER DEFAULT 0 NOT NULL,
    typography_score INTEGER DEFAULT 0 NOT NULL,
    mobile_score INTEGER DEFAULT 0 NOT NULL,
    trust_score INTEGER DEFAULT 0 NOT NULL
);

-- Enable RLS on scores
ALTER TABLE public.audit_scores ENABLE ROW LEVEL SECURITY;

-- 4. Audit Issues Table (Annotations)
CREATE TABLE public.audit_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ux', 'ui', 'accessibility', 'conversion', 'visual_hierarchy', 'typography', 'cta')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    x_percent NUMERIC(5, 2) NOT NULL, -- X position on image (0-100)
    y_percent NUMERIC(5, 2) NOT NULL, -- Y position on image (0-100)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on issues
ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;

-- 5. Audit Recommendations Table (Broader suggestions)
CREATE TABLE public.audit_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
    effort TEXT NOT NULL CHECK (effort IN ('high', 'medium', 'low')),
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on recommendations
ALTER TABLE public.audit_recommendations ENABLE ROW LEVEL SECURITY;

-- 6. Audit History Table
CREATE TABLE public.audit_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit history
ALTER TABLE public.audit_history ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- audits policies
CREATE POLICY "Users can view their own audits" ON public.audits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audits" ON public.audits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audits" ON public.audits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audits" ON public.audits
    FOR DELETE USING (auth.uid() = user_id);

-- audit_scores policies
CREATE POLICY "Users can view scores of their own audits" ON public.audit_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.audits
            WHERE public.audits.id = public.audit_scores.audit_id
            AND public.audits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert scores for their own audits" ON public.audit_scores
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.audits
            WHERE public.audits.id = audit_id
            AND public.audits.user_id = auth.uid()
        )
    );

-- audit_issues policies
CREATE POLICY "Users can view issues of their own audits" ON public.audit_issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.audits
            WHERE public.audits.id = public.audit_issues.audit_id
            AND public.audits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert issues for their own audits" ON public.audit_issues
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.audits
            WHERE public.audits.id = audit_id
            AND public.audits.user_id = auth.uid()
        )
    );

-- audit_recommendations policies
CREATE POLICY "Users can view recommendations of their own audits" ON public.audit_recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.audits
            WHERE public.audits.id = public.audit_recommendations.audit_id
            AND public.audits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recommendations for their own audits" ON public.audit_recommendations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.audits
            WHERE public.audits.id = audit_id
            AND public.audits.user_id = auth.uid()
        )
    );

-- audit_history policies
CREATE POLICY "Users can view their own audit history" ON public.audit_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record audit history" ON public.audit_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON public.audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_scores_audit_id ON public.audit_scores(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_issues_audit_id ON public.audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_recommendations_audit_id ON public.audit_recommendations(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_history_user_id ON public.audit_history(user_id);

-- ==========================================
-- AUTHENTICATION TRIGGERS (Auto-Profile Sync)
-- ==========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
