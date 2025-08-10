import { NextResponse } from "next/server"
import { AutoScraper } from "@/lib/auto-scraper"
import { DatabaseService } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "start":
        // Start automated scraping (this would run continuously)
        AutoScraper.startAutomatedScraping()
        return NextResponse.json({ message: "Automated scraping started" })

      case "manual":
        // Manual scraping cycle
        await AutoScraper.performScrapingCycle()
        return NextResponse.json({ message: "Manual scraping completed" })

      case "status":
        // Get scraping status and stats
        const stats = await DatabaseService.getScrapingStats()
        return NextResponse.json(stats)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Scraping API error:", error)
    return NextResponse.json({ error: "Scraping operation failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get current scraping statistics
    const stats = await DatabaseService.getScrapingStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error getting scraping stats:", error)
    return NextResponse.json({ error: "Failed to get scraping stats" }, { status: 500 })
  }
}
