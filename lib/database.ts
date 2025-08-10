import { supabase, type Article } from "./supabase"

export class DatabaseService {
  // Get articles from database
  static async getArticles(
    options: {
      category?: string
      limit?: number
      trending?: boolean
    } = {},
  ) {
    console.log("🔍 Fetching articles from database with options:", options)

    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "active")
      .order("published_date", { ascending: false })

    if (options.category) {
      query = query.eq("category", options.category)
    }

    if (options.trending) {
      query = query.eq("is_trending", true)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Error fetching articles:", error)
      throw error
    }

    console.log(`✅ Found ${data?.length || 0} articles in database`)
    return data as Article[]
  }

  // Get single article by URL
  static async getArticleByUrl(url: string) {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("original_url", url)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error fetching article by URL:", error)
      throw error
    }

    return data as Article | null
  }

  // Save new article to database
  static async createArticle(articleData: Partial<Article>) {
    console.log("💾 Saving new article to database:", articleData.title)

    const { data, error } = await supabase.from("articles").insert([articleData]).select().single()

    if (error) {
      console.error("❌ Error creating article:", error)
      throw error
    }

    console.log("✅ Article saved successfully:", data.id)
    return data as Article
  }

  // Increment view count
  static async incrementArticleViews(id: string) {
    const { error } = await supabase.rpc("increment_article_views", {
      article_uuid: id,
    })

    if (error) {
      console.error("❌ Error incrementing views:", error)
      throw error
    }
  }

  // Save analysis history
  static async saveAnalysisHistory(data: {
    article_id: string
    analysis_results: any
    ip_address?: string
    user_agent?: string
  }) {
    const { error } = await supabase.from("analysis_history").insert([data])

    if (error) {
      console.error("❌ Error saving analysis history:", error)
      throw error
    }
  }

  // Get scraping statistics
  static async getScrapingStats() {
    try {
      // Get total articles by category
      const { data: categoryStats } = await supabase.from("articles").select("category").eq("status", "active")

      // Get articles from last 24 hours
      const { data: recentArticles } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "active")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Get trending articles
      const { data: trendingArticles } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "active")
        .eq("is_trending", true)

      // Calculate category distribution
      const categoryDistribution =
        categoryStats?.reduce(
          (acc, article) => {
            acc[article.category] = (acc[article.category] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      return {
        totalArticles: categoryStats?.length || 0,
        recentArticles: recentArticles?.length || 0,
        trendingArticles: trendingArticles?.length || 0,
        categoryDistribution,
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error getting scraping stats:", error)
      throw error
    }
  }

  // Get articles by category with better filtering
  static async getArticlesByCategory(category: string, limit = 20) {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "active")
      .eq("category", category)
      .order("published_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`❌ Error fetching ${category} articles:`, error)
      throw error
    }

    return data as Article[]
  }
}
