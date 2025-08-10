import { NextResponse } from "next/server"
import { AutoScraper } from "@/lib/auto-scraper"

// Vercel Cron Job - runs every 30 minutes automatically
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request (optional security)
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🕐 Automated cron job started:", new Date().toISOString())

    // Run the scraping cycle
    const results = await AutoScraper.performScrapingCycle()

    console.log("✅ Cron job completed successfully")

    return NextResponse.json({
      success: true,
      message: "Automated scraping completed",
      results,
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
