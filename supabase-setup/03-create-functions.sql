-- Function to update article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles 
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending articles
CREATE OR REPLACE FUNCTION get_trending_articles(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  source_name TEXT,
  political_lean TEXT,
  party_affinity TEXT,
  view_count INTEGER,
  published_date TIMESTAMP WITH TIME ZONE,
  bias_score JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.excerpt,
    a.source_name,
    a.political_lean,
    a.party_affinity,
    a.view_count,
    a.published_date,
    a.bias_score
  FROM public.articles a
  WHERE a.status = 'active'
    AND a.published_date > NOW() - INTERVAL '24 hours'
  ORDER BY 
    (a.view_count * 0.3 + a.analysis_count * 0.7) DESC,
    a.published_date DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search articles
CREATE OR REPLACE FUNCTION search_articles(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  bias_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  source_name TEXT,
  political_lean TEXT,
  category TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.excerpt,
    a.source_name,
    a.political_lean,
    a.category,
    a.published_date,
    ts_rank(to_tsvector('english', a.title || ' ' || COALESCE(a.content, '')), plainto_tsquery('english', search_query)) as rank
  FROM public.articles a
  WHERE a.status = 'active'
    AND (to_tsvector('english', a.title || ' ' || COALESCE(a.content, '')) @@ plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR a.category = category_filter)
    AND (bias_filter IS NULL OR a.political_lean = bias_filter)
  ORDER BY rank DESC, a.published_date DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
