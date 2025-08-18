# 🚀 Live Deployment Guide

## Step 1: Set up Supabase Database

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Open your project: https://supabase.com/dashboard/project/caddiaxjmtysnvnevcdr

2. **Execute Database Schema**
   - Go to **SQL Editor** tab
   - Copy and paste the complete contents of `lib/supabase/schema.sql`
   - Click **RUN** to create all tables and sample data

3. **Verify Setup**
   - Go to **Table Editor** tab
   - You should see: `properties`, `links`, `activities`, `sessions` tables
   - The `properties` table should have 5 sample properties

## Step 2: Deploy to Vercel

### Option A: One-Click Deploy (Fastest)

1. **Click the Deploy Button**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pangeafate/SwipeLinkEstate&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

2. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://caddiaxjmtysnvnevcdr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE
   ```

3. **Deploy**
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://swipe-link-estate-xxx.vercel.app`

### Option B: Manual Setup

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub

2. **Import Project**
   - Click **"New Project"**
   - Select **"Import Git Repository"**
   - Choose: `pangeafate/SwipeLinkEstate`

3. **Configure**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://caddiaxjmtysnvnevcdr.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE
     ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~2-3 minutes)

## Step 3: Test the Live Site

Once deployed, you can test:

### ✅ **Working Features:**
- **Homepage** - Landing page with navigation
- **Property Cards** - Sample properties display
- **Image Placeholders** - Dynamic SVG placeholders
- **Responsive Design** - Mobile and desktop layouts
- **API Routes** - Placeholder image API

### 🚧 **Coming Soon:**
- Agent Dashboard
- Property Swiping Interface  
- Link Generation
- Real-time Analytics

## 🔧 Troubleshooting

### Build Errors
```bash
# If you see "Module not found" errors
npm install

# If tests fail in CI
npm test -- --passWithNoTests
```

### Environment Variable Issues
- Make sure both variables are set in Vercel dashboard
- Variables should start with `NEXT_PUBLIC_` for client-side access
- No quotes needed around values in Vercel UI

### Database Connection Issues
- Verify Supabase URL format: `https://xxx.supabase.co`
- Check API key is the "anon/public" key (not service key)
- Ensure RLS policies are set up correctly

## 📱 Alternative Deployment Options

### Netlify
```bash
# Build command
npm run build && npm run export

# Publish directory  
out
```

### Railway
- Connect GitHub repo
- Add environment variables
- Deploy automatically

### Heroku
```json
// Add to package.json
{
  "scripts": {
    "heroku-postbuild": "npm run build"
  }
}
```

## 🔍 Monitoring

Once live, monitor:
- **Performance**: Core Web Vitals in Vercel Analytics
- **Errors**: Runtime errors in Vercel Functions tab
- **Database**: Query performance in Supabase Dashboard
- **Usage**: API calls and storage in Supabase Usage tab

## 🚀 Next Steps After Deployment

1. **Share the URL** with stakeholders for testing
2. **Add custom domain** in Vercel settings
3. **Set up monitoring** and error tracking
4. **Continue development** with additional features
5. **Add real property images** by uploading to Supabase Storage

---

**Your live SwipeLink Estate platform will be ready in ~5 minutes!** 🎉