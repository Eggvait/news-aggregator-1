import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Eye, RefreshCw, Newspaper, Calendar, DollarSign, TrendingDown } from "lucide-react"
import Link from "next/link"
import { LiveNewsFetcher } from "@/lib/news-fetcher"

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

// Filter articles for business content
const filterBusinessArticles = (articles: any[]) => {
  const businessKeywords = [
    "economy",
    "gdp",
    "market",
    "stock",
    "business",
    "finance",
    "investment",
    "bank",
    "rupee",
    "inflation",
    "trade",
    "export",
    "import",
    "industry",
    "corporate",
    "company",
    "revenue",
    "profit",
    "loss",
    "economic",
    "financial",
    "rbi",
    "reserve bank",
    "sensex",
    "nifty",
    "bse",
    "nse",
    "startup",
    "ipo",
    "merger",
    "acquisition",
  ]

  return articles.filter((article) => {
    const text = `${article.title} ${article.excerpt}`.toLowerCase()
    return businessKeywords.some((keyword) => text.includes(keyword))
  })
}

export default async function BusinessPage() {
  const allArticles = await LiveNewsFetcher.fetchLiveArticles()
  const businessArticles = filterBusinessArticles(allArticles)
  const lastUpdated = new Date().toLocaleTimeString()
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // If no business articles found, create some mock business content
  const mockBusinessArticles =
    businessArticles.length === 0
      ? [
          {
            id: "biz-1",
            title: "India's GDP Growth Surpasses Global Expectations in Q3",
            source: "Business Standard",
            bias: "center",
            party: "neutral",
            excerpt:
              "India's economy showed robust growth in the third quarter, outpacing global forecasts with strong manufacturing and services sector performance...",
            timestamp: "2 hours ago",
            views: "25.3K",
            trending: true,
            url: "https://business-standard.com/sample-gdp-growth",
          },
          {
            id: "biz-2",
            title: "RBI Maintains Repo Rate at 6.5% Amid Inflation Concerns",
            source: "Economic Times",
            bias: "center",
            party: "neutral",
            excerpt:
              "The Reserve Bank of India kept the benchmark interest rate unchanged, citing balanced approach to growth and inflation management...",
            timestamp: "4 hours ago",
            views: "18.7K",
            trending: false,
            url: "https://economictimes.com/sample-rbi-rate",
          },
          {
            id: "biz-3",
            title: "Tech Startups Raise Record $2.8 Billion in Funding This Quarter",
            source: "Mint",
            bias: "center",
            party: "neutral",
            excerpt:
              "Indian technology startups attracted unprecedented investment levels, with fintech and e-commerce leading the funding surge...",
            timestamp: "6 hours ago",
            views: "15.2K",
            trending: true,
            url: "https://mint.com/sample-startup-funding",
          },
        ]
      : businessArticles

  const featuredArticle = mockBusinessArticles[0]
  const otherArticles = mockBusinessArticles.slice(1)

  return (
    <div className="min-h-screen vintage-paper">
      {/* Business Header */}
      <header className="bg-white newspaper-border border-b-8 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-black hover:text-gray-700 mb-4 font-bold font-newspaper-body"
          >
            <Newspaper className="w-5 h-5 mr-2" />
            BACK TO MAIN EDITION
          </Link>

          <div className="text-center border-b-4 border-black pb-4">
            <div className="flex justify-between items-center">
              <div className="text-left font-newspaper-body">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>{currentDate}</span>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-5xl font-newspaper-masthead text-black mb-2 tracking-wider">The Bias Tribune</h1>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <p className="text-2xl font-newspaper-headline text-green-600">BUSINESS SECTION</p>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-newspaper-body">
                  <RefreshCw className="w-3 h-3" />
                  <span>UPDATED: {lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center text-sm font-bold uppercase tracking-wide font-newspaper-body mt-4">
            <div className="flex gap-8">
              <Link href="/" className="hover:border-b-2 hover:border-gray-400 pb-1">
                HOME
              </Link>
              <Link href="/politics" className="hover:border-b-2 hover:border-gray-400 pb-1">
                POLITICS
              </Link>
              <span className="border-b-2 border-black pb-1">BUSINESS</span>
              <Link href="/sports" className="hover:border-b-2 hover:border-gray-400 pb-1">
                SPORTS
              </Link>
              <Link href="/opinion" className="hover:border-b-2 hover:border-gray-400 pb-1">
                OPINION
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Business Banner */}
      <div className="bg-green-600 text-white py-3">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-lg font-bold font-newspaper-body uppercase tracking-wide">
            Market Updates • Economic Analysis • Corporate News • Financial Insights
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Featured Business Story */}
          <div className="col-span-8">
            {featuredArticle && (
              <Link href={`/analyze?url=${encodeURIComponent(featuredArticle.url)}&from=feed`}>
                <article className="bg-white newspaper-border border-4 p-8 hover:shadow-xl transition-shadow cursor-pointer mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                      FEATURED BUSINESS
                    </Badge>
                    <Badge className={getBiasColor(featuredArticle.bias)} variant="outline">
                      {featuredArticle.bias.toUpperCase()} LEAN
                    </Badge>
                    {featuredArticle.trending && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300" variant="outline">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        TRENDING
                      </Badge>
                    )}
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
                      Click to analyze business reporting bias →
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Other Business Stories */}
            <div className="grid grid-cols-1 gap-6">
              {otherArticles.map((article, index) => (
                <Link key={article.id} href={`/analyze?url=${encodeURIComponent(article.url)}&from=feed`}>
                  <article className="bg-white newspaper-border border-2 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getBiasColor(article.bias)} variant="outline" className="text-xs">
                        {article.bias.toUpperCase()}
                      </Badge>
                      {article.trending && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300" variant="outline">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          HOT
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-2xl font-newspaper-headline text-black mb-3 leading-tight">{article.title}</h3>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 font-bold font-newspaper-body">
                      <span className="uppercase">{article.source}</span>
                      <span>•</span>
                      <span>{article.timestamp}</span>
                      <span>•</span>
                      <span>{article.views} views</span>
                    </div>

                    <p className="text-base text-gray-700 font-newspaper-body">{article.excerpt}</p>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Business Sidebar */}
          <div className="col-span-4">
            {/* Market Indicators */}
            <div className="bg-white newspaper-border border-4 p-6 mb-6">
              <h3 className="text-xl font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                Market Watch
              </h3>
              <div className="space-y-3 font-newspaper-body">
                <div className="flex items-center justify-between">
                  <span className="font-bold">SENSEX</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">72,485</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">NIFTY</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">21,982</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">USD/INR</span>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600 font-bold">83.25</span>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">GOLD</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">₹62,450</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Analysis */}
            <div className="bg-white newspaper-border border-4 p-6">
              <h3 className="text-xl font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                Business Analysis
              </h3>
              <div className="space-y-4 font-newspaper-body">
                <div className="text-sm">
                  <p className="font-bold mb-2">Business Articles:</p>
                  <p className="text-2xl font-newspaper-headline">{mockBusinessArticles.length}</p>
                </div>
                <div className="text-sm">
                  <p className="font-bold mb-2">Market Sentiment:</p>
                  <Badge className="bg-green-100 text-green-800 border-green-300">POSITIVE</Badge>
                </div>
                <div className="text-sm">
                  <p className="font-bold mb-2">Top Sector:</p>
                  <p className="font-bold">Technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
