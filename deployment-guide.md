# 🚀 Deploy Your News Aggregator

## Option 1: Vercel (Recommended - Free)

### Step 1: Push to GitHub
\`\`\`bash
git add .
git commit -m "Add automated scraping system"
git push origin main
\`\`\`

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET` (optional, any random string)

### Step 3: Automatic Cron Jobs
- Vercel will automatically run `/api/cron/scrape` every 30 minutes
- No additional setup needed!

## Option 2: Railway (Alternative)

### Deploy to Railway
1. Go to https://railway.app
2. Connect GitHub repository
3. Add same environment variables
4. Deploy automatically

### Set up Cron (External)
Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **UptimeRobot** (free monitoring + cron)

Set them to call: `https://your-app.vercel.app/api/cron/scrape`

## Option 3: Netlify + External Cron

### Deploy to Netlify
1. Go to https://netlify.com
2. Connect GitHub repository
3. Add environment variables
4. Deploy

### Set up External Cron
Use **GitHub Actions** (free):

Create `.github/workflows/cron.yml`:
\`\`\`yaml
name: Automated Scraping
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scraping
        run: |
          curl -X GET "https://your-app.netlify.app/api/cron/scrape"
\`\`\`

## 🎯 Recommended: Vercel

**Why Vercel?**
- ✅ Built-in cron jobs (no external services needed)
- ✅ Automatic deployments from GitHub
- ✅ Free tier with generous limits
- ✅ Perfect for Next.js apps
- ✅ Global CDN
- ✅ Zero configuration

**After deployment:**
1. Your site will be live at `https://your-app.vercel.app`
2. Scraping runs automatically every 30 minutes
3. Database fills up with categorized articles
4. Sports/Business sections populate automatically

**Monitor it:**
- Check Vercel Functions tab for cron job logs
- Visit your live site to see new articles
- Check Supabase dashboard for database growth
