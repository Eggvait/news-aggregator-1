import * as cheerio from "cheerio"

export interface ScrapedArticle {
  title: string
  content: string
  author: string
  publishedDate: string
  source: string
  url: string
}

export class NewsArticleScraper {
  private static readonly USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  ]

  // Comprehensive selectors with multiple fallbacks
  private static selectors = {
    // Times of India - Multiple selector strategies
    "timesofindia.indiatimes.com": {
      title: [
        "h1.HNMDR",
        "h1._3YYSt",
        "h1[data-articletitle]",
        ".story-headline h1",
        ".headline h1",
        "h1",
        ".title h1",
      ],
      content: [
        // Primary content containers
        ".ga-headlines",
        "._3YYSt .Normal",
        ".articlebodycontent",
        "div[data-module='ArticleContent']",
        ".story-content",
        ".article-content",
        ".content",
        // Fallback containers
        ".story_content",
        ".article_body",
        ".post-content",
        "main article",
        "article",
        ".main-content",
        // Generic containers
        "[class*='article']",
        "[class*='story']",
        "[class*='content']",
      ],
      author: [".byline .auth", "._2FrXw", ".story-byline .author", ".author", ".byline"],
      date: [".byline .time", "._3Mkg-", ".story-date .date", ".date", ".publish-time"],
    },

    // The Hindu - Multiple selector strategies
    "thehindu.com": {
      title: ["h1.title", "h1.story-headline", "h1.article-title", ".headline h1", "h1"],
      content: [
        ".articlebodycontent",
        ".paywall",
        ".story-content",
        "div[data-component='article-body']",
        ".content",
        ".article-content",
        ".story_content",
        ".post-content",
        "main article",
        "article",
        ".main-content",
        "[class*='article']",
        "[class*='story']",
        "[class*='content']",
      ],
      author: [".author-name", ".byline .author", ".story-byline .name", ".author"],
      date: [".publish-time", ".date-line .time", ".story-date .published", ".date"],
    },

    // Hindustan Times
    "hindustantimes.com": {
      title: ["h1.hdg1", "h1.story-headline", "h1.main-title", ".headline h1", "h1"],
      content: [
        ".detail",
        ".storyDetails",
        ".story-content",
        ".article-content",
        ".content",
        ".story_content",
        ".post-content",
        "main article",
        "article",
        ".main-content",
        "[class*='article']",
        "[class*='story']",
        "[class*='content']",
      ],
      author: [".author .name", ".byLine .author", ".story-author .name", ".author"],
      date: [".dateTime .time", ".published .date", ".story-date .time", ".date"],
    },

    // NDTV
    "ndtv.com": {
      title: ["h1.sp-cn", "h1.story-headline", "h1.main-story-headline", ".headline h1", "h1"],
      content: [
        ".sp-cn",
        ".content__slice",
        ".story-content",
        ".ins_storybody",
        ".story_content",
        ".article-content",
        ".content",
        ".post-content",
        "main article",
        "article",
        ".main-content",
        "[class*='article']",
        "[class*='story']",
        "[class*='content']",
      ],
      author: [".sp-desig .author", ".byline .name", ".story-author .author-name", ".author"],
      date: [".sp-date .time", ".published .date", ".story-date .publish-date", ".date"],
    },

    // Indian Express
    "indianexpress.com": {
      title: ["h1.native_story_title", "h1.story-headline", "h1.ie-first-headline", ".headline h1", "h1"],
      content: [
        ".ie-contentarea",
        ".story_details",
        ".story-content",
        ".full-details",
        ".article-content",
        ".content",
        ".story_content",
        ".post-content",
        "main article",
        "article",
        ".main-content",
        "[class*='article']",
        "[class*='story']",
        "[class*='content']",
      ],
      author: [".editor .name", ".byline .author", ".story-author .ie-author", ".author"],
      date: [".publish-details .date", ".date .time", ".story-date .ie-publish-date", ".date"],
    },
  }

  // Content quality filters
  private static readonly CONTENT_FILTERS = {
    excludePatterns: [
      /subscribe|subscription|newsletter/i,
      /advertisement|sponsored|promoted/i,
      /related articles?|more news|also read/i,
      /trending|popular|recommended/i,
      /comments?|share|tweet|facebook/i,
      /copyright|disclaimer|terms of service/i,
      /follow us|connect with us|join us/i,
      /download app|mobile app/i,
      /breaking news|live updates/i,
      /poll|quiz|survey/i,
      /photo gallery|video|watch/i,
      /tags?:|categories?:/i,
      /published on|updated on|last modified/i,
      /read more|view all|see all/i,
      /click here|register now|sign up/i,
    ],
    minParagraphLength: 25,
    minWordsInParagraph: 6,
    maxParagraphsToExtract: 100,
    minTotalWords: 50,
    maxTotalWords: 8000,
  }

  static async scrapeArticle(url: string): Promise<ScrapedArticle> {
    console.log(`Starting to scrape: ${url}`)

    try {
      const result = await this.attemptScraping(url)
      if (result && result.content.length >= 100) {
        console.log(`Successfully scraped ${result.content.length} characters`)
        return result
      }
    } catch (error) {
      console.log(`Main scraping failed: ${error}`)
    }

    try {
      console.log("Trying alternative scraping method...")
      const result = await this.alternativeScraping(url)
      if (result && result.content.length >= 50) {
        console.log(`Alternative scraping successful: ${result.content.length} characters`)
        return result
      }
    } catch (error) {
      console.log(`Alternative scraping failed: ${error}`)
    }

    console.log("Using intelligent fallback...")
    return this.createIntelligentFallback(url)
  }

  private static async attemptScraping(url: string): Promise<ScrapedArticle> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        DNT: "1",
        Connection: "keep-alive",
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`Received HTML: ${html.length} characters`)

    if (html.length < 1000) {
      throw new Error("Response too short, likely blocked or empty")
    }

    return this.parseHTML(html, url)
  }

  private static async alternativeScraping(url: string): Promise<ScrapedArticle> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      throw new Error(`Alternative HTTP ${response.status}`)
    }

    const html = await response.text()
    return this.parseHTML(html, url)
  }

  private static parseHTML(html: string, url: string): ScrapedArticle {
    const $ = cheerio.load(html)
    const domain = new URL(url).hostname
    const source = this.getSourceName(domain)

    console.log(`Parsing HTML for domain: ${domain}`)

    // First, remove unwanted elements
    this.removeUnwantedElements($)

    // Get selectors for this domain
    const domainSelectors = this.selectors[domain as keyof typeof this.selectors]

    // Extract information using multiple strategies
    let title = this.extractWithFallback($, domainSelectors?.title || ["h1"])
    let content = this.extractContentWithMultipleStrategies($, domain, domainSelectors?.content)
    let author = this.extractWithFallback($, domainSelectors?.author || [".author", ".byline"])
    const publishedDate = this.extractDate($, domainSelectors?.date || [".date", ".time"])

    console.log(`Extracted - Title: ${title?.length || 0} chars, Content: ${content?.length || 0} chars`)

    // Fallback extractions if primary failed
    if (!title || title.length < 10) {
      title = this.aggressiveTitleExtraction($)
      console.log(`Fallback title extraction: ${title?.length || 0} chars`)
    }

    if (!content || content.length < 100) {
      content = this.aggressiveContentExtraction($)
      console.log(`Fallback content extraction: ${content?.length || 0} chars`)
    }

    if (!author) {
      author = this.aggressiveAuthorExtraction($)
    }

    // Meta tag fallbacks
    if (content.length < 100) {
      const metaContent = this.extractFromMetaTags($)
      const jsonLdContent = this.extractFromJsonLd($)
      content = metaContent || jsonLdContent || content
      console.log(`Meta/JSON-LD extraction: ${content?.length || 0} chars`)
    }

    // Final cleaning and validation
    content = this.finalContentCleaning(content)

    return {
      title: this.cleanText(title || "Article Title Not Available"),
      content: this.cleanText(content || ""),
      author: this.cleanText(author || "Staff Reporter"),
      publishedDate: publishedDate || new Date().toISOString(),
      source,
      url,
    }
  }

  private static extractWithFallback($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      try {
        const text = $(selector).first().text().trim()
        if (text && text.length > 5) {
          console.log(`Found content with selector: ${selector}`)
          return text
        }
      } catch (e) {
        continue
      }
    }
    return ""
  }

  private static extractContentWithMultipleStrategies(
    $: cheerio.CheerioAPI,
    domain: string,
    contentSelectors?: string[],
  ): string {
    const strategies = [
      // Strategy 1: Domain-specific selectors
      () => this.extractContentWithSelectors($, contentSelectors || []),

      // Strategy 2: Look for main content containers
      () => this.extractContentFromMainContainers($),

      // Strategy 3: Find the largest text block
      () => this.extractLargestTextBlock($),

      // Strategy 4: Paragraph-based extraction
      () => this.extractAllValidParagraphs($),
    ]

    for (let i = 0; i < strategies.length; i++) {
      try {
        const content = strategies[i]()
        if (content && content.length >= 200) {
          console.log(`Content extraction successful with strategy ${i + 1}: ${content.length} chars`)
          return content
        } else if (content && content.length >= 50) {
          console.log(`Partial content with strategy ${i + 1}: ${content.length} chars`)
          // Continue to try other strategies, but keep this as backup
        }
      } catch (error) {
        console.log(`Strategy ${i + 1} failed:`, error)
        continue
      }
    }

    return ""
  }

  private static extractContentWithSelectors($: cheerio.CheerioAPI, selectors: string[]): string {
    const paragraphs: string[] = []

    for (const selector of selectors) {
      try {
        // Try to get the container first
        const container = $(selector).first()
        if (container.length > 0) {
          // Look for paragraphs within the container
          const containerParagraphs = container.find("p").toArray()

          if (containerParagraphs.length > 0) {
            containerParagraphs.forEach((p) => {
              const text = $(p).text().trim()
              if (this.isValidParagraph(text)) {
                paragraphs.push(text)
              }
            })
          } else {
            // If no paragraphs found, try to get the container text directly
            const containerText = container.text().trim()
            if (containerText && containerText.length > 100) {
              // Split by double newlines or periods followed by space
              const splitText = containerText.split(/\n\n+|\.[\s]+(?=[A-Z])/)
              splitText.forEach((segment) => {
                const cleanSegment = segment.trim()
                if (this.isValidParagraph(cleanSegment)) {
                  paragraphs.push(cleanSegment)
                }
              })
            }
          }

          if (paragraphs.length > 3) {
            console.log(`Found ${paragraphs.length} paragraphs with selector: ${selector}`)
            break
          }
        }
      } catch (e) {
        continue
      }
    }

    return paragraphs.join("\n\n")
  }

  private static extractContentFromMainContainers($: cheerio.CheerioAPI): string {
    const mainSelectors = [
      "main",
      "article",
      ".main-content",
      ".content-main",
      ".article-main",
      ".story-main",
      "#main-content",
      "#article-content",
      "#story-content",
      '[role="main"]',
      ".post-content",
      ".entry-content",
      ".article-body",
      ".story-body",
    ]

    for (const selector of mainSelectors) {
      try {
        const container = $(selector).first()
        if (container.length > 0) {
          const paragraphs: string[] = []

          // Get all paragraphs within this container
          container.find("p").each((_, p) => {
            const text = $(p).text().trim()
            if (this.isValidParagraph(text)) {
              paragraphs.push(text)
            }
          })

          if (paragraphs.length >= 3) {
            console.log(`Found ${paragraphs.length} paragraphs in main container: ${selector}`)
            return paragraphs.join("\n\n")
          }
        }
      } catch (e) {
        continue
      }
    }

    return ""
  }

  private static extractLargestTextBlock($: cheerio.CheerioAPI): string {
    let largestBlock = ""
    let largestSize = 0

    // Check various container types
    const containerSelectors = [
      "div",
      "section",
      "article",
      "main",
      '[class*="content"]',
      '[class*="article"]',
      '[class*="story"]',
      '[class*="text"]',
      '[class*="body"]',
    ]

    containerSelectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const $element = $(element)

        // Skip if it's likely navigation or ads
        const className = $element.attr("class") || ""
        const id = $element.attr("id") || ""

        if (this.isUnwantedContainer(className + " " + id)) {
          return
        }

        const text = $element.text().trim()
        if (text.length > largestSize && text.length > 200) {
          // Check if this looks like article content
          const paragraphCount = (text.match(/\.\s+[A-Z]/g) || []).length
          const wordCount = text.split(/\s+/).length

          if (paragraphCount >= 3 && wordCount >= 50) {
            largestSize = text.length
            largestBlock = text
          }
        }
      })
    })

    if (largestBlock) {
      console.log(`Found largest text block: ${largestSize} chars`)
      // Convert to paragraphs
      const paragraphs = largestBlock
        .split(/\n\n+|\.[\s]+(?=[A-Z])/)
        .map((p) => p.trim())
        .filter((p) => this.isValidParagraph(p))

      return paragraphs.join("\n\n")
    }

    return ""
  }

  private static extractAllValidParagraphs($: cheerio.CheerioAPI): string {
    const paragraphs: string[] = []

    $("p").each((_, p) => {
      const $p = $(p)

      // Skip paragraphs in unwanted containers
      const parents = $p.parents().toArray()
      const isInUnwantedContainer = parents.some((parent) => {
        const className = $(parent).attr("class") || ""
        const id = $(parent).attr("id") || ""
        return this.isUnwantedContainer(className + " " + id)
      })

      if (!isInUnwantedContainer) {
        const text = $p.text().trim()
        if (this.isValidParagraph(text)) {
          paragraphs.push(text)
        }
      }
    })

    if (paragraphs.length >= 3) {
      console.log(`Found ${paragraphs.length} valid paragraphs across page`)
      return paragraphs.slice(0, 50).join("\n\n") // Limit to first 50 paragraphs
    }

    return ""
  }

  private static isUnwantedContainer(classAndId: string): boolean {
    const unwantedPatterns = [
      /ad|ads|advertisement|sponsored/i,
      /nav|menu|header|footer|sidebar/i,
      /social|share|comment|related/i,
      /trending|popular|recommended/i,
      /newsletter|subscribe|signup/i,
      /tag|category|breadcrumb/i,
      /widget|promo|banner/i,
    ]

    return unwantedPatterns.some((pattern) => pattern.test(classAndId))
  }

  private static removeUnwantedElements($: cheerio.CheerioAPI) {
    const unwantedSelectors = [
      "script",
      "style",
      "noscript",
      "iframe",
      "embed",
      "object",
      ".ad",
      ".ads",
      ".advertisement",
      ".sponsored",
      ".promo",
      ".social",
      ".share",
      ".comments",
      ".comment-section",
      ".related",
      ".recommended",
      ".trending",
      ".popular",
      ".newsletter",
      ".subscription",
      ".subscribe",
      ".footer",
      ".header",
      ".nav",
      ".navigation",
      ".menu",
      ".sidebar",
      ".widget",
      ".breadcrumb",
      ".tags",
      ".tag-list",
      ".categories",
      ".poll",
      ".quiz",
      ".survey",
      ".vote",
      ".gallery",
      ".slideshow",
      ".carousel",
      ".video-player",
      ".audio-player",
      ".breaking-news",
      ".live-blog",
      ".live-updates",
      ".disclaimer",
      ".copyright",
      ".terms",
      ".mobile-app",
      ".download-app",
      '[class*="ad-"]',
      '[class*="ads-"]',
      '[id*="ad-"]',
      '[id*="ads-"]',
      '[class*="social-"]',
      '[class*="share-"]',
      '[class*="related-"]',
      '[class*="recommended-"]',
      '[class*="trending-"]',
      '[class*="popular-"]',
      '[class*="newsletter-"]',
      '[class*="subscribe-"]',
      '[class*="comment-"]',
      '[class*="comments-"]',
    ]

    unwantedSelectors.forEach((selector) => {
      $(selector).remove()
    })

    console.log("Removed unwanted elements")
  }

  private static isValidParagraph(text: string): boolean {
    if (!text || text.length < this.CONTENT_FILTERS.minParagraphLength) {
      return false
    }

    const words = text.split(/\s+/)
    if (words.length < this.CONTENT_FILTERS.minWordsInParagraph) {
      return false
    }

    // Check against exclude patterns
    for (const pattern of this.CONTENT_FILTERS.excludePatterns) {
      if (pattern.test(text)) {
        return false
      }
    }

    // Check for navigation-like content
    if (this.isNavigationText(text)) {
      return false
    }

    // Check for repetitive content
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()))
    if (uniqueWords.size / words.length < 0.4 && words.length > 10) {
      return false
    }

    return true
  }

  private static finalContentCleaning(content: string): string {
    if (!content) return ""

    const paragraphs = content.split(/\n\n+/)
    const cleanParagraphs: string[] = []
    let totalWords = 0

    for (const paragraph of paragraphs) {
      const cleaned = paragraph.trim()

      if (this.isValidParagraph(cleaned)) {
        cleanParagraphs.push(cleaned)
        totalWords += cleaned.split(/\s+/).length

        if (totalWords >= this.CONTENT_FILTERS.maxTotalWords) {
          break
        }
      }
    }

    const finalContent = cleanParagraphs.join("\n\n")
    const finalWords = finalContent.split(/\s+/).length

    console.log(`Final content: ${cleanParagraphs.length} paragraphs, ${finalWords} words`)

    return finalContent
  }

  private static aggressiveTitleExtraction($: cheerio.CheerioAPI): string {
    const titleSelectors = [
      "h1",
      "h2",
      ".headline",
      ".title",
      ".story-headline",
      ".article-title",
      ".main-title",
      "[class*='title']",
      "[class*='headline']",
      "[data-title]",
      "meta[property='og:title']",
      "meta[name='twitter:title']",
      "title",
    ]

    for (const selector of titleSelectors) {
      try {
        if (selector.startsWith("meta") || selector === "title") {
          const content = selector === "title" ? $(selector).text() : $(selector).attr("content")
          if (content && content.length > 10 && content.length < 200) {
            return content
          }
        } else {
          const text = $(selector).first().text().trim()
          if (text && text.length > 10 && text.length < 200) {
            return text
          }
        }
      } catch (e) {
        continue
      }
    }

    return ""
  }

  private static aggressiveContentExtraction($: cheerio.CheerioAPI): string {
    console.log("Starting aggressive content extraction...")

    // Try to find the main article content by looking for the longest meaningful text blocks
    const candidates: { element: cheerio.Element; text: string; score: number }[] = []

    $("div, section, article, main").each((_, element) => {
      const $element = $(element)
      const className = $element.attr("class") || ""
      const id = $element.attr("id") || ""

      // Skip unwanted containers
      if (this.isUnwantedContainer(className + " " + id)) {
        return
      }

      const text = $element.text().trim()
      if (text.length > 200) {
        // Score based on length, paragraph count, and content quality
        const paragraphCount = (text.match(/\.\s+[A-Z]/g) || []).length
        const wordCount = text.split(/\s+/).length
        const hasArticleKeywords = /said|according|reported|announced|stated/i.test(text)

        let score = wordCount * 0.1 + paragraphCount * 10
        if (hasArticleKeywords) score += 50
        if (className.includes("content") || className.includes("article") || className.includes("story")) score += 30

        candidates.push({ element, text, score })
      }
    })

    // Sort by score and take the best candidate
    candidates.sort((a, b) => b.score - a.score)

    if (candidates.length > 0) {
      const bestCandidate = candidates[0]
      console.log(`Best content candidate: ${bestCandidate.score} score, ${bestCandidate.text.length} chars`)

      // Extract paragraphs from the best candidate
      const $best = $(bestCandidate.element)
      const paragraphs: string[] = []

      $best.find("p").each((_, p) => {
        const text = $(p).text().trim()
        if (this.isValidParagraph(text)) {
          paragraphs.push(text)
        }
      })

      if (paragraphs.length >= 2) {
        return paragraphs.join("\n\n")
      } else {
        // If no paragraphs found, split the text intelligently
        const splitText = bestCandidate.text.split(/\n\n+|\.[\s]+(?=[A-Z])/)
        const validSegments = splitText.map((s) => s.trim()).filter((s) => this.isValidParagraph(s))

        return validSegments.join("\n\n")
      }
    }

    return ""
  }

  private static aggressiveAuthorExtraction($: cheerio.CheerioAPI): string {
    const authorSelectors = [
      ".author",
      ".byline",
      ".story-author",
      ".article-author",
      "[class*='author']",
      "[class*='byline']",
      "meta[name='author']",
      "meta[property='article:author']",
      "[rel='author']",
    ]

    for (const selector of authorSelectors) {
      try {
        if (selector.startsWith("meta")) {
          const content = $(selector).attr("content")
          if (content && content.length > 2 && content.length < 100) return content
        } else {
          const text = $(selector).first().text().trim()
          if (text && text.length > 2 && text.length < 100) return text
        }
      } catch (e) {
        continue
      }
    }

    return ""
  }

  private static extractFromMetaTags($: cheerio.CheerioAPI): string {
    const metaSelectors = [
      "meta[property='og:description']",
      "meta[name='description']",
      "meta[name='twitter:description']",
      "meta[property='article:content']",
    ]

    for (const selector of metaSelectors) {
      try {
        const content = $(selector).attr("content")
        if (content && content.length > 100 && content.length < 1000) {
          return content
        }
      } catch (e) {
        continue
      }
    }

    return ""
  }

  private static extractFromJsonLd($: cheerio.CheerioAPI): string {
    try {
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonText = $(el).html()
          if (jsonText) {
            const data = JSON.parse(jsonText)
            if (data.articleBody && data.articleBody.length > 100 && data.articleBody.length < 5000) {
              return data.articleBody
            }
            if (data.description && data.description.length > 100 && data.description.length < 1000) {
              return data.description
            }
          }
        } catch (e) {
          // Continue to next script tag
        }
      })
    } catch (e) {
      // JSON-LD extraction failed
    }

    return ""
  }

  private static extractDate($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      try {
        const dateText = $(selector).first().text().trim()
        if (dateText) {
          const date = this.parseDate(dateText)
          if (date) return date
        }
      } catch (e) {
        continue
      }
    }

    // Try meta tags for date
    const metaDateSelectors = [
      "meta[property='article:published_time']",
      "meta[property='article:modified_time']",
      "meta[name='publish-date']",
      "meta[name='date']",
    ]

    for (const sel of metaDateSelectors) {
      try {
        const content = $(sel).attr("content")
        if (content) {
          const date = this.parseDate(content)
          if (date) return date
        }
      } catch (e) {
        continue
      }
    }

    return new Date().toISOString()
  }

  private static isNavigationText(text: string): boolean {
    const navKeywords = [
      "subscribe",
      "login",
      "register",
      "menu",
      "navigation",
      "footer",
      "header",
      "advertisement",
      "cookie",
      "privacy policy",
      "terms of service",
      "follow us",
      "share",
      "tweet",
      "facebook",
      "instagram",
      "whatsapp",
      "telegram",
      "download app",
      "mobile app",
      "breaking news",
      "live updates",
      "trending now",
      "popular",
      "recommended",
      "related articles",
      "more news",
      "also read",
      "tags:",
      "categories:",
      "published on",
      "updated on",
      "read more",
      "view all",
      "see all",
      "click here",
      "register now",
      "sign up",
      "join us",
      "connect with us",
      "newsletter",
      "subscription",
      "comments",
      "comment",
      "reply",
      "like",
      "dislike",
      "vote",
      "poll",
    ]

    const lowerText = text.toLowerCase()
    return (
      navKeywords.some((keyword) => lowerText.includes(keyword)) ||
      text.length < 20 ||
      /^[A-Z\s]+$/.test(text) ||
      /^\d+$/.test(text.trim()) ||
      text.split(/\s+/).length < 5
    )
  }

  private static parseDate(dateText: string): string | null {
    try {
      const cleaned = dateText.replace(/^(Published|Updated|Last modified):\s*/i, "").trim()
      const date = new Date(cleaned)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    } catch (error) {
      // Date parsing failed
    }
    return null
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n\n")
      .replace(/[^\w\s\-.,!?;:()[\]"']/g, "")
      .trim()
  }

  private static createIntelligentFallback(url: string): ScrapedArticle {
    const domain = new URL(url).hostname
    const source = this.getSourceName(domain)

    const urlPath = new URL(url).pathname
    const urlParts = urlPath.split("/").filter((part) => part.length > 3)
    const potentialTopic = urlParts.join(" ").replace(/-/g, " ").replace(/_/g, " ").replace(/\d+/g, "").trim()

    const title = potentialTopic
      ? `${potentialTopic.charAt(0).toUpperCase() + potentialTopic.slice(1)} - ${source}`
      : `News Article from ${source}`

    const content = `This article from ${source} discusses current events and developments. While the full content could not be extracted due to technical limitations, our bias analysis system can still provide insights based on:

1. The source's known editorial stance and historical bias patterns
2. The article's URL structure and metadata  
3. The publication's typical coverage style

${source} is known for ${this.getSourceDescription(source)} coverage. Our analysis will evaluate potential bias indicators based on these established patterns.

Key topics likely covered: ${potentialTopic || "current affairs, politics, social issues"}

For the complete article content, please visit: ${url}

Our bias detection algorithms will analyze the available information to provide meaningful insights about potential political leanings, emotional language usage, and editorial perspectives.`

    return {
      title: this.cleanText(title),
      content: content,
      author: "Staff Reporter",
      publishedDate: new Date().toISOString(),
      source,
      url,
    }
  }

  private static getSourceDescription(source: string): string {
    const descriptions: Record<string, string> = {
      "Times of India": "mainstream centrist",
      "The Hindu": "left-leaning analytical",
      "Hindustan Times": "center-right business-focused",
      NDTV: "left-leaning investigative",
      "Indian Express": "centrist investigative",
      "Zee News": "right-leaning nationalist",
      "Republic World": "right-leaning sensationalist",
      "Business Standard": "business-focused centrist",
      "Deccan Herald": "regional centrist",
    }

    return descriptions[source] || "independent"
  }

  private static getSourceName(domain: string): string {
    const sourceMap: Record<string, string> = {
      "timesofindia.indiatimes.com": "Times of India",
      "thehindu.com": "The Hindu",
      "hindustantimes.com": "Hindustan Times",
      "ndtv.com": "NDTV",
      "indianexpress.com": "Indian Express",
      "zeenews.india.com": "Zee News",
      "republicworld.com": "Republic World",
      "news18.com": "News18",
      "business-standard.com": "Business Standard",
      "deccanherald.com": "Deccan Herald",
    }
    return sourceMap[domain] || domain
  }

  private static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)]
  }
}
