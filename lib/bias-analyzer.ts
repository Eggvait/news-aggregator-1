export interface BiasAnalysisResult {
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
    impact: "low" | "medium" | "high"
  }>
  credibilityMetrics: {
    sourceReliability: number
    factChecking: number
    transparency: number
    authorExpertise: number
  }
  highlightedContent: string
}

export class BiasAnalyzer {
  // Political keywords and phrases
  private static readonly politicalKeywords = {
    bjp: [
      "modi",
      "bjp",
      "bharatiya janata party",
      "saffron",
      "hindutva",
      "nationalism",
      "development",
      "digital india",
      "make in india",
      "atmanirbhar",
      "vikas",
    ],
    congress: [
      "congress",
      "rahul gandhi",
      "sonia gandhi",
      "secular",
      "inclusive",
      "social justice",
      "minorities",
      "farmers",
      "employment",
    ],
    aap: ["aap", "arvind kejriwal", "aam aadmi", "corruption", "transparency", "education", "healthcare", "common man"],
  }

  // Emotional and loaded language indicators
  private static readonly emotionalWords = {
    positive: [
      "remarkable",
      "outstanding",
      "excellent",
      "breakthrough",
      "revolutionary",
      "historic",
      "unprecedented",
      "successful",
      "achievement",
      "progress",
      "boost",
      "enhance",
      "strengthen",
      "improve",
      "advance",
    ],
    negative: [
      "disaster",
      "failure",
      "crisis",
      "scandal",
      "controversy",
      "alarming",
      "devastating",
      "shocking",
      "outrageous",
      "condemn",
      "criticize",
      "attack",
      "slam",
      "blast",
      "question",
      "doubt",
    ],
    neutral: [
      "announced",
      "stated",
      "reported",
      "according",
      "officials",
      "government",
      "policy",
      "implementation",
      "measures",
      "initiative",
    ],
  }

  // Source bias patterns
  private static readonly sourceBias = {
    "Times of India": { lean: "center", reliability: 85 },
    "The Hindu": { lean: "left", reliability: 90 },
    "Hindustan Times": { lean: "center", reliability: 80 },
    NDTV: { lean: "left", reliability: 75 },
    "Indian Express": { lean: "center", reliability: 85 },
    "Zee News": { lean: "right", reliability: 65 },
    "Republic World": { lean: "right", reliability: 60 },
    News18: { lean: "center-right", reliability: 70 },
  }

  static analyzeArticle(title: string, content: string, source: string): BiasAnalysisResult {
    const fullText = `${title} ${content}`.toLowerCase()

    // Calculate bias scores
    const biasScore = this.calculateBiasScore(fullText, source)
    const sentimentAnalysis = this.analyzeSentiment(fullText)
    const keyPhrases = this.extractKeyPhrases(fullText)
    const biasIndicators = this.identifyBiasIndicators(title, content, source)
    const credibilityMetrics = this.calculateCredibilityMetrics(source, content)
    const highlightedContent = this.highlightBiasedContent(content)

    return {
      biasScore,
      sentimentAnalysis,
      keyPhrases,
      biasIndicators,
      credibilityMetrics,
      highlightedContent,
    }
  }

