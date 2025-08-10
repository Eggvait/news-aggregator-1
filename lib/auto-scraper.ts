import { NewsArticleScraper } from "./scraper"
import { BiasAnalyzer } from "./bias-analyzer"
import { DatabaseService } from "./database"

export class AutoScraper {
  private static readonly MAX_CONCURRENT_JOBS = 3
  private static readonly RETRY_ATTEMPTS = 2

  // Enhanced RSS feeds with more sources
  private static readonly RSS_SOURCES = {
    // Politics & General
    "Times of India": {
      feeds: [
        "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "https://timesofindia.indiatimes.com/rssfeeds/1221656.cms", // India news
      ],
      category: "general",
    },
    "The Hindu": {
      feeds: [
        "https://www.thehindu.com/news/national/feeder/default.rss",
        "https://www.thehindu.com/news/cities/Delhi/feeder/default.rss",
      ],
      category: "general",
    },
    "Indian Express": {
      feeds: [
        "https://indianexpress.com/section/india/feed/",
        "https://indianexpress.com/section/political-pulse/feed/",
      ],
      category: "politics",
    },

    // Business
    "Business Standard": {
      feeds: [
        "https://www.business-standard.com/rss/home_page_top_stories.rss",
        "https://www.business-standard.com/rss/markets-106.rss",
        "https://www.business-standard.com/rss/economy-policy-102.rss",
      ],
      category: "business",
    },
    "Economic Times": {
      feeds: [
        "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
      ],
      category: "business",
    },
    Mint: {
      feeds: ["https://www.livemint.com/rss/news", "https://www.livemint.com/rss/markets"],
      category: "business",
    },

    // Sports
    "ESPN Cricinfo": {
      feeds: ["https://www.espncricinfo.com/rss/content/story/feeds/0.xml"],
      category: "sports",
    },
    Sportskeeda: {
      feeds: ["https://www.sportskeeda.com/rss/cricket", "https://www.sportskeeda.com/rss/football"],
      category: "sports",
    },
    "Times of India Sports": {
      feeds: ["https://timesofindia.indiatimes.com/rssfeeds/4719148.cms"],
      category: "sports",
    },
  }

  // Category detection keywords
  private static readonly CATEGORY_KEYWORDS = {
    politics: [
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
      "supreme court",
      "high court",
      "constitution",
      "law",
      "bill",
      "amendment",
    ],
    business: [
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
      "quarterly",
      "earnings",
      "shares",
      "dividend",
    ],
    sports: [
      "cricket",
      "football",
      "hockey",
      "tennis",
      "badminton",
      "olympics",
      "match",
      "tournament",
      "championship",
      "world cup",
      "ipl",
      "premier league",
      "fifa",
      "athlete",
      "player",
      "coach",
      "team",
      "score",
      "goal",
      "wicket",
      "run",
      "medal",
      "victory",
      "defeat",
      "sports",
      "game",
      "league",
      "season",
    ],
    opinion: [
      "opinion",
      "editorial",
      "analysis",
      "commentary",
      "perspective",
      "viewpoint",
      "column",
      "op-ed",
      "debate",
      "discussion",
      "argument",
      "critique",
      "review",
    ],
  }

