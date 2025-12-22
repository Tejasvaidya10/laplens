-- Migration: Create saved_analyses table
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- Table: saved_analyses
-- Stores user-saved telemetry analysis configurations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.saved_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    season INTEGER NOT NULL,
    event TEXT NOT NULL,
    session TEXT NOT NULL,
    driver_a TEXT NOT NULL,
    driver_b TEXT NOT NULL,
    lap_a INTEGER,
    lap_b INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Index for user lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_id 
    ON public.saved_analyses(user_id);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_saved_analyses_created_at 
    ON public.saved_analyses(created_at DESC);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own saved analyses
CREATE POLICY "Users can view own saved analyses"
    ON public.saved_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own saved analyses
CREATE POLICY "Users can create own saved analyses"
    ON public.saved_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own saved analyses
CREATE POLICY "Users can update own saved analyses"
    ON public.saved_analyses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own saved analyses
CREATE POLICY "Users can delete own saved analyses"
    ON public.saved_analyses
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- Trigger: Auto-update updated_at timestamp
-- =============================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_saved_analyses_updated_at ON public.saved_analyses;
CREATE TRIGGER update_saved_analyses_updated_at
    BEFORE UPDATE ON public.saved_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE public.saved_analyses IS 'User-saved telemetry analysis configurations';
COMMENT ON COLUMN public.saved_analyses.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN public.saved_analyses.name IS 'User-provided name for the analysis';
COMMENT ON COLUMN public.saved_analyses.season IS 'F1 season year';
COMMENT ON COLUMN public.saved_analyses.event IS 'Event/race name';
COMMENT ON COLUMN public.saved_analyses.session IS 'Session identifier (FP1, FP2, FP3, Q, R, etc)';
COMMENT ON COLUMN public.saved_analyses.driver_a IS 'First driver code (e.g., VER)';
COMMENT ON COLUMN public.saved_analyses.driver_b IS 'Second driver code (e.g., HAM)';
COMMENT ON COLUMN public.saved_analyses.lap_a IS 'Specific lap for driver A (null = fastest)';
COMMENT ON COLUMN public.saved_analyses.lap_b IS 'Specific lap for driver B (null = fastest)';
