CREATE TABLE IF NOT EXISTS news_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    is_fake BOOLEAN NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_news_analyses_created_at ON news_analyses(created_at);

CREATE INDEX IF NOT EXISTS idx_news_analyses_is_fake ON news_analyses(is_fake);

-- Let's also add a simple function to get basic stats
-- This will help us see how our detector is performing
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
        AVG(confidence_score) as avg_confidence
    FROM news_analyses;
END;
$$ LANGUAGE plpgsql;
