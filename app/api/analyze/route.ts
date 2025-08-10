import { type NextRequest, NextResponse } from "next/server"
import { NewsArticleScraper } from "@/lib/scraper"
import { BiasAnalyzer } from "@/lib/bias-analyzer"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    console.log(`Analyzing URL: ${url}`)

    // Check if article already exists in database
    const existingArticle = await DatabaseService.getArticleByUrl(url)

    if (existingArticle) {
      console.log("Article found in database, returning cached analysis")

      // Increment view count
      await DatabaseService.incrementArticleViews(existingArticle.id)

      // Save analysis history
      await DatabaseService.saveAnalysisHistory({
        article_id: existingArticle.id,
        analysis_results: {
          biasScore: existingArticle.bias_score,
          sentimentAnalysis: existingArticle.sentiment_analysis,
          keyPhrases: existingArticle.key_phrases,
          biasIndicators: existingArticle.bias_indicators,
          credibilityMetrics: existingArticle.credibility_metrics,
        },
        ip_address: request.ip,
        user_agent: request.headers.get("user-agent"),
      })

      // Return in expected format
      return NextResponse.json({
        title: existingArticle.title,
        source: existingArticle.source_name,
        author: existingArticle.author,
        publishedDate: existingArticle.published_date,
        content: existingArticle.content,
        url: existingArticle.original_url,
        readTime: `${existingArticle.read_time_minutes || 5} min read`,
        highlightedContent: existingArticle.content, // You might want to re-highlight
        extractionMethod: existingArticle.extraction_method,
        contentLength: existingArticle.content?.length || 0,
        isSupported: true,
        biasScore: existingArticle.bias_score,
        sentimentAnalysis: existingArticle.sentiment_analysis,
        keyPhrases: existingArticle.key_phrases,
        biasIndicators: existingArticle.bias_indicators,
        credibilityMetrics: existingArticle.credibility_metrics,
      })
    }

    // Article not in database, scrape and analyze
    console.log("Article not found in database, scraping...")

    let scrapedArticle
    try {
      scrapedArticle = await NewsArticleScraper.scrapeArticle(url)
      console.log(`Scraping successful: ${scrapedArticle.content.length} characters extracted`)
    } catch (error) {
      console.error("Scraping error:", error)
      return NextResponse.json(
        {
          error: `Failed to extract article content: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 400 },
      )
    }

    // Validate content length
    if (!scrapedArticle.content || scrapedArticle.content.length < 50) {
      console.log(`Content too short: ${scrapedArticle.content?.length || 0} characters`)
      return NextResponse.json(
        {
          error: "Could not extract sufficient content from the article",
          extractedContent: scrapedArticle.content?.substring(0, 200) + "...",
        },
        { status: 400 },
      )
    }

    // Analyze the article for bias
    console.log("Starting bias analysis...")
    const biasAnalysis = BiasAnalyzer.analyzeArticle(
      scrapedArticle.title,
      scrapedArticle.content,
      scrapedArticle.source,
    )

    // Calculate additional metrics
    const wordCount = scrapedArticle.content.split(" ").length
    const readTimeMinutes = Math.ceil(wordCount / 200)

    // Save to database
    try {
      const savedArticle = await DatabaseService.createArticle({
        title: scrapedArticle.title,
        content: scrapedArticle.content,
        excerpt: scrapedArticle.content.substring(0, 200) + "...",
        author: scrapedArticle.author,
        source_name: scrapedArticle.source,
        original_url: url,
        published_date: scrapedArticle.publishedDate,
        bias_score: biasAnalysis.biasScore,
        sentiment_analysis: biasAnalysis.sentimentAnalysis,
        key_phrases: biasAnalysis.keyPhrases,
        bias_indicators: biasAnalysis.biasIndicators,
        credibility_metrics: biasAnalysis.credibilityMetrics,
        political_lean:
          biasAnalysis.biasScore.overall < 40 ? "left" : biasAnalysis.biasScore.overall > 60 ? "right" : "center",
        party_affinity: "neutral", // You might want to enhance this logic
        category: "general", // You might want to auto-categorize
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        extraction_method: scrapedArticle.content.includes("technical limitations") ? "fallback" : "full",
        content_quality_score: Math.min(scrapedArticle.content.length / 100, 100),
      })

      console.log("Article saved to database:", savedArticle.id)

      // Save analysis history
      await DatabaseService.saveAnalysisHistory({
        article_id: savedArticle.id,
        analysis_results: biasAnalysis,
        ip_address: request.ip,
        user_agent: request.headers.get("user-agent"),
      })
    } catch (dbError) {
      console.error("Error saving to database:", dbError)
      // Continue with response even if DB save fails
    }

    // Combine scraped data with analysis
    const result = {
      ...scrapedArticle,
      ...biasAnalysis,
      readTime: `${readTimeMinutes} min read`,
      extractionMethod: scrapedArticle.content.includes("technical limitations") ? "fallback" : "full",
      contentLength: scrapedArticle.content.length,
      isSupported: true,
    }

    console.log("Analysis completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("General error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Server error occurred",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