  private static calculateBiasScore(text: string, source: string) {
    let overallBias = 50 // Start neutral

    // Source-based adjustment
    const sourceInfo = this.sourceBias[source as keyof typeof this.sourceBias]
    if (sourceInfo) {
      switch (sourceInfo.lean) {
        case "left":
          overallBias = 25
          break
        case "right":
          overallBias = 75
          break
        case "center-right":
          overallBias = 60
          break
        case "center":
        default:
          overallBias = 50
          break
      }
    }

    // Political keyword analysis
    const bjpCount = this.countKeywords(text, this.politicalKeywords.bjp)
    const congressCount = this.countKeywords(text, this.politicalKeywords.congress)

    if (bjpCount > congressCount * 1.5) {
      overallBias += 15
    } else if (congressCount > bjpCount * 1.5) {
      overallBias -= 15
    }

    // Emotional language analysis
    const positiveCount = this.countKeywords(text, this.emotionalWords.positive)
    const negativeCount = this.countKeywords(text, this.emotionalWords.negative)
    const totalWords = text.split(" ").length
    const emotionalScore = Math.min(((positiveCount + negativeCount) / totalWords) * 1000, 100)

    // Factual content analysis (presence of numbers, dates, quotes, and factual indicators)
    const numberCount = (text.match(/\d+/g) || []).length // Count of numbers (statistics, dates, amounts)
    const quoteCount = (text.match(/["'"]/g) || []).length // Count of quotation marks (direct quotes)
    const factualPhraseCount = (
      text.match(
        /according to|officials said|data shows|study reveals|research indicates|statistics show|report states|survey found|analysis shows/gi,
      ) || []
    ).length // Factual attribution phrases

    const totalFactualIndicators = numberCount + quoteCount + factualPhraseCount
    const factualScore = Math.min((totalFactualIndicators / totalWords) * 500, 100)

    console.log(
      `Factual indicators: ${totalFactualIndicators} (numbers: ${numberCount}, quotes: ${quoteCount}, phrases: ${factualPhraseCount}) in ${totalWords} words = ${factualScore}% factual score`,
    )

    // Balance score (variety of sources and perspectives)
    const balanceIndicators = (text.match(/however|but|although|while|critics|supporters/gi) || []).length
    const balanceScore = Math.min((balanceIndicators / totalWords) * 1000, 100)

    return {
      overall: Math.max(0, Math.min(100, overallBias)),
      emotional: Math.round(emotionalScore),
      factual: Math.round(factualScore),
      balanced: Math.round(balanceScore),
    }
  }

  private static analyzeSentiment(text: string) {
    const positiveCount = this.countKeywords(text, this.emotionalWords.positive)
    const negativeCount = this.countKeywords(text, this.emotionalWords.negative)
    const neutralCount = this.countKeywords(text, this.emotionalWords.neutral)

    const total = positiveCount + negativeCount + neutralCount || 1

    return {
      positive: Math.round((positiveCount / total) * 100),
      negative: Math.round((negativeCount / total) * 100),
      neutral: Math.round((neutralCount / total) * 100),
    }
  }

  private static extractKeyPhrases(text: string) {
    const positive: string[] = []
    const negative: string[] = []
    const neutral: string[] = []

    // Find phrases containing emotional words
    this.emotionalWords.positive.forEach((word) => {
      if (text.includes(word)) {
        const phrase = this.extractPhrase(text, word)
        if (phrase) positive.push(phrase)
      }
    })

    this.emotionalWords.negative.forEach((word) => {
      if (text.includes(word)) {
        const phrase = this.extractPhrase(text, word)
        if (phrase) negative.push(phrase)
      }
    })

    this.emotionalWords.neutral.forEach((word) => {
      if (text.includes(word)) {
        const phrase = this.extractPhrase(text, word)
        if (phrase) neutral.push(phrase)
      }
    })

    return {
      positive: positive.slice(0, 5),
      negative: negative.slice(0, 5),
      neutral: neutral.slice(0, 5),
    }
  }

  private static extractPhrase(text: string, keyword: string): string | null {
    const index = text.indexOf(keyword)
    if (index === -1) return null

    const start = Math.max(0, index - 20)
    const end = Math.min(text.length, index + keyword.length + 20)
    const phrase = text.substring(start, end).trim()

    // Clean up the phrase
    const words = phrase.split(" ")
    if (words.length > 6) {
      return words.slice(0, 6).join(" ")
    }

    return phrase
  }

