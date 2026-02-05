import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create sample users
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {},
    create: {
      email: 'owner1@example.com',
      phone: '+8801711234567',
      password: 'hashed_password_123',
      firstName: 'Rahim',
      lastName: 'Uddin',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  })

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      email: 'owner2@example.com',
      phone: '+8801821234567',
      password: 'hashed_password_456',
      firstName: 'Fatima',
      lastName: 'Ahmed',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  })

  // Sample property images (using placeholder images from a free service)
  const placeholderImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
  ]

  // Sample properties for Dhanmondi
  const properties = [
    {
      title: 'Spacious 2BHK Flat in Dhanmondi',
      description: 'Modern flat with 24/7 security, parking, and generator backup. Walking distance to shopping malls and educational institutions.',
      propertyType: 'FAMILY',
      address: 'House 12, Road 5, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      rentAmount: 35000,
      furnished: 'FULL',
      amenities: ['wifi', 'parking', 'generator', 'gas', 'water', 'security'],
      coverImage: placeholderImages[0],
      images: [placeholderImages[0], placeholderImages[1], placeholderImages[2]],
      ownerId: owner1.id,
      status: 'ACTIVE',
      isVerified: true,
    },
    {
      title: 'Bachelor Room Near Dhaka University',
      description: 'Clean and safe bachelor accommodation with meals included. Perfect for students. Well-ventilated and furnished.',
      propertyType: 'BACHELOR',
      address: 'Near Dhaka University Campus, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 300,
      rentAmount: 8000,
      furnished: 'FULL',
      amenities: ['wifi', 'meals', 'laundry', 'water'],
      coverImage: placeholderImages[1],
      images: [placeholderImages[1], placeholderImages[3]],
      ownerId: owner1.id,
      status: 'ACTIVE',
      isVerified: true,
    },
    {
      title: 'Premium Family Flat - Dhanmondi',
      description: '3BHK flat with premium amenities. Includes generator, water tank, and 24/7 security. Suitable for families.',
      propertyType: 'FAMILY',
      address: 'Road 10A, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1500,
      rentAmount: 50000,
      furnished: 'FULL',
      amenities: ['wifi', 'parking', 'generator', 'gas', 'water', 'security', 'lift'],
      coverImage: placeholderImages[2],
      images: [placeholderImages[2], placeholderImages[4], placeholderImages[5]],
      ownerId: owner2.id,
      status: 'ACTIVE',
      isVerified: true,
    },
  ]

  // Sample properties for Gulshan
  const gulshanProperties = [
    {
      title: 'Girls Hostel in Gulshan',
      description: 'Secure girls hostel with 24/7 security CCTV. Near shopping centers and restaurants. Meals included.',
      propertyType: 'HOSTEL',
      address: 'Gulshan-2, Dhaka',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 400,
      rentAmount: 12000,
      furnished: 'FULL',
      amenities: ['wifi', 'security', 'meals', 'laundry', 'common-room'],
      coverImage: placeholderImages[3],
      images: [placeholderImages[3], placeholderImages[4]],
      ownerId: owner2.id,
      status: 'ACTIVE',
      isVerified: true,
    },
    {
      title: 'Luxury 2BHK Gulshan Apartment',
      description: 'Modern luxury apartment with smart home features, high-speed internet, and premium furnishings.',
      propertyType: 'FAMILY',
      address: 'Gulshan Avenue, Gulshan-1',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1400,
      rentAmount: 45000,
      furnished: 'FULL',
      amenities: ['wifi', 'parking', 'generator', 'gas', 'water', 'security', 'lift', 'ac'],
      coverImage: placeholderImages[4],
      images: [placeholderImages[4], placeholderImages[5], placeholderImages[0]],
      ownerId: owner1.id,
      status: 'ACTIVE',
      isVerified: true,
    },
  ]

  // Sample properties for Uttara
  const uttaraProperties = [
    {
      title: 'Affordable 1BHK in Uttara',
      description: 'Budget-friendly 1 bedroom flat in Uttara. Good for working professionals. Safe area with nearby markets.',
      propertyType: 'BACHELOR',
      address: 'Sector 10, Uttara',
      area: 'Uttara',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 350,
      rentAmount: 12000,
      furnished: 'PARTIAL',
      amenities: ['wifi', 'water', 'gas'],
      coverImage: placeholderImages[5],
      images: [placeholderImages[5], placeholderImages[1]],
      ownerId: owner1.id,
      status: 'ACTIVE',
      isVerified: true,
    },
  ]

  // Insert all properties
  const allProperties = [...properties, ...gulshanProperties, ...uttaraProperties]

  for (const prop of allProperties) {
    await prisma.property.create({
      data: {
        title: prop.title,
        description: prop.description,
        propertyType: prop.propertyType as any,
        address: prop.address,
        area: prop.area,
        city: prop.city,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        squareFeet: prop.squareFeet,
        rentAmount: prop.rentAmount,
        furnished: prop.furnished as any,
        amenities: JSON.parse(JSON.stringify(prop.amenities)),
        coverImage: prop.coverImage || null,
        images: JSON.parse(JSON.stringify(prop.images)),
        ownerId: prop.ownerId,
        status: prop.status as any,
        isVerified: prop.isVerified,
      } as any,
    })
  }

  console.log('✅ Seed completed successfully!')
  console.log(`Created ${allProperties.length} sample properties`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
