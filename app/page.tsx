import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Eye, RefreshCw, Newspaper, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { DatabaseService } from "@/lib/database"

const getBiasColor = (bias: string) => {
  switch (bias) {
    case "left":
      return "bg-blue-50 text-blue-900 border-blue-300"
    case "right":
      return "bg-red-50 text-red-900 border-red-300"
    case "center":
      return "bg-green-50 text-green-900 border-green-300"
    default:
      return "bg-gray-50 text-gray-900 border-gray-300"
  }
}

const getPartyColor = (party: string) => {
  switch (party) {
    case "bjp":
      return "bg-orange-600"
    case "congress":
      return "bg-blue-600"
    case "aap":
      return "bg-purple-600"
    case "regional":
      return "bg-yellow-600"
    case "neutral":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

const getPartyLabel = (party: string) => {
  switch (party) {
    case "bjp":
      return "BJP"
    case "congress":
      return "INC"
    case "aap":
      return "AAP"
    case "regional":
      return "Regional"
    case "neutral":
      return "Neutral"
    default:
      return "N/A"
  }
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown"

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else {
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }
}

function formatViews(count: number): string {
  if (count > 10000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export default async function NewsAggregator() {
  // Get articles from database instead of mock data
  const dbArticles = await DatabaseService.getArticles({ limit: 12 })

  // Transform database articles to match expected format
  const articles = dbArticles.map((article) => ({
    id: article.id,
    title: article.title,
    source: article.source_name || "Unknown Source",
    bias: article.political_lean,
    party: article.party_affinity,
    excerpt: article.excerpt || "",
    timestamp: getRelativeTime(article.published_date),
    views: formatViews(article.view_count),
    trending: article.is_trending,
    url: article.original_url,
    publishedDate: article.published_date,
  }))

  const lastUpdated = new Date().toLocaleTimeString()
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Split articles for newspaper layout
  const featuredArticle = articles[0]
  const topStories = articles.slice(1, 4)
  const otherStories = articles.slice(4)

  return (
    <div className="min-h-screen vintage-paper">
      {/* Classic Newspaper Header */}
      <header className="bg-white newspaper-border border-b-8 shadow-lg">
        <div className="container mx-auto px-6 py-8">
          {/* Masthead */}
          <div className="text-center border-b-4 border-black pb-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-left font-newspaper-body">
                <p className="text-sm font-bold">EST. 2024</p>
                <p className="text-xs">ALL INDIA EDITION</p>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-7xl font-newspaper-masthead text-black mb-2 tracking-wider">The Bias Tribune</h1>
                <p className="text-xl italic text-gray-700 font-newspaper-body">"Unbiased Analysis of Biased News"</p>
              </div>
              <div className="text-right font-newspaper-body">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>{currentDate}</span>
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>NEW DELHI</span>
                </div>
              </div>
            </div>

            {/* Newspaper-style divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-black flex-1"></div>
              <Newspaper className="w-6 h-6" />
              <div className="h-px bg-black flex-1"></div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wide font-newspaper-body">
            <div className="flex gap-8">
              <Link href="/politics" className="hover:border-b-2 hover:border-gray-400 pb-1 cursor-pointer">
                POLITICS
              </Link>
              <Link href="/business" className="hover:border-b-2 hover:border-gray-400 pb-1 cursor-pointer">
                BUSINESS
              </Link>
              <Link href="/sports" className="hover:border-b-2 hover:border-gray-400 pb-1 cursor-pointer">
                SPORTS
              </Link>
              <Link href="/opinion" className="hover:border-b-2 hover:border-gray-400 pb-1 cursor-pointer">
                OPINION
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/analyze"
                className="bg-black text-white px-4 py-2 text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                ANALYZE ARTICLE
              </Link>
              <div className="flex items-center gap-1 text-xs">
                <RefreshCw className="w-3 h-3" />
                <span>UPDATED: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-3 py-1 text-xs font-bold mr-4 font-newspaper-body">BREAKING</span>
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-sm font-bold font-newspaper-body">
                LIVE ANALYSIS: Real-time bias detection from major Indian news sources • Political sentiment tracking
                across media outlets • Credibility scoring for news articles •
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Newspaper Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Featured Story - Left Column */}
          <div className="col-span-8">
            {featuredArticle && (
              <Link href={`/analyze?url=${encodeURIComponent(featuredArticle.url)}&from=feed`}>
                <article className="bg-white newspaper-border border-4 p-6 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getBiasColor(featuredArticle.bias)} variant="outline">
                      {featuredArticle.bias.toUpperCase()} LEAN
                    </Badge>
                    {featuredArticle.trending && (
                      <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        TRENDING
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-3 h-3 rounded-full ${getPartyColor(featuredArticle.party)}`}
                        title={getPartyLabel(featuredArticle.party)}
                      ></div>
                      <span className="text-xs font-bold">{getPartyLabel(featuredArticle.party)}</span>
                    </div>
                  </div>

                  <h1 className="text-4xl font-newspaper-headline text-black mb-4 leading-tight">
                    {featuredArticle.title}
                  </h1>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 font-bold font-newspaper-body">
                    <span className="uppercase">{featuredArticle.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredArticle.timestamp}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {featuredArticle.views}
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed text-gray-800 font-newspaper-body">{featuredArticle.excerpt}</p>

                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide font-newspaper-body">
                      Click to analyze bias and credibility →
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Secondary Stories */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              {topStories.map((article, index) => (
                <Link key={article.id} href={`/analyze?url=${encodeURIComponent(article.url)}&from=feed`}>
                  <article className="bg-white newspaper-border border-2 p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getBiasColor(article.bias)} variant="outline" className="text-xs">
                        {article.bias.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getPartyColor(article.party)}`}></div>
                        <span className="text-xs font-bold">{getPartyLabel(article.party)}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-newspaper-headline text-black mb-3 leading-tight">{article.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3 font-bold font-newspaper-body">
                      <span className="uppercase">{article.source}</span>
                      <span>•</span>
                      <span>{article.timestamp}</span>
                    </div>

                    <p className="text-sm text-gray-700 font-newspaper-body line-clamp-3">{article.excerpt}</p>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4">
            {/* Bias Legend Box */}
            <div className="bg-white newspaper-border border-4 p-4 mb-6">
              <h3 className="text-lg font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                Bias Guide
              </h3>
              <div className="space-y-3 text-sm font-newspaper-body">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Political Lean:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Badge className="bg-blue-50 text-blue-900 border-blue-300 text-center" variant="outline">
                    LEFT
                  </Badge>
                  <Badge className="bg-green-50 text-green-900 border-green-300 text-center" variant="outline">
                    CENTER
                  </Badge>
                  <Badge className="bg-red-50 text-red-900 border-red-300 text-center" variant="outline">
                    RIGHT
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold">Party Affinity:</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-bold">INC</span>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-orange-600 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-bold">BJP</span>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-bold">AAP</span>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-bold">REG</span>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-gray-500 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-bold">NEU</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Stories */}
            <div className="bg-white newspaper-border border-4 p-4">
              <h3 className="text-lg font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                More Stories
              </h3>
              <div className="space-y-4">
                {otherStories.slice(0, 6).map((article, index) => (
                  <Link key={article.id} href={`/analyze?url=${encodeURIComponent(article.url)}&from=feed`}>
                    <article className="border-b border-gray-300 pb-3 hover:bg-gray-50 p-2 -m-2 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getBiasColor(article.bias)} variant="outline" className="text-xs">
                          {article.bias.charAt(0).toUpperCase()}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getPartyColor(article.party)}`}></div>
                      </div>
                      <h4 className="text-sm font-newspaper-headline text-black mb-2 leading-tight">{article.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-bold font-newspaper-body">
                        <span className="uppercase">{article.source}</span>
                        <span>•</span>
                        <span>{article.timestamp}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Newspaper Style */}
      <footer className="bg-black text-white py-8 mt-12 border-t-8 border-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 text-sm font-newspaper-body">
            <div>
              <h4 className="font-bold text-lg mb-3 uppercase tracking-wide">About</h4>
              <p className="leading-relaxed">
                The Bias Tribune provides real-time analysis of Indian news media, detecting political bias and
                credibility metrics across major outlets.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 uppercase tracking-wide">Sections</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/politics" className="hover:underline">
                    Politics
                  </Link>
                </li>
                <li>
                  <Link href="/business" className="hover:underline">
                    Business
                  </Link>
                </li>
                <li>
                  <Link href="/sports" className="hover:underline">
                    Sports
                  </Link>
                </li>
                <li>
                  <Link href="/opinion" className="hover:underline">
                    Opinion
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 uppercase tracking-wide">Tools</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/analyze" className="hover:underline">
                    Article Analyzer
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Bias Tracker
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Source Monitor
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Trend Analysis
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 uppercase tracking-wide">Contact</h4>
              <div className="space-y-2">
                <p>Editorial: editor@biastribune.com</p>
                <p>Technical: tech@biastribune.com</p>
                <p>Phone: +91-11-2345-6789</p>
                <p>New Delhi, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-6 text-center">
            <p>© 2024 The Bias Tribune. All rights reserved. | Committed to transparent media analysis.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
