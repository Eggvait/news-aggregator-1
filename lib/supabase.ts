import { createClient } from "@supabase/supabase-js"

// DEBUG: Check environment variables
console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Found" : "Missing")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Article {
  id: string
  title: string
  content: string | null
  excerpt: string | null
  author: string | null
  source_name: string | null
  original_url: string
  published_date: string | null
  bias_score: any
  sentiment_analysis: any
  key_phrases: any
  bias_indicators: any[]
  credibility_metrics: any
  political_lean: "left" | "center" | "right"
  party_affinity: "bjp" | "congress" | "aap" | "regional" | "neutral"
  category: "politics" | "business" | "sports" | "opinion" | "general"
  view_count: number
  is_trending: boolean
  read_time_minutes: number | null
  extraction_method: string
  status: "active" | "archived" | "flagged" | "deleted"
  created_at: string
  updated_at: string
}
