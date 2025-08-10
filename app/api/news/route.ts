import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20
    const trending = searchParams.get("trending") === "true"

    // Get articles from database
    const articles = await DatabaseService.getArticles({
      category: category || undefined,
      limit,
      trending,
    })

    // Transform to match existing frontend format
    const transformedArticles = articles.map((article) => ({
      id: article.id,
      title: article.title,
      source: article.source_name,
      bias: article.political_lean,
      party: article.party_affinity,
      excerpt: article.excerpt,
      timestamp: getRelativeTime(article.published_date),
      views: formatViews(article.view_count),
      trending: article.is_trending,
      url: article.original_url,
      publishedDate: article.published_date,
    }))

    return NextResponse.json(transformedArticles)
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown"

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else {
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }
}

function formatViews(count: number): string {
  if (count > 10000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
