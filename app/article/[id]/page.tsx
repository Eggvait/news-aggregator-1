import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Eye, Share2, BookOpen, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Mock detailed article data
const getArticleById = (id: string) => {
  const articles = {
    "1": {
      id: 1,
      title: "New Economic Policy Announced: Impact on Middle Class Families",
      source: "Times of India",
      author: "Rajesh Kumar",
      bias: "center",
      party: "neutral",
      fullContent: `The government's latest economic reforms aim to boost middle-class spending power through targeted tax relief measures. The comprehensive policy package includes reduced income tax rates for families earning between ₹5-15 lakhs annually, increased standard deduction limits, and enhanced investment incentives for first-time home buyers.

Finance Minister announced these measures during a press conference, emphasizing the government's commitment to supporting middle-class aspirations. The policy is expected to benefit approximately 4 crore families across the country.

Industry experts have welcomed the move, calling it a "balanced approach" that addresses both economic growth and social welfare. However, some economists have raised concerns about the fiscal deficit implications of these tax cuts.

The implementation timeline spans over the next two financial years, with the first phase of tax relief taking effect from April 2024. The government estimates this will inject ₹1.2 lakh crores into the economy through increased consumer spending.`,
      timestamp: "2 hours ago",
      views: "12.5K",
      trending: true,
      publishedDate: "December 15, 2024",
      readTime: "4 min read",

      // Analysis data
      biasScore: {
        overall: 25,
        emotional: 20,
        factual: 80,
        balanced: 75,
      },

      sentimentAnalysis: {
        positive: 60,
        neutral: 30,
        negative: 10,
      },

      keyPhrases: {
        neutral: ["comprehensive policy package", "industry experts", "implementation timeline"],
        positive: ["boost middle-class", "welcomed the move", "balanced approach"],
        negative: ["raised concerns", "fiscal deficit implications"],
      },

      biasIndicators: [
        {
          type: "Language Choice",
          description: "Uses neutral, factual language with minimal emotional words",
          examples: ["announced", "emphasizing", "estimates"],
          impact: "low",
        },
        {
          type: "Source Balance",
          description: "Includes both supportive and critical perspectives",
          examples: ["Industry experts welcomed", "economists raised concerns"],
          impact: "positive",
        },
        {
          type: "Fact vs Opinion",
          description: "High ratio of factual statements to opinions",
          examples: ["₹5-15 lakhs annually", "4 crore families", "₹1.2 lakh crores"],
          impact: "positive",
        },
      ],

      credibilityMetrics: {
        sourceReliability: 85,
        factChecking: 90,
        transparency: 80,
        authorExpertise: 75,
      },
    },
  }

  return articles[id as keyof typeof articles] || null
}

const getBiasColor = (bias: string) => {
  switch (bias) {
    case "left":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "right":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "center":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high":
      return "text-red-600"
    case "medium":
      return "text-yellow-600"
    case "low":
      return "text-green-600"
    default:
      return "text-gray-600"
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = getArticleById(id)

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News Feed
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "serif" }}>
              The Bias Tribune
            </h1>
            <p className="text-sm text-gray-600">Article Analysis</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getBiasColor(article.bias)}>
                    {article.bias.charAt(0).toUpperCase() + article.bias.slice(1)} Lean
                  </Badge>
                  {article.trending && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="font-medium">{article.source}</span>
                  <span>•</span>
                  <span>By {article.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.timestamp}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {article.readTime}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="prose max-w-none">
                  {article.fullContent.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Share2 className="w-4 h-4" />
                    Share Article
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Sidebar */}
          <div className="space-y-6">
            {/* Bias Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Bias Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Bias</span>
                    <span className="font-medium">{article.biasScore.overall}/100</span>
                  </div>
                  <Progress value={article.biasScore.overall} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {article.biasScore.overall < 40
                      ? "Left-leaning"
                      : article.biasScore.overall > 60
                        ? "Right-leaning"
                        : "Neutral"}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emotional Language</span>
                    <span className="font-medium">{article.biasScore.emotional}/100</span>
                  </div>
                  <Progress value={article.biasScore.emotional} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Factual Content</span>
                    <span className="font-medium">{article.biasScore.factual}/100</span>
                  </div>
                  <Progress value={article.biasScore.factual} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Balance Score</span>
                    <span className="font-medium">{article.biasScore.balanced}/100</span>
                  </div>
                  <Progress value={article.biasScore.balanced} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Positive</span>
                    <span className="font-medium">{article.sentimentAnalysis.positive}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Neutral</span>
                    <span className="font-medium">{article.sentimentAnalysis.neutral}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Negative</span>
                    <span className="font-medium">{article.sentimentAnalysis.negative}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Phrases */}
            <Card>
              <CardHeader>
                <CardTitle>Key Phrases Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Positive Language</h4>
                  <div className="flex flex-wrap gap-1">
                    {article.keyPhrases.positive.map((phrase, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Neutral Language</h4>
                  <div className="flex flex-wrap gap-1">
                    {article.keyPhrases.neutral.map((phrase, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-red-600 mb-2">Negative Language</h4>
                  <div className="flex flex-wrap gap-1">
                    {article.keyPhrases.negative.map((phrase, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Source Credibility */}
            <Card>
              <CardHeader>
                <CardTitle>Source Credibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Source Reliability</span>
                    <span className="font-medium">{article.credibilityMetrics.sourceReliability}/100</span>
                  </div>
                  <Progress value={article.credibilityMetrics.sourceReliability} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fact Checking</span>
                    <span className="font-medium">{article.credibilityMetrics.factChecking}/100</span>
                  </div>
                  <Progress value={article.credibilityMetrics.factChecking} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Transparency</span>
                    <span className="font-medium">{article.credibilityMetrics.transparency}/100</span>
                  </div>
                  <Progress value={article.credibilityMetrics.transparency} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Author Expertise</span>
                    <span className="font-medium">{article.credibilityMetrics.authorExpertise}/100</span>
                  </div>
                  <Progress value={article.credibilityMetrics.authorExpertise} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Bias Indicators */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What Makes This Article Sound This Way?</CardTitle>
            <p className="text-gray-600">Detailed analysis of bias indicators and language patterns</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {article.biasIndicators.map((indicator, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{indicator.type}</h3>
                    <Badge variant="outline" className={getImpactColor(indicator.impact)}>
                      {indicator.impact} impact
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{indicator.description}</p>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Examples: </span>
                    {indicator.examples.map((example, exIndex) => (
                      <Badge key={exIndex} variant="outline" className="mr-1 mb-1 text-xs">
                        "{example}"
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
