import { Badge } from "@/components/ui/badge"
import { RefreshCw, Newspaper, Calendar, Trophy } from "lucide-react"
import Link from "next/link"

export default function SportsPage() {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const lastUpdated = new Date().toLocaleTimeString()

  // Mock sports articles
  const sportsArticles = [
    {
      id: "sports-1",
      title: "India Wins Cricket World Cup Final Against Australia",
      source: "ESPN Cricinfo",
      bias: "center",
      excerpt:
        "In a thrilling final at the Narendra Modi Stadium, India defeated Australia by 6 wickets to claim their third Cricket World Cup title...",
      timestamp: "1 hour ago",
      views: "45.2K",
      trending: true,
      url: "https://espncricinfo.com/sample-world-cup",
    },
    {
      id: "sports-2",
      title: "Indian Football Team Qualifies for Asian Cup Semifinals",
      source: "Goal.com",
      bias: "center",
      excerpt:
        "The Blue Tigers secured a historic victory against Japan to reach the Asian Cup semifinals for the first time in decades...",
      timestamp: "3 hours ago",
      views: "28.7K",
      trending: true,
      url: "https://goal.com/sample-asian-cup",
    },
  ]

  return (
    <div className="min-h-screen vintage-paper">
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
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <p className="text-2xl font-newspaper-headline text-yellow-600">SPORTS SECTION</p>
                  <Trophy className="w-6 h-6 text-yellow-600" />
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

          <div className="flex justify-center items-center text-sm font-bold uppercase tracking-wide font-newspaper-body mt-4">
            <div className="flex gap-8">
              <Link href="/" className="hover:border-b-2 hover:border-gray-400 pb-1">
                HOME
              </Link>
              <Link href="/politics" className="hover:border-b-2 hover:border-gray-400 pb-1">
                POLITICS
              </Link>
              <Link href="/business" className="hover:border-b-2 hover:border-gray-400 pb-1">
                BUSINESS
              </Link>
              <span className="border-b-2 border-black pb-1">SPORTS</span>
              <Link href="/opinion" className="hover:border-b-2 hover:border-gray-400 pb-1">
                OPINION
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-yellow-600 text-white py-3">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-lg font-bold font-newspaper-body uppercase tracking-wide">
            Cricket • Football • Olympics • Sports Analysis • Match Reports
          </h2>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-3xl font-newspaper-headline text-black mb-4">Sports Section Coming Soon</h2>
          <p className="text-lg text-gray-700 font-newspaper-body mb-6">
            We're working on bringing you comprehensive sports coverage with bias analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sportsArticles.map((article) => (
              <div key={article.id} className="bg-white newspaper-border border-2 p-6">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-3" variant="outline">
                  SPORTS PREVIEW
                </Badge>
                <h3 className="text-xl font-newspaper-headline text-black mb-3">{article.title}</h3>
                <p className="text-gray-700 font-newspaper-body mb-3">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-bold font-newspaper-body">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{article.timestamp}</span>
                  <span>•</span>
                  <span>{article.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
