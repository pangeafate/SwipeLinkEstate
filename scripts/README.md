# Property Seeding Script

This script populates your Supabase database with mock properties using the images from `PropertyImages/` folder.

## What It Does

- **Creates 6 properties** (one per folder in PropertyImages/)
- **Uploads all images** to Supabase Storage bucket `property-images`
- **Sets realistic details** for each property (price, beds, baths, etc.)
- **Makes properties active** so they appear immediately in your app

## Setup Requirements

### 1. Supabase Setup
```bash
# 1. Run the database schema first
# Go to Supabase SQL Editor and run: lib/supabase/schema.sql

# 2. Create Storage bucket named: property-images
# Go to Supabase Storage → Create bucket → Name: "property-images" → Make it public

# 3. Get your Service Role Key (NOT the anon key)
# Go to Project Settings → API → Copy "service_role" key (secret)
```

### 2. Environment Variables
Create a `.env.local` file in the SwipeLinkEstate folder with:
```bash
SUPABASE_URL=https://caddiaxjmtysnvnevcdr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ Important**: Use the **service_role** key (not anon key) - needed for admin operations.

### 3. Run the Seeder
```bash
cd SwipeLinkEstate
node scripts/seed-properties.mjs
```

## What Properties Are Created

| Property | Type | Price | Beds/Baths | Area | Location |
|----------|------|-------|------------|------|----------|
| Apartment 1 | Apartment | $750,000 | 2/2 | 1,200 sqft | Ocean Drive |
| Apartment 2 | Apartment | $825,000 | 2/2 | 1,350 sqft | Collins Ave |
| Apartment 3 | Apartment | $950,000 | 3/2.5 | 1,600 sqft | Lincoln Road |
| House 1 | House | $2,100,000 | 4/3.5 | 2,800 sqft | Meridian Ave |
| House 2 | House | $2,450,000 | 4/4 | 3,200 sqft | Euclid Ave |
| House 3 | House | $2,800,000 | 5/4.5 | 3,800 sqft | Pennsylvania Ave |

## After Seeding

Your properties will be immediately visible in:
- **Agent Dashboard**: `/dashboard`
- **Properties Page**: `/properties` 
- **LinkCreator**: Available for creating shareable links

## Troubleshooting

**"Missing environment variables"**
- Make sure you have `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set

**"Upload failed"**
- Check that your Storage bucket `property-images` exists and is public
- Verify your service role key has storage permissions

**"Insert failed"** 
- Run the `schema.sql` file in Supabase SQL Editor first
- Check that the `properties` table exists with correct columns

**Images not showing**
- Verify `next.config.js` has the correct Supabase domains configured
- Check that bucket `property-images` is set to public access