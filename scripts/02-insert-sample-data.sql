-- Insert sample news sources
INSERT INTO public.news_sources (name, domain, bias_lean, reliability_score, rss_feed_url) VALUES
('Times of India', 'timesofindia.indiatimes.com', 'center', 85, 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'),
('The Hindu', 'thehindu.com', 'left', 90, 'https://www.thehindu.com/news/national/feeder/default.rss'),
('Hindustan Times', 'hindustantimes.com', 'center', 80, 'https://www.hindustantimes.com/feeds/rss/india-news/index.xml'),
('NDTV', 'ndtv.com', 'left', 75, 'https://feeds.feedburner.com/NDTV-LatestNews'),
('Indian Express', 'indianexpress.com', 'center', 85, 'https://indianexpress.com/section/india/feed/'),
('Zee News', 'zeenews.india.com', 'right', 65, 'https://zeenews.india.com/rss/india-national-news.xml'),
('Republic World', 'republicworld.com', 'right', 60, NULL),
('News18', 'news18.com', 'center', 70, NULL),
('Business Standard', 'business-standard.com', 'center', 80, 'https://www.business-standard.com/rss/home_page_top_stories.rss'),
('Deccan Herald', 'deccanherald.com', 'center', 75, NULL);

-- Insert sample articles (these would normally come from scraping)
INSERT INTO public.articles (
  title, content, excerpt, author, source_id, source_name, original_url, 
  published_date, bias_score, sentiment_analysis, political_lean, 
  party_affinity, category, view_count, is_trending
) VALUES
(
  'Government Announces New Digital Infrastructure Initiative',
  'The central government unveiled a comprehensive digital infrastructure plan aimed at connecting rural areas with high-speed internet. The initiative, worth ₹50,000 crores, will focus on expanding fiber optic networks and 5G connectivity across tier-2 and tier-3 cities.',
  'The central government unveiled a comprehensive digital infrastructure plan aimed at connecting rural areas with high-speed internet...',
  'Rajesh Kumar',
  (SELECT id FROM public.news_sources WHERE name = 'Times of India'),
  'Times of India',
  'https://timesofindia.indiatimes.com/india/government-announces-new-digital-infrastructure-initiative/articleshow/sample1.cms',
  NOW() - INTERVAL '2 hours',
  '{"overall": 45, "emotional": 25, "factual": 85, "balanced": 70}',
  '{"positive": 65, "neutral": 30, "negative": 5}',
  'center',
  'neutral',
  'politics',
  15200,
  true
),
(
  'Opposition Questions Environmental Clearances for Mining Projects',
  'Environmental activists and opposition leaders have raised serious concerns about the rapid approval of mining projects in ecologically sensitive areas. The debate centers around balancing economic development with environmental protection.',
  'Environmental activists and opposition leaders have raised serious concerns about the rapid approval of mining projects...',
  'Priya Sharma',
  (SELECT id FROM public.news_sources WHERE name = 'The Hindu'),
  'The Hindu',
  'https://thehindu.com/news/national/opposition-questions-environmental-clearances-mining/article-sample2.ece',
  NOW() - INTERVAL '4 hours',
  '{"overall": 35, "emotional": 40, "factual": 75, "balanced": 60}',
  '{"positive": 20, "neutral": 45, "negative": 35}',
  'left',
  'congress',
  'politics',
  9800,
  false
),
(
  'India''s GDP Growth Surpasses Global Expectations',
  'Latest economic indicators show India''s GDP growth has exceeded international forecasts, reinforcing the government''s economic policies. The growth is attributed to strong domestic demand and improved manufacturing output.',
  'Latest economic indicators show India''s GDP growth has exceeded international forecasts, reinforcing the government''s economic policies...',
  'Amit Verma',
  (SELECT id FROM public.news_sources WHERE name = 'Zee News'),
  'Zee News',
  'https://zeenews.india.com/economy/india-gdp-growth-surpasses-expectations/sample3.html',
  NOW() - INTERVAL '6 hours',
  '{"overall": 65, "emotional": 35, "factual": 80, "balanced": 55}',
  '{"positive": 70, "neutral": 25, "negative": 5}',
  'right',
  'bjp',
  'business',
  18700,
  true
);
