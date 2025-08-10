"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, ExternalLink, Newspaper, Calendar } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface AnalysisResult {
  title: string
  source: string
  author: string
  publishedDate: string
  content: string
  url: string
  readTime: string
  highlightedContent: string
  extractionMethod?: string
  contentLength?: number
  isSupported?: boolean

  biasScore: {
    overall: number
    emotional: number
    factual: number
    balanced: number
  }

  sentimentAnalysis: {
    positive: number
    neutral: number
    negative: number
  }

  keyPhrases: {
    neutral: string[]
    positive: string[]
    negative: string[]
  }

  biasIndicators: Array<{
    type: string
    description: string
    examples: string[]
    impact: string
  }>

  credibilityMetrics: {
    sourceReliability: number
    factChecking: number
    transparency: number
    authorExpertise: number
  }
}

const getBiasColor = (bias: number) => {
  if (bias < 40) return "bg-blue-50 text-blue-900 border-blue-300"
  if (bias > 60) return "bg-red-50 text-red-900 border-red-300"
  return "bg-green-50 text-green-900 border-green-300"
}

const getBiasLabel = (bias: number) => {
  if (bias < 40) return "Left-leaning"
  if (bias > 60) return "Right-leaning"
  return "Neutral"
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high":
      return "text-red-800 bg-red-100"
    case "medium":
      return "text-yellow-800 bg-yellow-100"
    case "low":
      return "text-green-800 bg-green-100"
    default:
      return "text-gray-800 bg-gray-100"
  }
}

