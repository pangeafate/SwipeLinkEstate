import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Use the existing environment variables (anon key with public policies)
const SUPABASE_URL = "https://caddiaxjmtysnvnevcdr.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const BUCKET = 'property-images'
const IMAGES_ROOT = '/Users/sergeypodolskiy/CODEBASE/25 08 18 Tinder For Real Estate v3/PropertyImages'
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

// Property details based on folder names
const PROPERTY_DETAILS = {
  'Apartment 1': {
    address: '123 Ocean Drive, Miami Beach, FL 33139',
    price: 750000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1200,
    description: 'Stunning oceanfront apartment with modern finishes and breathtaking views of the Atlantic Ocean. Features an open-concept living space, gourmet kitchen, and private balcony perfect for watching sunrises.',
    features: ['Ocean View', 'Balcony', 'Modern Kitchen', 'In-Unit Laundry', 'Concierge']
  },
  'Apartment 2': {
    address: '456 Collins Avenue, South Beach, FL 33139',
    price: 825000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1350,
    description: 'Luxurious South Beach apartment in a premium building with resort-style amenities. Contemporary design meets comfort with high-end appliances and floor-to-ceiling windows.',
    features: ['City View', 'Pool', 'Gym', 'Valet Parking', 'Rooftop Deck']
  },
  'Apartment 3': {
    address: '789 Lincoln Road, Miami Beach, FL 33139',
    price: 950000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 1600,
    description: 'Sophisticated apartment on iconic Lincoln Road, steps from world-class shopping and dining. Spacious layout with premium finishes and abundant natural light throughout.',
    features: ['Shopping District', 'Walk to Beach', 'High Ceilings', 'Storage Unit', 'Doorman']
  },
  'House 1': {
    address: '321 Meridian Avenue, Miami Beach, FL 33139',
    price: 2100000,
    bedrooms: 4,
    bathrooms: 3.5,
    area_sqft: 2800,
    description: 'Magnificent single-family home in prestigious Miami Beach neighborhood. Beautifully renovated with chef\'s kitchen, spacious bedrooms, and lush tropical landscaping with private pool.',
    features: ['Private Pool', 'Garden', 'Garage', 'Chef Kitchen', 'Master Suite']
  },
  'House 2': {
    address: '654 Euclid Avenue, Miami Beach, FL 33139',
    price: 2450000,
    bedrooms: 4,
    bathrooms: 4.0,
    area_sqft: 3200,
    description: 'Contemporary architectural masterpiece featuring clean lines, open spaces, and seamless indoor-outdoor living. Premium location with easy access to beaches and entertainment.',
    features: ['Modern Design', 'Open Floor Plan', 'Smart Home', 'Wine Cellar', 'Guest Suite']
  },
  'House 3': {
    address: '987 Pennsylvania Avenue, Miami Beach, FL 33139',
    price: 2800000,
    bedrooms: 5,
    bathrooms: 4.5,
    area_sqft: 3800,
    description: 'Exceptional luxury estate offering the ultimate in Miami Beach living. Expansive layout with multiple entertaining areas, gourmet kitchen, and resort-style backyard oasis.',
    features: ['Luxury Estate', 'Pool & Spa', 'Entertainment Room', 'Office Space', 'Cabana']
  }
}

async function uploadImageToSupabase(propertyId, imagePath, imageIndex) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const fileName = `${propertyId}/${Date.now()}-${imageIndex}-${path.basename(imagePath)}`
    
    console.log(`   📤 Uploading: ${path.basename(imagePath)}`)
    
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, imageBuffer, { 
        upsert: true,
        contentType: getContentType(imagePath)
      })
    
    if (error) throw new Error(`Upload failed: ${error.message}`)
    
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path)
    
    return publicUrlData.publicUrl
  } catch (error) {
    throw new Error(`Failed to upload ${imagePath}: ${error.message}`)
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }
  return types[ext] || 'image/jpeg'
}

