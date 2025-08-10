import { Badge } from "@/components/ui/badge"
import { RefreshCw, Newspaper, Calendar, MessageSquare, User } from "lucide-react"
import Link from "next/link"

export default function OpinionPage() {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const lastUpdated = new Date().toLocaleTimeString()

  // Mock opinion pieces
  const opinionArticles = [
    {
      id: "opinion-1",
      title: "The Future of Indian Democracy: Challenges and Opportunities",
      author: "Dr. Rajesh Sharma",
      bias: "center",
      excerpt:
        "As India navigates through complex political landscapes, we must examine the evolving nature of democratic institutions and their role in shaping our future...",
      timestamp: "2 hours ago",
      views: "12.3K",
      category: "Political Analysis",
    },
    {
      id: "opinion-2",
      title: "Economic Reforms: Balancing Growth with Social Justice",
      author: "Prof. Meera Gupta",
      bias: "left",
      excerpt:
        "The recent economic policies raise important questions about inclusive growth and the need to address inequality while pursuing development goals...",
      timestamp: "4 hours ago",
      views: "8.7K",
      category: "Economic Policy",
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
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <p className="text-2xl font-newspaper-headline text-purple-600">OPINION SECTION</p>
                  <MessageSquare className="w-6 h-6 text-purple-600" />
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
              <Link href="/sports" className="hover:border-b-2 hover:border-gray-400 pb-1">
                SPORTS
              </Link>
              <span className="border-b-2 border-black pb-1">OPINION</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-purple-600 text-white py-3">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-lg font-bold font-newspaper-body uppercase tracking-wide">
            Editorial • Op-Ed • Analysis • Commentary • Expert Views
          </h2>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-3xl font-newspaper-headline text-black mb-4">Opinion & Editorial</h2>
          <p className="text-lg text-gray-700 font-newspaper-body mb-6">
            Expert analysis and editorial perspectives on current affairs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {opinionArticles.map((article) => (
              <div key={article.id} className="bg-white newspaper-border border-2 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300" variant="outline">
                    {article.category}
                  </Badge>
                  <Badge
                    className={`${article.bias === "center" ? "bg-green-50 text-green-900 border-green-300" : "bg-blue-50 text-blue-900 border-blue-300"}`}
                    variant="outline"
                  >
                    {article.bias.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-xl font-newspaper-headline text-black mb-3">{article.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold font-newspaper-body">{article.author}</span>
                </div>
                <p className="text-gray-700 font-newspaper-body mb-3">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-bold font-newspaper-body">
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
