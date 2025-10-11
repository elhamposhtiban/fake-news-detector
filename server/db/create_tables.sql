-- Core analyses table (matches frontend requirements)
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_content TEXT NOT NULL,
    url VARCHAR(500),
    is_fake BOOLEAN NOT NULL,
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    explanation TEXT NOT NULL,
    suspicious_phrases TEXT[], -- Array of strings
    recommendations TEXT NOT NULL,
    model_used VARCHAR(100), -- e.g., 'gpt-4o-mini', 'bert-base'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget tracking table (OpenAI cost management)
CREATE TABLE IF NOT EXISTS budget_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year VARCHAR(7) NOT NULL, -- '2025-01'
    total_used DECIMAL(10,4) NOT NULL DEFAULT 0,
    total_remaining DECIMAL(10,4) NOT NULL,
    percentage_used DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Statistics table (analytics & metrics)
CREATE TABLE IF NOT EXISTS statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_analyses INTEGER NOT NULL DEFAULT 0,
    fake_news_count INTEGER NOT NULL DEFAULT 0,
    legitimate_news_count INTEGER NOT NULL DEFAULT 0,
    average_confidence DECIMAL(5,4) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_is_fake ON analyses(is_fake);
CREATE INDEX IF NOT EXISTS idx_analyses_model_used ON analyses(model_used);
CREATE INDEX IF NOT EXISTS idx_budget_tracking_month_year ON budget_tracking(month_year);

-- Function to get analysis statistics
CREATE OR REPLACE FUNCTION get_analysis_stats()
RETURNS TABLE (
    total_analyses BIGINT,
    fake_count BIGINT,
    real_count BIGINT,
    avg_confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_analyses,
        COUNT(CASE WHEN is_fake = true THEN 1 END) as fake_count,
        COUNT(CASE WHEN is_fake = false THEN 1 END) as real_count,
        AVG(confidence) as avg_confidence
    FROM analyses;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize statistics table with current data
CREATE OR REPLACE FUNCTION initialize_statistics()
RETURNS VOID AS $$
DECLARE
    stats RECORD;
BEGIN
    -- Get current stats from analyses table
    SELECT 
        COUNT(*)::INTEGER as total_analyses,
        COUNT(CASE WHEN is_fake = true THEN 1 END)::INTEGER as fake_news_count,
        COUNT(CASE WHEN is_fake = false THEN 1 END)::INTEGER as legitimate_news_count,
        COALESCE(AVG(confidence), 0) as average_confidence
    INTO stats
    FROM analyses;
    
    -- Insert or update statistics
    INSERT INTO statistics (total_analyses, fake_news_count, legitimate_news_count, average_confidence)
    VALUES (stats.total_analyses, stats.fake_news_count, stats.legitimate_news_count, stats.average_confidence)
    ON CONFLICT (id) DO UPDATE SET
        total_analyses = stats.total_analyses,
        fake_news_count = stats.fake_news_count,
        legitimate_news_count = stats.legitimate_news_count,
        average_confidence = stats.average_confidence,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
