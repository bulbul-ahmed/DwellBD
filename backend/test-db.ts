import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected - Found ${userCount} users`)

    const propertyCount = await prisma.property.count()
    console.log(`✅ Found ${propertyCount} properties`)

    const inquiryCount = await prisma.inquiry.count()
    console.log(`✅ Found ${inquiryCount} inquiries`)

    const reviewCount = await prisma.review.count()
    console.log(`✅ Found ${reviewCount} reviews`)

    const viewCount = await prisma.propertyView.count()
    console.log(`✅ Found ${viewCount} property views`)

    const favoriteCount = await prisma.favorite.count()
    console.log(`✅ Found ${favoriteCount} favorites`)

    console.log('🎉 Database test PASSED!')
  } catch (error) {
    console.error('❌ Database test FAILED:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

test()