  static async performScrapingCycle() {
    console.log("🔄 Starting automated scraping cycle...")

    const startTime = Date.now()
    let processedCount = 0
    let savedCount = 0
    let errorCount = 0

    try {
      // Get fresh articles from RSS feeds
      const rssArticles = await this.fetchFromAllRSSFeeds()
      console.log(`📰 Found ${rssArticles.length} articles from RSS feeds`)

      // Process articles in batches to avoid overwhelming servers
      const batches = this.createBatches(rssArticles, this.MAX_CONCURRENT_JOBS)

      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(async (article) => {
            processedCount++
            const result = await this.processArticle(article)
            if (result.saved) savedCount++
            if (result.error) errorCount++
            return result
          }),
        )

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const duration = Date.now() - startTime
      const summary = {
        processed: processedCount,
        saved: savedCount,
        errors: errorCount,
        duration: `${Math.round(duration / 1000)}s`,
        timestamp: new Date().toISOString(),
      }

      console.log("✅ Scraping cycle completed:", summary)
      return summary
    } catch (error) {
      console.error("❌ Error in scraping cycle:", error)
      throw error
    }
  }

  private static async fetchFromAllRSSFeeds() {
    const allArticles: any[] = []

    for (const [sourceName, sourceConfig] of Object.entries(this.RSS_SOURCES)) {
      for (const feedUrl of sourceConfig.feeds) {
        try {
          const articles = await this.parseRSSFeed(feedUrl, sourceName)

          // Add category hint from source configuration
          const categorizedArticles = articles.map((article) => ({
            ...article,
            suggestedCategory: sourceConfig.category,
          }))

          allArticles.push(...categorizedArticles)
          console.log(`📡 Fetched ${articles.length} articles from ${sourceName}`)

          // Delay between RSS requests to be respectful
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`❌ Failed to fetch from ${sourceName} (${feedUrl}):`, error)
        }
      }
    }

    return allArticles
  }

  private static async parseRSSFeed(rssUrl: string, source: string) {
    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BiasTribot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`)
    }

    const xmlText = await response.text()

    // Simple XML parsing for RSS
    const articles: any[] = []
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []

    itemMatches.forEach((itemXml, index) => {
      if (index >= 10) return // Limit to 10 articles per feed

      const title = this.extractXMLContent(itemXml, "title")
      const link = this.extractXMLContent(itemXml, "link")
      const description = this.extractXMLContent(itemXml, "description")
      const pubDate = this.extractXMLContent(itemXml, "pubDate")

      if (title && link) {
        articles.push({
          id: `rss-${Date.now()}-${index}`,
          title: this.cleanTitle(title),
          source,
          excerpt: this.cleanDescription(description) || `${title.substring(0, 100)}...`,
          url: link,
          publishedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        })
      }
    })

    return articles
  }

  private static extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
    const match = xml.match(regex)
    return match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : ""
  }

  private static async processArticle(article: any) {
    try {
      // Check if article already exists
      const existingArticle = await DatabaseService.getArticleByUrl(article.url)
      if (existingArticle) {
        return { saved: false, error: false, reason: "duplicate" }
      }

      console.log(`🔍 Processing new article: ${article.title}`)

      // Scrape full content
      const scrapedArticle = await NewsArticleScraper.scrapeArticle(article.url)

      if (!scrapedArticle.content || scrapedArticle.content.length < 100) {
        return { saved: false, error: false, reason: "insufficient_content" }
      }

      // Analyze for bias
      const biasAnalysis = BiasAnalyzer.analyzeArticle(
        scrapedArticle.title,
        scrapedArticle.content,
        scrapedArticle.source,
      )

      // Determine category
      const category = this.categorizeArticle(scrapedArticle.title, scrapedArticle.content, article.suggestedCategory)

      // Calculate metrics
      const wordCount = scrapedArticle.content.split(" ").length
      const readTimeMinutes = Math.ceil(wordCount / 200)

      // Save to database
      await DatabaseService.createArticle({
        title: scrapedArticle.title,
        content: scrapedArticle.content,
        excerpt: this.generateExcerpt(scrapedArticle.content),
        author: scrapedArticle.author,
        source_name: scrapedArticle.source,
        original_url: article.url,
        published_date: scrapedArticle.publishedDate,
        bias_score: biasAnalysis.biasScore,
        sentiment_analysis: biasAnalysis.sentimentAnalysis,
        key_phrases: biasAnalysis.keyPhrases,
        bias_indicators: biasAnalysis.biasIndicators,
        credibility_metrics: biasAnalysis.credibilityMetrics,
        political_lean:
          biasAnalysis.biasScore.overall < 40 ? "left" : biasAnalysis.biasScore.overall > 60 ? "right" : "center",
        party_affinity: this.detectPartyAffinity(scrapedArticle.title, scrapedArticle.content),
        category,
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        extraction_method: scrapedArticle.content.includes("technical limitations") ? "fallback" : "full",
        content_quality_score: Math.min(scrapedArticle.content.length / 100, 100),
        is_trending: this.calculateTrendingStatus(article, biasAnalysis),
      })

      console.log(`✅ Successfully processed: ${scrapedArticle.title} [${category}]`)
      return { saved: true, error: false, category }
    } catch (error) {
      console.error(`❌ Failed to process article: ${article.title}`, error)
      return { saved: false, error: true, reason: error instanceof Error ? error.message : "unknown" }
    }
  }

  private static categorizeArticle(title: string, content: string, suggestedCategory?: string): string {
    const text = `${title} ${content}`.toLowerCase()
    const scores: Record<string, number> = {}

    // Calculate keyword scores for each category
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      scores[category] = keywords.reduce((score, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi")
        const matches = text.match(regex)
        return score + (matches ? matches.length : 0)
      }, 0)
    }

    // Boost suggested category score
    if (suggestedCategory && scores[suggestedCategory] !== undefined) {
      scores[suggestedCategory] += 5
    }

    // Find category with highest score
    const bestCategory = Object.entries(scores).reduce(
      (best, [category, score]) => (score > best.score ? { category, score } : best),
      { category: "general", score: 0 },
    )

    // Return best category if score is significant, otherwise general
    return bestCategory.score >= 3 ? bestCategory.category : "general"
  }

  private static detectPartyAffinity(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()

    const partyKeywords = {
      bjp: ["modi", "bjp", "bharatiya janata", "saffron", "hindutva", "nationalism"],
      congress: ["congress", "rahul gandhi", "sonia gandhi", "secular", "inclusive"],
      aap: ["aap", "arvind kejriwal", "aam aadmi", "corruption", "transparency"],
    }

    const scores: Record<string, number> = {}

    for (const [party, keywords] of Object.entries(partyKeywords)) {
      scores[party] = keywords.reduce((score, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi")
        const matches = text.match(regex)
        return score + (matches ? matches.length : 0)
      }, 0)
    }

    const bestParty = Object.entries(scores).reduce(
      (best, [party, score]) => (score > best.score ? { party, score } : best),
      { party: "neutral", score: 0 },
    )

    return bestParty.score >= 2 ? bestParty.party : "neutral"
  }

  private static calculateTrendingStatus(article: any, biasAnalysis: any): boolean {
    // Simple trending calculation based on recency and engagement potential
    const hoursOld = (Date.now() - new Date(article.publishedDate).getTime()) / (1000 * 60 * 60)
    const isRecent = hoursOld < 6
    const hasHighEngagement =
      biasAnalysis.biasScore.emotional > 40 ||
      biasAnalysis.biasScore.overall < 30 ||
      biasAnalysis.biasScore.overall > 70

    return isRecent && hasHighEngagement && Math.random() > 0.7
  }

  private static generateExcerpt(content: string): string {
    const cleaned = content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
    return cleaned.length > 200 ? `${cleaned.substring(0, 200)}...` : cleaned
  }

  private static cleanTitle(title: string): string {
    return title
      .replace(/\s*-\s*(Times of India|The Hindu|NDTV|Indian Express).*$/i, "")
      .replace(/\s*\|\s*(Times of India|The Hindu|NDTV|Indian Express).*$/i, "")
      .replace(/^\s*\[.*?\]\s*/, "")
      .trim()
  }

  private static cleanDescription(description: string): string {
    if (!description) return ""

    const cleaned = description
      .replace(/<[^>]*>/g, "")
      .replace(/&[^;]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    return cleaned.length > 150 ? `${cleaned.substring(0, 150)}...` : cleaned
  }

  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }
}