async function seedProperty(folderName) {
  console.log(`\n🏠 Processing: ${folderName}`)
  
  const folderPath = path.join(IMAGES_ROOT, folderName)
  const propertyDetails = PROPERTY_DETAILS[folderName]
  
  if (!propertyDetails) {
    console.log(`   ⚠️  No details found for ${folderName}, skipping`)
    return
  }
  
  // Get all image files from folder
  const files = fs.readdirSync(folderPath)
  const imageFiles = files
    .filter(file => VALID_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map(file => path.join(folderPath, file))
  
  if (imageFiles.length === 0) {
    console.log(`   ⚠️  No valid images found in ${folderName}`)
    return
  }
  
  console.log(`   📁 Found ${imageFiles.length} images`)
  
  try {
    // 1. Insert property record to get UUID (using anon key with public policy)
    console.log(`   🔧 Creating property record...`)
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert({
        address: propertyDetails.address,
        price: propertyDetails.price,
        bedrooms: propertyDetails.bedrooms,
        bathrooms: propertyDetails.bathrooms,
        area_sqft: propertyDetails.area_sqft,
        description: propertyDetails.description,
        features: propertyDetails.features,
        status: 'active'
      })
      .select()
      .single()
    
    if (insertError) throw new Error(`Failed to insert property: ${insertError.message}`)
    
    console.log(`   ✅ Property created with ID: ${property.id}`)
    
    // 2. Upload all images and collect URLs (if storage bucket exists)
    let imageUrls = []
    try {
      console.log(`   📤 Uploading ${imageFiles.length} images...`)
      
      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const url = await uploadImageToSupabase(property.id, imageFiles[i], i)
          imageUrls.push(url)
        } catch (uploadError) {
          console.log(`   ⚠️  Failed to upload ${path.basename(imageFiles[i])}: ${uploadError.message}`)
          // Continue with other images
        }
      }
    } catch (storageError) {
      console.log(`   ⚠️  Storage operations failed: ${storageError.message}`)
      console.log(`   📝 Property created without images - you can add them later`)
    }
    
    // 3. Update property with image URLs (if any were uploaded)
    if (imageUrls.length > 0) {
      console.log(`   🖼️  Updating property with ${imageUrls.length} image URLs...`)
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          cover_image: imageUrls[0], // First image as cover
          images: imageUrls         // All images as array
        })
        .eq('id', property.id)
      
      if (updateError) {
        console.log(`   ⚠️  Failed to update property images: ${updateError.message}`)
      }
    }
    
    console.log(`   ✅ Successfully seeded ${folderName}`)
    console.log(`      💰 Price: $${propertyDetails.price.toLocaleString()}`)
    console.log(`      🛏️  ${propertyDetails.bedrooms} bed, ${propertyDetails.bathrooms} bath`)
    console.log(`      📐 ${propertyDetails.area_sqft} sqft`)
    console.log(`      🖼️  ${imageUrls.length} images uploaded`)
    
  } catch (error) {
    console.error(`   ❌ Failed to seed ${folderName}: ${error.message}`)
    throw error
  }
}

async function main() {
  console.log('🚀 Starting property seeding process...\n')
  
  // Check if images folder exists
  if (!fs.existsSync(IMAGES_ROOT)) {
    console.error(`❌ Images folder not found: ${IMAGES_ROOT}`)
    process.exit(1)
  }
  
  // Test database connection
  console.log('🔍 Testing database connection...')
  try {
    const { data, error } = await supabase.from('properties').select('count').limit(1)
    if (error) throw error
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`)
    console.error('🔧 Please run setup-database.sql in Supabase SQL Editor first')
    process.exit(1)
  }
  
  // Get all property folders
  const folders = fs.readdirSync(IMAGES_ROOT)
    .filter(item => fs.statSync(path.join(IMAGES_ROOT, item)).isDirectory())
    .sort()
  
  console.log(`📁 Found ${folders.length} property folders:`)
  folders.forEach(folder => console.log(`   • ${folder}`))
  
  // Process each property folder
  let successCount = 0
  let failureCount = 0
  
  for (const folder of folders) {
    try {
      await seedProperty(folder)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to process ${folder}:`, error.message)
      failureCount++
    }
  }
  
  console.log('\n🎉 Seeding completed!')
  console.log(`✅ Successfully seeded: ${successCount} properties`)
  console.log(`❌ Failed: ${failureCount} properties`)
  
  if (successCount > 0) {
    console.log('\n💡 Your properties are now available in:')
    console.log('   • Agent Dashboard: http://localhost:3000/dashboard')
    console.log('   • Properties Page: http://localhost:3000/properties')
    console.log('   • LinkCreator: Create shareable links')
    console.log('\n🔄 Refresh your dashboard to see the new properties!')
  }
}

// Run the seeding process
main().catch(error => {
  console.error('\n💥 Seeding process failed:', error.message)
  process.exit(1)
})