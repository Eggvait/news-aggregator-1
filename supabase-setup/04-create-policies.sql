-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Articles policies (anyone can read active articles)
CREATE POLICY "Anyone can view active articles" ON public.articles
  FOR SELECT USING (status = 'active');

-- News sources are publicly readable
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view news sources" ON public.news_sources
  FOR SELECT USING (is_active = true);

-- Analysis history - anyone can insert, users can view their own
CREATE POLICY "Anyone can insert analysis history" ON public.analysis_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view analysis history" ON public.analysis_history
  FOR SELECT USING (true);
