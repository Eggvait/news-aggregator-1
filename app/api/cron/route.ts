import { NextResponse } from "next/server"
import { AutoScraper } from "@/lib/auto-scraper"

// This endpoint can be called by external cron services like Vercel Cron
export async function GET() {
  try {
    console.log("🕐 Cron job triggered - starting scraping cycle")

    // Run a single scraping cycle
    await AutoScraper.performScrapingCycle()

    return NextResponse.json({
      success: true,
      message: "Scraping cycle completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Cron job failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
