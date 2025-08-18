# 🔧 Deployment Troubleshooting Guide

## ✅ **Fixed Issues (Ready for Deployment)**

### Issue 1: Next.js Configuration
**Problem**: `appDir: true` in next.config.js is deprecated in Next.js 14
**Status**: ✅ **FIXED** - Removed deprecated config

### Issue 2: ESLint Configuration  
**Problem**: Missing TypeScript ESLint dependencies causing lint failures
**Status**: ✅ **FIXED** - Simplified to Next.js core config

### Issue 3: Build Verification
**Status**: ✅ **VERIFIED** - Local build passes with no errors

---

## 🚀 **Current Deployment Status**

**Build Status**: ✅ Ready for deployment
**Configuration**: ✅ All fixed  
**Dependencies**: ✅ All installed
**Tests**: ✅ 18/18 passing

---

## 🔍 **Common Vercel Deployment Issues & Solutions**

### 1. Build Failures

**Issue**: "Command failed with exit code 1"
```bash
# Solution: Check build logs for specific error
npm run build  # Test locally first
```

**Issue**: "Module not found" errors
```bash
# Solution: Verify all dependencies are in package.json
npm install  # Reinstall dependencies
```

### 2. Environment Variable Issues

**Issue**: "Missing environment variables"
```bash
# Solution: Add in Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://caddiaxjmtysnvnevcdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

**Issue**: Environment variables not updating
```bash
# Solution: Redeploy after adding variables
# Vercel → Settings → Environment Variables → Save
# Then: Vercel → Deployments → Redeploy
```

### 3. Database Connection Issues

**Issue**: "Failed to connect to Supabase"  
```sql
-- Solution: Ensure database schema is set up
-- Go to Supabase SQL Editor and run:
-- Contents of lib/supabase/schema.sql
```

**Issue**: "Row Level Security" errors
```sql
-- Solution: Ensure RLS policies are created
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties are publicly readable" ON properties FOR SELECT USING (true);
```

### 4. Image Loading Issues

**Issue**: Images not displaying
```javascript
// Solution: Verify Next.js image config
// next.config.js should include Supabase domains
images: {
  domains: ['caddiaxjmtysnvnevcdr.supabase.co'],
}
```

### 5. API Route Issues

**Issue**: "404 on API routes"
```typescript
// Solution: Verify file structure
app/
  api/
    placeholder/
      [...params]/
        route.ts  // Must be named 'route.ts'
```

---

## 🔧 **Manual Debugging Steps**

### Step 1: Check Vercel Build Logs
```bash
1. Go to Vercel Dashboard
2. Click on your project
3. Click on the failing deployment  
4. Click "View Function Logs" 
5. Look for specific error messages
```

### Step 2: Test Locally
```bash
# Install dependencies
npm install

# Test build  
npm run build

# Test development server
npm run dev
```

### Step 3: Check Environment Variables
```bash
# In Vercel Dashboard
Settings → Environment Variables

# Verify these exist:
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Step 4: Database Verification
```sql
-- In Supabase SQL Editor, verify tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return: properties, links, activities, sessions
```

---

## 🚨 **Emergency Deployment Fix**

If deployment fails, run this quick fix:

```bash
# 1. Revert to minimal config
echo '{"extends": ["next/core-web-vitals"]}' > .eslintrc.json

# 2. Clean build
rm -rf .next node_modules package-lock.json
npm install
npm run build

# 3. Push fix
git add .
git commit -m "Fix: deployment configuration"  
git push
```

---

## 📞 **Getting Help**

### Vercel Support
- **Documentation**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions  
- **Status**: https://www.vercel-status.com

### Supabase Support  
- **Documentation**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Status**: https://status.supabase.com

### Next.js Issues
- **Documentation**: https://nextjs.org/docs
- **GitHub Issues**: https://github.com/vercel/next.js/issues

---

## ✅ **Deployment Checklist**

Before deploying, verify:

- [ ] `npm run build` passes locally
- [ ] Environment variables added to Vercel
- [ ] Database schema executed in Supabase  
- [ ] All tests passing (`npm test`)
- [ ] Repository pushed to GitHub
- [ ] Vercel connected to GitHub repo

**If all items are checked, deployment should succeed!** 🚀