export default function AnalyzePage() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get("url")
  const fromParam = searchParams.get("from")

  const [url, setUrl] = useState(urlParam || "")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const showForm = fromParam !== "feed"
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    try {
      new URL(url)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    setError("")
    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed")
      }

      setAnalysis(result)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to analyze the article. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (urlParam && !analysis && !isAnalyzing && !error) {
      handleSubmit(new Event("submit") as any)
    }
  }, [urlParam, analysis, isAnalyzing, error])

  return (
    <div className="min-h-screen bg-amber-50" style={{ fontFamily: "Georgia, serif" }}>
      {/* Newspaper Header */}
      <header className="bg-white border-b-8 border-black shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center text-black hover:text-gray-700 mb-4 font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" />
            BACK TO MAIN EDITION
          </Link>

          <div className="text-center border-b-4 border-black pb-4">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>{currentDate}</span>
                </div>
              </div>

              <div className="text-center">
                <h1
                  className="text-5xl font-bold text-black mb-2 tracking-wider"
                  style={{ fontFamily: "Old English Text MT, serif" }}
                >
                  The Bias Tribune
                </h1>
                {showForm ? (
                  <p className="text-lg italic text-gray-700 font-serif">Article Analysis Laboratory</p>
                ) : (
                  <p className="text-lg italic text-gray-700 font-serif">Live Article Analysis</p>
                )}
              </div>

              <div className="text-right">
                <Newspaper className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Analysis Form - Newspaper Style */}
        {showForm && (
          <div className="bg-white border-4 border-black p-8 mb-8 max-w-4xl mx-auto">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h2 className="text-3xl font-bold text-black uppercase tracking-wide">Article Analysis Laboratory</h2>
              <p className="text-lg text-gray-700 font-serif mt-2">
                Submit any Indian news article URL for comprehensive bias analysis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-black mb-3 uppercase tracking-wide">Article URL:</label>
                <Input
                  type="url"
                  placeholder="https://timesofindia.indiatimes.com/your-article-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-lg p-4 border-2 border-black font-serif"
                  disabled={isAnalyzing}
                />
                {error && (
                  <div className="text-red-800 bg-red-100 border-2 border-red-300 p-4 mt-3">
                    <p className="font-bold">ANALYSIS ERROR:</p>
                    <p className="font-serif">{error}</p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 text-lg py-4 font-bold uppercase tracking-wide"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ANALYZING ARTICLE...
                  </>
                ) : (
                  "ANALYZE ARTICLE"
                )}
              </Button>
            </form>

            {/* Supported Sources - Newspaper Style */}
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-4">
                <h3 className="font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-2">
                  Supported Sources:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm font-serif">
                  <span>• Times of India</span>
                  <span>• The Hindu</span>
                  <span>• Hindustan Times</span>
                  <span>• NDTV</span>
                  <span>• Indian Express</span>
                  <span>• Zee News</span>
                  <span>• Republic World</span>
                  <span>• News18</span>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-4">
                <h3 className="font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-2">
                  Sample URLs:
                </h3>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => setUrl("https://timesofindia.indiatimes.com/india/news")}
                    className="block text-blue-800 hover:underline font-serif"
                    disabled={isAnalyzing}
                  >
                    → Times of India Sample
                  </button>
                  <button
                    onClick={() => setUrl("https://www.thehindu.com/news/national/")}
                    className="block text-blue-800 hover:underline font-serif"
                    disabled={isAnalyzing}
                  >
                    → The Hindu Sample
                  </button>
                  <button
                    onClick={() => setUrl("https://www.hindustantimes.com/india-news")}
                    className="block text-blue-800 hover:underline font-serif"
                    disabled={isAnalyzing}
                  >
                    → Hindustan Times Sample
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!showForm && isAnalyzing && (
          <div className="bg-white border-4 border-black p-8 max-w-2xl mx-auto text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-black uppercase tracking-wide">ANALYZING ARTICLE...</h2>
            <p className="text-lg text-gray-700 font-serif mt-2">Extracting content and detecting bias patterns</p>
          </div>
        )}

        {/* Error State */}
        {!showForm && error && !isAnalyzing && (
          <div className="bg-white border-4 border-red-600 p-8 max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold text-red-800 uppercase tracking-wide">ANALYSIS ERROR</h2>
            <p className="text-lg text-gray-700 font-serif mt-2 mb-4">{error}</p>
            <Button
              onClick={() => handleSubmit(new Event("submit") as any)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide"
            >
              TRY AGAIN
            </Button>
          </div>
        )}

        {/* Analysis Results - Newspaper Layout */}
        {analysis && (
          <div className="grid grid-cols-12 gap-8">
            {/* Main Article Analysis */}
            <div className="col-span-8">
              <div className="bg-white border-4 border-black p-8">
                {/* Article Header */}
                <div className="border-b-4 border-black pb-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getBiasColor(analysis.biasScore.overall)} variant="outline">
                      {getBiasLabel(analysis.biasScore.overall).toUpperCase()}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      LIVE ANALYSIS
                    </Badge>
                    {analysis.extractionMethod === "fallback" && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300" variant="outline">
                        LIMITED EXTRACTION
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold text-black mb-4 leading-tight font-serif">{analysis.title}</h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-4 font-bold">
                    <span className="uppercase">{analysis.source}</span>
                    <span>•</span>
                    <span>BY {analysis.author.toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(analysis.publishedDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{analysis.readTime}</span>
                    {analysis.contentLength && (
                      <>
                        <span>•</span>
                        <span>{analysis.contentLength} CHARS EXTRACTED</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-blue-800 mb-4">
                    <ExternalLink className="w-4 h-4" />
                    <a
                      href={analysis.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-bold"
                    >
                      VIEW ORIGINAL ARTICLE
                    </a>
                  </div>

                  {analysis.extractionMethod === "fallback" && (
                    <div className="bg-yellow-100 border-2 border-yellow-400 p-4">
                      <p className="text-yellow-800 font-serif">
                        <strong>NOTE:</strong> Full content extraction was limited. Analysis is based on available
                        metadata and source patterns.
                      </p>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="prose max-w-none font-serif text-lg leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: analysis.highlightedContent }} className="text-gray-800" />
                </div>

                {/* Highlighting Legend */}
                <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-400">
                  <h4 className="font-bold text-yellow-800 mb-3 uppercase tracking-wide">Highlighting Legend:</h4>
                  <div className="flex flex-wrap gap-4 text-sm font-serif">
                    <span>
                      <mark className="bg-green-200">Positive Language</mark>
                    </span>
                    <span>
                      <mark className="bg-red-200">Negative Language</mark>
                    </span>
                    <span>
                      <mark className="bg-yellow-200">Political Keywords</mark>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Bias Analysis */}
              <div className="bg-white border-4 border-black p-6">
                <h3 className="text-xl font-bold text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  Bias Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span>OVERALL BIAS</span>
                      <span>{analysis.biasScore.overall}/100</span>
                    </div>
                    <Progress value={analysis.biasScore.overall} className="h-3 border border-black" />
                    <p className="text-xs text-gray-600 mt-1 font-serif italic">
                      {getBiasLabel(analysis.biasScore.overall)}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span>EMOTIONAL LANGUAGE</span>
                      <span>{analysis.biasScore.emotional}/100</span>
                    </div>
                    <Progress value={analysis.biasScore.emotional} className="h-3 border border-black" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span>FACTUAL CONTENT</span>
                      <span>{analysis.biasScore.factual}/100</span>
                    </div>
                    <Progress value={analysis.biasScore.factual} className="h-3 border border-black" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span>BALANCE SCORE</span>
                      <span>{analysis.biasScore.balanced}/100</span>
                    </div>
                    <Progress value={analysis.biasScore.balanced} className="h-3 border border-black" />
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white border-4 border-black p-6">
                <h3 className="text-xl font-bold text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                  Sentiment
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-green-700">POSITIVE</span>
                    <span>{analysis.sentimentAnalysis.positive}%</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-700">NEUTRAL</span>
                    <span>{analysis.sentimentAnalysis.neutral}%</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-red-700">NEGATIVE</span>
                    <span>{analysis.sentimentAnalysis.negative}%</span>
                  </div>
                </div>
              </div>

              {/* Source Credibility */}
              <div className="bg-white border-4 border-black p-6">
                <h3 className="text-xl font-bold text-black mb-4 text-center uppercase tracking-wide border-b-2 border-black pb-2">
                  Credibility
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span>SOURCE RELIABILITY</span>
                      <span>{analysis.credibilityMetrics.sourceReliability}/100</span>
                    </div>
                    <Progress
                      value={analysis.credibilityMetrics.sourceReliability}
                      className="h-2 border border-black"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span>FACT CHECKING</span>
                      <span>{analysis.credibilityMetrics.factChecking}/100</span>
                    </div>
                    <Progress value={analysis.credibilityMetrics.factChecking} className="h-2 border border-black" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span>TRANSPARENCY</span>
                      <span>{analysis.credibilityMetrics.transparency}/100</span>
                    </div>
                    <Progress value={analysis.credibilityMetrics.transparency} className="h-2 border border-black" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span>AUTHOR EXPERTISE</span>
                      <span>{analysis.credibilityMetrics.authorExpertise}/100</span>
                    </div>
                    <Progress value={analysis.credibilityMetrics.authorExpertise} className="h-2 border border-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis - Full Width */}
        {analysis && (
          <div className="mt-8 bg-white border-4 border-black p-8">
            <div className="text-center border-b-4 border-black pb-4 mb-8">
              <h2 className="text-3xl font-bold text-black uppercase tracking-wide">Editorial Analysis</h2>
              <p className="text-lg text-gray-700 font-serif mt-2">
                Detailed breakdown of bias indicators and language patterns
              </p>
            </div>

            <div className="space-y-8">
              {analysis.biasIndicators.map((indicator, index) => (
                <div key={index} className="border-l-8 border-black pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-black uppercase tracking-wide">{indicator.type}</h3>
                    <Badge className={`${getImpactColor(indicator.impact)} font-bold uppercase`} variant="outline">
                      {indicator.impact} IMPACT
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-800 mb-4 font-serif leading-relaxed">{indicator.description}</p>
                  <div>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Examples: </span>
                    {indicator.examples.map((example, exIndex) => (
                      <Badge key={exIndex} variant="outline" className="mr-2 mb-2 text-sm border-2 border-gray-400">
                        "{example}"
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