  private static identifyBiasIndicators(title: string, content: string, source: string) {
    const indicators = []
    const fullText = `${title} ${content}`.toLowerCase()

    // Language choice analysis
    const emotionalCount = this.countKeywords(fullText, [
      ...this.emotionalWords.positive,
      ...this.emotionalWords.negative,
    ])
    const totalWords = fullText.split(" ").length
    const emotionalRatio = emotionalCount / totalWords

    if (emotionalRatio > 0.05) {
      indicators.push({
        type: "Loaded Language",
        description: "Uses emotionally charged words that may influence reader perception",
        examples: this.findExamples(fullText, [...this.emotionalWords.positive, ...this.emotionalWords.negative]),
        impact: emotionalRatio > 0.1 ? ("high" as const) : ("medium" as const),
      })
    }

    // Source balance analysis
    const sourceCount = (content.match(/according to|officials said|sources|spokesperson/gi) || []).length

    if (sourceCount < 2 && content.length > 500) {
      indicators.push({
        type: "Limited Source Diversity",
        description: "Article relies on few sources, potentially limiting perspective diversity",
        examples: ["Single source dependency", "Limited viewpoints"],
        impact: "medium" as const,
      })
    }

    // Political framing analysis
    const bjpMentions = this.countKeywords(fullText, this.politicalKeywords.bjp)
    const congressMentions = this.countKeywords(fullText, this.politicalKeywords.congress)

    if (Math.abs(bjpMentions - congressMentions) > 3) {
      indicators.push({
        type: "Political Framing",
        description: "Disproportionate focus on one political perspective",
        examples:
          bjpMentions > congressMentions
            ? this.findExamples(fullText, this.politicalKeywords.bjp)
            : this.findExamples(fullText, this.politicalKeywords.congress),
        impact: "high" as const,
      })
    }

    // Factual content analysis
    const numberCount = (fullText.match(/\d+/g) || []).length
    const factualPhrases = (
      content.match(
        /according to|officials said|data shows|study reveals|research indicates|statistics show|report states|survey found|analysis shows/gi,
      ) || []
    ).length

    const factualRatio = (numberCount + factualPhrases) / totalWords

    if (factualRatio > 0.05) {
      indicators.push({
        type: "High Factual Content",
        description: "Article contains substantial factual elements including statistics, quotes, and data references",
        examples: [
          ...(numberCount > 5 ? [`${numberCount} numerical references`] : []),
          ...(factualPhrases > 2 ? [`${factualPhrases} factual attribution phrases`] : []),
        ],
        impact: "low" as const,
      })
    } else if (factualRatio < 0.02) {
      indicators.push({
        type: "Limited Factual Content",
        description: "Article has few factual indicators like statistics, quotes, or data references",
        examples: ["Few numerical references", "Limited direct quotes", "Minimal factual attribution"],
        impact: "medium" as const,
      })
    }

    return indicators
  }

  private static calculateCredibilityMetrics(source: string, content: string) {
    const sourceInfo = this.sourceBias[source as keyof typeof this.sourceBias]
    const baseReliability = sourceInfo?.reliability || 70

    // Fact-checking score based on verifiable information
    const factualElements = (content.match(/\d+|according to|data shows|study reveals/gi) || []).length
    const factChecking = Math.min(baseReliability + factualElements * 2, 100)

    // Transparency score based on source attribution
    const sourceAttributions = (content.match(/according to|sources|officials|spokesperson/gi) || []).length
    const transparency = Math.min(baseReliability + sourceAttributions * 3, 100)

    return {
      sourceReliability: baseReliability,
      factChecking: Math.round(factChecking),
      transparency: Math.round(transparency),
      authorExpertise: baseReliability - 5, // Slightly lower than source reliability
    }
  }

  private static highlightBiasedContent(content: string): string {
    let highlighted = content

    // Highlight emotional words
    this.emotionalWords.positive.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      highlighted = highlighted.replace(regex, `<mark class="bg-green-200">$&</mark>`)
    })

    this.emotionalWords.negative.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      highlighted = highlighted.replace(regex, `<mark class="bg-red-200">$&</mark>`)
    })

    // Highlight political keywords
    Object.values(this.politicalKeywords)
      .flat()
      .forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi")
        highlighted = highlighted.replace(regex, `<mark class="bg-yellow-200">$&</mark>`)
      })

    return highlighted
  }

  private static countKeywords(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      const matches = text.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private static findExamples(text: string, keywords: string[]): string[] {
    const examples: string[] = []

    keywords.forEach((keyword) => {
      if (text.includes(keyword) && examples.length < 3) {
        examples.push(keyword)
      }
    })

    return examples
  }
}
