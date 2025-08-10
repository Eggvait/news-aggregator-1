-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News sources table
CREATE TABLE public.news_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  bias_lean TEXT DEFAULT 'center' CHECK (bias_lean IN ('left', 'center', 'right')),
  reliability_score INTEGER DEFAULT 70 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  country TEXT DEFAULT 'India',
  language TEXT DEFAULT 'English',
  category TEXT DEFAULT 'general',
  rss_feed_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  source_id UUID REFERENCES public.news_sources(id),
  source_name TEXT,
  original_url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Bias Analysis Results
  bias_score JSONB DEFAULT '{}',
  sentiment_analysis JSONB DEFAULT '{}',
  key_phrases JSONB DEFAULT '{}',
  bias_indicators JSONB DEFAULT '[]',
  credibility_metrics JSONB DEFAULT '{}',
  
  -- Classification
  political_lean TEXT DEFAULT 'center' CHECK (political_lean IN ('left', 'center', 'right')),
  party_affinity TEXT DEFAULT 'neutral' CHECK (party_affinity IN ('bjp', 'congress', 'aap', 'regional', 'neutral')),
  category TEXT DEFAULT 'general' CHECK (category IN ('politics', 'business', 'sports', 'opinion', 'general')),
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  analysis_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  
  -- Content metadata
  word_count INTEGER,
  read_time_minutes INTEGER,
  extraction_method TEXT DEFAULT 'full',
  content_quality_score INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged', 'deleted')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User submitted articles for analysis
CREATE TABLE public.user_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  article_id UUID REFERENCES public.articles(id),
  submitted_url TEXT NOT NULL,
  submission_type TEXT DEFAULT 'analysis' CHECK (submission_type IN ('analysis', 'report', 'suggestion')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article analysis history
CREATE TABLE public.analysis_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id),
  user_id UUID REFERENCES public.user_profiles(id),
  analysis_results JSONB NOT NULL,
  analysis_version TEXT DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_articles_published_date ON public.articles(published_date DESC);
CREATE INDEX idx_articles_source_name ON public.articles(source_name);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_political_lean ON public.articles(political_lean);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_trending ON public.articles(is_trending) WHERE is_trending = true;
CREATE INDEX idx_articles_url ON public.articles(original_url);
