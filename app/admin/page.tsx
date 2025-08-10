"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Database, Clock, BarChart3, Globe, Zap } from "lucide-react"

interface ScrapingStats {
  totalArticles: number
  recentArticles: number
  trendingArticles: number
  categoryDistribution: Record<string, number>
  lastUpdated: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<ScrapingStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/scrape")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Dashboard</h1>
          <p className="text-gray-600">Automated article scraping is running continuously</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Zap className="w-5 h-5" />
                Auto-Scraping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Runs every 30 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
              <p className="text-xs text-gray-500">In database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Last 24 Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.recentArticles || 0}</div>
              <p className="text-xs text-gray-500">New articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Trending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.trendingArticles || 0}</div>
              <p className="text-xs text-gray-500">Hot articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        {stats?.categoryDistribution && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Content Distribution
                </CardTitle>
                <button
                  onClick={fetchStats}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.categoryDistribution).map(([category, count]) => {
                  const percentage = (count / stats.totalArticles) * 100
                  const getColor = (cat: string) => {
                    switch (cat) {
                      case "politics":
                        return "bg-red-500"
                      case "business":
                        return "bg-green-500"
                      case "sports":
                        return "bg-yellow-500"
                      case "opinion":
                        return "bg-purple-500"
                      default:
                        return "bg-gray-500"
                    }
                  }

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColor(category)}`}></div>
                          <Badge variant="outline" className="capitalize">
                            {category}
                          </Badge>
                          <span className="text-sm text-gray-600">{count} articles</span>
                        </div>
                        <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-medium">RSS Feed Monitoring</p>
                  <p className="text-sm text-gray-600">Checks 15+ news sources every 30 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                  2
                </div>
                <div>
                  <p className="font-medium">Content Extraction</p>
                  <p className="text-sm text-gray-600">Scrapes full article content and metadata</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                  3
                </div>
                <div>
                  <p className="font-medium">AI Analysis</p>
                  <p className="text-sm text-gray-600">Analyzes bias, sentiment, and categorizes content</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                  4
                </div>
                <div>
                  <p className="font-medium">Database Storage</p>
                  <p className="text-sm text-gray-600">Stores analyzed articles in Supabase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Automated Scraping</span>
                <Badge className="bg-green-100 text-green-800">Running</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Connection</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Content Analysis</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Update</span>
                <span className="text-sm text-gray-600">
                  {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "Never"}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">🚀 System is fully automated. No manual intervention required.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
