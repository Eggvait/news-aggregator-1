import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Eye, RefreshCw, Newspaper, Calendar, Vote } from "lucide-react"
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

// Filter articles for political content
const filterPoliticalArticles = (articles: any[]) => {
  const politicalKeywords = [
    "parliament",
    "election",
    "modi",
    "congress",
    "bjp",
    "government",
    "minister",
    "policy",
    "politics",
    "vote",
    "campaign",
    "party",
    "opposition",
    "ruling",
    "cabinet",
    "lok sabha",
    "rajya sabha",
    "assembly",
    "chief minister",
    "governor",
  ]

  return articles.filter((article) => {
    const text = `${article.title} ${article.excerpt}`.toLowerCase()
    return politicalKeywords.some((keyword) => text.includes(keyword)) || article.party !== "neutral"
  })
}

export default async function PoliticsPage() {
  const allArticles = await LiveNewsFetcher.fetchLiveArticles()
  const politicalArticles = filterPoliticalArticles(allArticles)
  const lastUpdated = new Date().toLocaleTimeString()
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const featuredArticle = politicalArticles[0]
  const otherArticles = politicalArticles.slice(1)

  return (
    <div className="min-h-screen vintage-paper">
      {/* Politics Header */}
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
                  <Vote className="w-6 h-6 text-red-600" />
                  <p className="text-2xl font-newspaper-headline text-red-600">POLITICS SECTION</p>
                  <Vote className="w-6 h-6 text-red-600" />
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
              <span className="border-b-2 border-black pb-1">POLITICS</span>
              <Link href="/business" className="hover:border-b-2 hover:border-gray-400 pb-1">
                BUSINESS
              </Link>
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

      {/* Politics Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-lg font-bold font-newspaper-body uppercase tracking-wide">
            Political News & Analysis • Government Updates • Election Coverage • Policy Analysis
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {politicalArticles.length === 0 ? (
          <div className="text-center py-12">
            <Vote className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-newspaper-headline text-gray-600 mb-2">No Political Articles Available</h2>
            <p className="text-gray-500 font-newspaper-body">Check back later for political news and analysis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Featured Political Story */}
            <div className="col-span-8">
              {featuredArticle && (
                <Link href={`/analyze?url=${encodeURIComponent(featuredArticle.url)}&from=feed`}>
                  <article className="bg-white newspaper-border border-4 p-8 hover:shadow-xl transition-shadow cursor-pointer mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">
                        FEATURED POLITICS
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

                    <p className="text-lg leading-relaxed text-gray-800 font-newspaper-body">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-wide font-newspaper-body">
                        Click to analyze political bias and credibility →
                      </span>
                    </div>
                  </article>
                </Link>
              )}

              {/* Other Political Stories */}
              <div className="grid grid-cols-1 gap-6">
                {otherArticles.slice(0, 6).map((article, index) => (
                  <Link key={article.id} href={`/analyze?url=${encodeURIComponent(article.url)}&from=feed`}>
                    <article className="bg-white newspaper-border border-2 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getBiasColor(article.bias)} variant="outline" className="text-xs">
                          {article.bias.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPartyColor(article.party)}`}></div>
                          <span className="text-xs font-bold">{getPartyLabel(article.party)}</span>
                        </div>
                        {article.trending && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300" variant="outline">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            HOT
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-2xl font-newspaper-headline text-black mb-3 leading-tight">
                        {article.title}
                      </h3>

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

            {/* Politics Sidebar */}
            <div className="col-span-4">
              {/* Political Parties Tracker */}
              <div className="bg-white newspaper-border border-4 p-6 mb-6">
                <h3 className="text-xl font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                  Party Coverage
                </h3>
                <div className="space-y-3">
                  {["bjp", "congress", "aap", "regional"].map((party) => {
                    const partyArticles = politicalArticles.filter((a) => a.party === party)
                    const percentage = Math.round((partyArticles.length / politicalArticles.length) * 100) || 0
                    return (
                      <div key={party} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${getPartyColor(party)}`}></div>
                          <span className="font-bold font-newspaper-body">{getPartyLabel(party)}</span>
                        </div>
                        <span className="text-sm font-bold">{percentage}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bias Distribution */}
              <div className="bg-white newspaper-border border-4 p-6 mb-6">
                <h3 className="text-xl font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                  Bias Distribution
                </h3>
                <div className="space-y-3">
                  {["left", "center", "right"].map((bias) => {
                    const biasArticles = politicalArticles.filter((a) => a.bias === bias)
                    const percentage = Math.round((biasArticles.length / politicalArticles.length) * 100) || 0
                    return (
                      <div key={bias} className="flex items-center justify-between">
                        <Badge className={getBiasColor(bias)} variant="outline">
                          {bias.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-bold">{percentage}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Analysis */}
              <div className="bg-white newspaper-border border-4 p-6">
                <h3 className="text-xl font-newspaper-headline text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                  Quick Analysis
                </h3>
                <div className="space-y-4 font-newspaper-body">
                  <div className="text-sm">
                    <p className="font-bold mb-2">Total Political Articles:</p>
                    <p className="text-2xl font-newspaper-headline">{politicalArticles.length}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold mb-2">Trending Stories:</p>
                    <p className="text-2xl font-newspaper-headline">
                      {politicalArticles.filter((a) => a.trending).length}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold mb-2">Most Active Source:</p>
                    <p className="font-bold">
                      {(() => {
                        const sourceCounts = politicalArticles.reduce(
                          (acc, article) => {
                            acc[article.source] = (acc[article.source] || 0) + 1
                            return acc
                          },
                          {} as Record<string, number>,
                        )
                        const mostActiveSource = Object.entries(sourceCounts).reduce(
                          (max, [source, count]) => (count > max.count ? { source, count } : max),
                          { source: "N/A", count: 0 },
                        )
                        return mostActiveSource.source
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
