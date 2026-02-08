import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting enhanced seed with comprehensive test data...')

  // Hash default passwords
  const adminPassword = await hashPassword('Admin@123')
  const ownerPassword = await hashPassword('Owner@123')
  const tenantPassword = await hashPassword('Tenant@123')

  // ============================================
  // PHASE 1: Create Comprehensive User Base
  // ============================================

  // Admin Users (3)
  console.log('📝 Creating admin users...')
  const adminData = [
    { email: 'admin@bdfhub.com', firstName: 'System', lastName: 'Admin', phone: '+8801900000001' },
    { email: 'moderator@bdfhub.com', firstName: 'Content', lastName: 'Moderator', phone: '+8801900000002' },
    { email: 'support@bdfhub.com', firstName: 'Support', lastName: 'Team', phone: '+8801900000003' },
  ]

  const admins = []
  for (const data of adminData) {
    const admin = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password: adminPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
    })
    admins.push(admin)
  }

  // Owner Users (10)
  console.log('👷 Creating owner users...')
  const ownerData = [
    { email: 'owner1@example.com', firstName: 'Rahim', lastName: 'Uddin', phone: '+8801711234567' },
    { email: 'owner2@example.com', firstName: 'Fatima', lastName: 'Ahmed', phone: '+8801821234567' },
    { email: 'owner3@example.com', firstName: 'Mohammad', lastName: 'Hassan', phone: '+8801911111111' },
    { email: 'owner4@example.com', firstName: 'Nasrin', lastName: 'Begum', phone: '+8801912222222' },
    { email: 'owner5@example.com', firstName: 'Ahmed', lastName: 'Khan', phone: '+8801913333333' },
    { email: 'owner6@example.com', firstName: 'Raina', lastName: 'Akhter', phone: '+8801914444444' },
    { email: 'owner7@example.com', firstName: 'Karim', lastName: 'Miah', phone: '+8801915555555' },
    { email: 'owner8@example.com', firstName: 'Salma', lastName: 'Islam', phone: '+8801916666666' },
    { email: 'owner9@example.com', firstName: 'Habib', lastName: 'Rahman', phone: '+8801917777777' },
    { email: 'owner10@example.com', firstName: 'Aisha', lastName: 'Siddiqua', phone: '+8801918888888' },
  ]

  const owners = []
  for (const data of ownerData) {
    const owner = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password: ownerPassword,
        role: 'OWNER',
        isVerified: true,
        isActive: true,
      },
    })
    owners.push(owner)
  }

  // Tenant Users (15)
  console.log('👥 Creating tenant users...')
  const tenantData = [
    { email: 'tenant1@example.com', firstName: 'Abdullah', lastName: 'Rahman', phone: '+8801631111111' },
    { email: 'tenant2@example.com', firstName: 'Zainab', lastName: 'Ahmed', phone: '+8801632222222' },
    { email: 'tenant3@example.com', firstName: 'Bilal', lastName: 'Hassan', phone: '+8801633333333' },
    { email: 'tenant4@example.com', firstName: 'Hana', lastName: 'Khan', phone: '+8801634444444' },
    { email: 'tenant5@example.com', firstName: 'Imran', lastName: 'Hossain', phone: '+8801635555555' },
    { email: 'tenant6@example.com', firstName: 'Layla', lastName: 'Ahmed', phone: '+8801636666666' },
    { email: 'tenant7@example.com', firstName: 'Jamal', lastName: 'Rahman', phone: '+8801637777777' },
    { email: 'tenant8@example.com', firstName: 'Noor', lastName: 'Islam', phone: '+8801638888888' },
    { email: 'tenant9@example.com', firstName: 'Omar', lastName: 'Khan', phone: '+8801639999999' },
    { email: 'tenant10@example.com', firstName: 'Sophia', lastName: 'Ahmed', phone: '+8801640000000' },
    { email: 'tenant11@example.com', firstName: 'Rayan', lastName: 'Hassan', phone: '+8801641111111' },
    { email: 'tenant12@example.com', firstName: 'Amina', lastName: 'Begum', phone: '+8801642222222' },
    { email: 'tenant13@example.com', firstName: 'Karim', lastName: 'Miah', phone: '+8801643333333' },
    { email: 'tenant14@example.com', firstName: 'Yasmin', lastName: 'Rahman', phone: '+8801644444444' },
    { email: 'tenant15@example.com', firstName: 'Tariq', lastName: 'Ahmed', phone: '+8801645555555' },
  ]

  const tenants = []
  for (const data of tenantData) {
    const tenant = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password: tenantPassword,
        role: 'TENANT',
        isVerified: true,
        isActive: true,
      },
    })
    tenants.push(tenant)
  }

  // ============================================
  // PHASE 2: Create Diverse Property Dataset
  // ============================================

  console.log('🏠 Creating diverse property listings...')

  // Placeholder images
  const placeholderImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
  ]

  // Define properties array with proper typing
  const propertyDataArray = [
    // Dhanmondi properties
    {
      title: 'Spacious 2BHK Flat in Dhanmondi',
      description: 'Modern flat with 24/7 security, parking, and generator backup. Walking distance to shopping malls and educational institutions.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'House 12, Road 5, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      rentAmount: 35000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'parking', 'generator', 'gas', 'water', 'security'],
      status: 'ACTIVE' as const,
      ownerIndex: 0,
      imageIndices: [0, 1, 2],
    },
    {
      title: 'Bachelor Room Near Dhaka University',
      description: 'Clean and safe bachelor accommodation with meals included. Perfect for students. Well-ventilated and furnished.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Near Dhaka University Campus, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 300,
      rentAmount: 8000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'meals', 'laundry', 'water'],
      status: 'ACTIVE' as const,
      ownerIndex: 0,
      imageIndices: [1, 3],
    },
    {
      title: 'Premium Family Flat - Dhanmondi',
      description: '3BHK flat with premium amenities. Includes generator, water tank, and 24/7 security. Suitable for families.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Road 10A, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1500,
      rentAmount: 50000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'parking', 'generator', 'gas', 'water', 'security', 'lift'],
      status: 'ACTIVE' as const,
      ownerIndex: 1,
      imageIndices: [2, 4, 5],
    },
    {
      title: 'Cozy 1BHK Bachelor Flat - Dhanmondi',
      description: 'Newly renovated bachelor apartment. Well-maintained with modern furnishings.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Road 8, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 350,
      rentAmount: 12000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'PENDING' as const,
      ownerIndex: 2,
      imageIndices: [3, 4],
    },
    // Gulshan properties
    {
      title: 'Girls Hostel in Gulshan',
      description: 'Secure girls hostel with 24/7 security CCTV. Near shopping centers and restaurants. Meals included.',
      type: 'HOSTEL' as const,
      listingType: 'RENT' as const,
      address: 'Gulshan-2, Dhaka',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 400,
      rentAmount: 12000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'security', 'meals', 'laundry', 'common-room'],
      status: 'ACTIVE' as const,
      ownerIndex: 1,
      imageIndices: [3, 4],
    },
    {
      title: 'Luxury 2BHK Gulshan Apartment',
      description: 'Modern luxury apartment with smart home features, high-speed internet, and premium furnishings.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Gulshan Avenue, Gulshan-1',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1400,
      rentAmount: 45000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'parking', 'generator', 'gas', 'water', 'security', 'lift', 'ac'],
      status: 'ACTIVE' as const,
      ownerIndex: 0,
      imageIndices: [4, 5, 0],
    },
    {
      title: '2BHK Apartment for Sale - Gulshan',
      description: 'Ready to occupy 2 bedroom apartment in Gulshan. Prime location near all amenities.',
      type: 'FAMILY' as const,
      listingType: 'SELL' as const,
      address: 'Gulshan-1, Dhaka',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1100,
      rentAmount: 7500000,
      furnished: 'NONE' as const,
      amenities: ['parking', 'security', 'lift'],
      status: 'ACTIVE' as const,
      ownerIndex: 3,
      imageIndices: [2, 5],
    },
    {
      title: 'Boys Hostel in Gulshan',
      description: 'New boys hostel with modern facilities and 24/7 security supervision.',
      type: 'HOSTEL' as const,
      listingType: 'RENT' as const,
      address: 'Gulshan Avenue, Gulshan-2',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 350,
      rentAmount: 10000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'meals', 'security', 'laundry'],
      status: 'PENDING' as const,
      ownerIndex: 4,
      imageIndices: [1, 3],
    },
    // Uttara properties
    {
      title: 'Affordable 1BHK in Uttara',
      description: 'Budget-friendly 1 bedroom flat in Uttara. Good for working professionals. Safe area with nearby markets.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Sector 10, Uttara',
      area: 'Uttara',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 350,
      rentAmount: 12000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 0,
      imageIndices: [5, 1],
    },
    {
      title: '2BHK Family Flat - Uttara',
      description: 'Family-oriented apartment in Uttara with good ventilation and modern design.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Sector 4, Uttara',
      area: 'Uttara',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 950,
      rentAmount: 28000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas', 'parking'],
      status: 'ACTIVE' as const,
      ownerIndex: 5,
      imageIndices: [0, 3],
    },
    {
      title: '1BHK Apartment - Uttara',
      description: 'Recently rented out 1 bedroom apartment in good condition.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Sector 7, Uttara',
      area: 'Uttara',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 300,
      rentAmount: 10000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'RENTED' as const,
      ownerIndex: 1,
      imageIndices: [2, 4],
    },
    // Banani properties
    {
      title: 'Spacious 3BHK - Banani',
      description: 'Spacious family flat in Banani with community facilities and garden area.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Banani Lake Road, Banani',
      area: 'Banani',
      city: 'Dhaka',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1600,
      rentAmount: 55000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'parking', 'generator', 'security', 'garden'],
      status: 'ACTIVE' as const,
      ownerIndex: 2,
      imageIndices: [3, 5],
    },
    {
      title: 'Sublet Room Available - Banani',
      description: 'Sharing 3BHK flat, one room available for sublet. Friendly roommates.',
      type: 'SUBLET' as const,
      listingType: 'RENT' as const,
      address: 'Banani, Dhaka',
      area: 'Banani',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 250,
      rentAmount: 10000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'gas', 'water', 'ac'],
      status: 'ACTIVE' as const,
      ownerIndex: 3,
      imageIndices: [4, 0],
    },
    {
      title: '2BHK Ready Flat for Sale - Banani',
      description: 'Modern apartment ready for immediate occupancy in Banani.',
      type: 'FAMILY' as const,
      listingType: 'SELL' as const,
      address: 'Banani Avenue, Banani',
      area: 'Banani',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      rentAmount: 8000000,
      furnished: 'NONE' as const,
      amenities: ['parking', 'security'],
      status: 'ACTIVE' as const,
      ownerIndex: 6,
      imageIndices: [1, 5],
    },
    {
      title: 'Bachelor Room - Banani',
      description: 'Comfortable bachelor room in residential area of Banani.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Banani, Dhaka',
      area: 'Banani',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 300,
      rentAmount: 11000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'PENDING' as const,
      ownerIndex: 4,
      imageIndices: [2, 1],
    },
    // Mirpur properties
    {
      title: '2BHK Flat in Mirpur',
      description: 'Well-maintained family flat in Mirpur with excellent amenities.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Mirpur-1, Dhaka',
      area: 'Mirpur',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1000,
      rentAmount: 25000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas', 'parking'],
      status: 'ACTIVE' as const,
      ownerIndex: 5,
      imageIndices: [5, 0],
    },
    {
      title: 'Student Hostel - Mirpur',
      description: 'Affordable student hostel near educational institutions.',
      type: 'HOSTEL' as const,
      listingType: 'RENT' as const,
      address: 'Mirpur-2, Dhaka',
      area: 'Mirpur',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 350,
      rentAmount: 8000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'meals', 'laundry', 'water'],
      status: 'ACTIVE' as const,
      ownerIndex: 0,
      imageIndices: [3, 4],
    },
    {
      title: 'Bachelor Apartment - Mirpur',
      description: 'Temporarily inactive listing - under renovation.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Mirpur-10, Dhaka',
      area: 'Mirpur',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 300,
      rentAmount: 9000,
      furnished: 'NONE' as const,
      amenities: ['water', 'gas'],
      status: 'INACTIVE' as const,
      ownerIndex: 7,
      imageIndices: [1, 2],
    },
    // Mohammadpur properties
    {
      title: '2BHK - Mohammadpur',
      description: 'Budget-friendly family apartment in Mohammadpur area.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Mohammadpur, Dhaka',
      area: 'Mohammadpur',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 800,
      rentAmount: 18000,
      furnished: 'NONE' as const,
      amenities: ['water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 1,
      imageIndices: [4, 5],
    },
    {
      title: 'Room Sublet - Mohammadpur',
      description: 'Single room available for sublet in shared apartment.',
      type: 'SUBLET' as const,
      listingType: 'RENT' as const,
      address: 'Mohammadpur, Dhaka',
      area: 'Mohammadpur',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 200,
      rentAmount: 7000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 8,
      imageIndices: [0, 3],
    },
    {
      title: 'Bachelor Apartment - Mohammadpur (SOLD)',
      description: 'Recently sold bachelor apartment - no longer available.',
      type: 'BACHELOR' as const,
      listingType: 'SELL' as const,
      address: 'Mohammadpur, Dhaka',
      area: 'Mohammadpur',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 280,
      rentAmount: 1500000,
      furnished: 'NONE' as const,
      amenities: ['water', 'gas'],
      status: 'SOLD' as const,
      ownerIndex: 2,
      imageIndices: [2, 1],
    },
    // Bashundhara properties
    {
      title: 'Commercial Office Space - Bashundhara',
      description: 'Professional office space in business hub with excellent connectivity.',
      type: 'OFFICE' as const,
      listingType: 'RENT' as const,
      address: 'Bashundhara R/A, Dhaka',
      area: 'Bashundhara',
      city: 'Dhaka',
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 800,
      rentAmount: 40000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'parking', 'generator', 'security', 'lift', 'ac'],
      status: 'ACTIVE' as const,
      ownerIndex: 3,
      imageIndices: [5, 0],
    },
    {
      title: '3BHK Apartment for Sale - Bashundhara',
      description: '3 bedroom ready apartment in Bashundhara with modern design.',
      type: 'FAMILY' as const,
      listingType: 'SELL' as const,
      address: 'Bashundhara R/A, Dhaka',
      area: 'Bashundhara',
      city: 'Dhaka',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1350,
      rentAmount: 9500000,
      furnished: 'NONE' as const,
      amenities: ['parking', 'generator', 'security'],
      status: 'ACTIVE' as const,
      ownerIndex: 9,
      imageIndices: [3, 4],
    },
    {
      title: 'Family Flat - Bashundhara',
      description: 'Currently rented family apartment in Bashundhara.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Bashundhara Avenue, Dhaka',
      area: 'Bashundhara',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1100,
      rentAmount: 38000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'parking', 'generator', 'security', 'ac'],
      status: 'RENTED' as const,
      ownerIndex: 4,
      imageIndices: [1, 2],
    },
    {
      title: '1BHK Bachelor Room - Bashundhara',
      description: 'Modern bachelor apartment waiting for approval.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Bashundhara, Dhaka',
      area: 'Bashundhara',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 320,
      rentAmount: 14000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas', 'ac'],
      status: 'PENDING' as const,
      ownerIndex: 5,
      imageIndices: [4, 0],
    },
    // Tejgaon properties
    {
      title: 'Office Suite - Tejgaon',
      description: 'Prime office location in Tejgaon with high foot traffic.',
      type: 'OFFICE' as const,
      listingType: 'RENT' as const,
      address: 'Tejgaon, Dhaka',
      area: 'Tejgaon',
      city: 'Dhaka',
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 600,
      rentAmount: 35000,
      furnished: 'NONE' as const,
      amenities: ['wifi', 'security', 'lift'],
      status: 'ACTIVE' as const,
      ownerIndex: 6,
      imageIndices: [2, 5],
    },
    {
      title: 'Bachelor Room - Tejgaon',
      description: 'Convenient bachelor room near Tejgaon business area.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Tejgaon, Dhaka',
      area: 'Tejgaon',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 280,
      rentAmount: 11000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 0,
      imageIndices: [0, 3],
    },
    // Khilgaon properties
    {
      title: '2BHK Apartment - Khilgaon',
      description: 'Family apartment in bustling Khilgaon area with good connectivity.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Khilgaon, Dhaka',
      area: 'Khilgaon',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 950,
      rentAmount: 26000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'water', 'gas', 'parking'],
      status: 'ACTIVE' as const,
      ownerIndex: 7,
      imageIndices: [3, 1],
    },
    {
      title: 'Room Sublet - Khilgaon',
      description: 'Sharing apartment with single room available.',
      type: 'SUBLET' as const,
      listingType: 'RENT' as const,
      address: 'Khilgaon, Dhaka',
      area: 'Khilgaon',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 220,
      rentAmount: 8000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 8,
      imageIndices: [4, 2],
    },
    {
      title: 'Hostel Accommodation - Khilgaon',
      description: 'New hostel facility awaiting approval for operations.',
      type: 'HOSTEL' as const,
      listingType: 'RENT' as const,
      address: 'Khilgaon, Dhaka',
      area: 'Khilgaon',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 300,
      rentAmount: 9000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'meals', 'laundry', 'water'],
      status: 'PENDING' as const,
      ownerIndex: 9,
      imageIndices: [5, 0],
    },
    // Motijheel properties
    {
      title: 'Corporate Office Space - Motijheel',
      description: 'Prime business location in heart of Motijheel business district.',
      type: 'OFFICE' as const,
      listingType: 'RENT' as const,
      address: 'Motijheel, Dhaka',
      area: 'Motijheel',
      city: 'Dhaka',
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 1000,
      rentAmount: 50000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'parking', 'generator', 'security', 'lift', 'ac', 'conference-room'],
      status: 'ACTIVE' as const,
      ownerIndex: 1,
      imageIndices: [1, 4],
    },
    {
      title: 'Luxury Apartment for Sale - Motijheel',
      description: 'High-end luxury apartment in prime Motijheel location.',
      type: 'FAMILY' as const,
      listingType: 'SELL' as const,
      address: 'Motijheel, Dhaka',
      area: 'Motijheel',
      city: 'Dhaka',
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 1800,
      rentAmount: 12500000,
      furnished: 'FULL' as const,
      amenities: ['parking', 'generator', 'security', 'lift', 'ac', 'balcony'],
      status: 'ACTIVE' as const,
      ownerIndex: 2,
      imageIndices: [5, 0],
    },
    // Additional diverse properties
    {
      title: 'Budget 1BHK - Uttara',
      description: 'Very affordable 1 bedroom apartment for students and bachelors.',
      type: 'BACHELOR' as const,
      listingType: 'RENT' as const,
      address: 'Uttara, Dhaka',
      area: 'Uttara',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 250,
      rentAmount: 8500,
      furnished: 'NONE' as const,
      amenities: ['water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 3,
      imageIndices: [2, 3],
    },
    {
      title: 'Premium Student Hostel - Dhanmondi',
      description: 'Upscale hostel with modern amenities and facilities.',
      type: 'HOSTEL' as const,
      listingType: 'RENT' as const,
      address: 'Dhanmondi, Dhaka',
      area: 'Dhanmondi',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 450,
      rentAmount: 15000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'meals', 'laundry', 'gym', 'common-room', 'ac'],
      status: 'ACTIVE' as const,
      ownerIndex: 4,
      imageIndices: [3, 5],
    },
    {
      title: 'Sublet Room - Gulshan',
      description: 'Comfortable room in shared apartment at Gulshan.',
      type: 'SUBLET' as const,
      listingType: 'RENT' as const,
      address: 'Gulshan, Dhaka',
      area: 'Gulshan',
      city: 'Dhaka',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 240,
      rentAmount: 11000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'ac', 'water', 'gas'],
      status: 'ACTIVE' as const,
      ownerIndex: 5,
      imageIndices: [4, 1],
    },
    {
      title: '3BHK Family Apartment - Mirpur',
      description: 'Large family apartment with spacious rooms and good amenities.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Mirpur-1, Dhaka',
      area: 'Mirpur',
      city: 'Dhaka',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
      rentAmount: 42000,
      furnished: 'PARTIAL' as const,
      amenities: ['wifi', 'parking', 'generator', 'security', 'garden'],
      status: 'ACTIVE' as const,
      ownerIndex: 6,
      imageIndices: [0, 2],
    },
    {
      title: '2BHK Flat - Banani',
      description: 'Well-furnished family flat in upscale Banani area.',
      type: 'FAMILY' as const,
      listingType: 'RENT' as const,
      address: 'Banani, Dhaka',
      area: 'Banani',
      city: 'Dhaka',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1050,
      rentAmount: 40000,
      furnished: 'FULL' as const,
      amenities: ['wifi', 'parking', 'generator', 'security', 'ac'],
      status: 'ACTIVE' as const,
      ownerIndex: 7,
      imageIndices: [1, 5],
    },
  ]

  // Create all properties
  const createdProperties = []
  for (const prop of propertyDataArray) {
    const owner = owners[prop.ownerIndex]
    const images = prop.imageIndices.map(idx => placeholderImages[idx]).filter((img): img is string => img !== undefined)
    const coverImage = images[0] || null

    if (owner) {
      const created = await prisma.property.create({
        data: {
          title: prop.title,
          description: prop.description,
          type: prop.type,
          listingType: prop.listingType,
          address: prop.address,
          area: prop.area,
          city: prop.city,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          squareFeet: prop.squareFeet,
          rentAmount: prop.rentAmount,
          furnished: prop.furnished,
          amenities: prop.amenities,
          coverImage: coverImage,
          images: images,
          ownerId: owner.id,
          status: prop.status,
          serviceCharge: 500, // Default service charge for Dhaka
          gasType: 'NATURAL_GAS' as const, // Default gas type
          tenantPreference: 'ANY' as const, // Accept any tenant type
        },
      })
      createdProperties.push(created)
    }
  }

  // ============================================
  // PHASE 3: Create User Interactions
  // ============================================

  console.log('⭐ Creating reviews...')
  const reviews = [
    { userId: tenants[0]?.id, propertyId: createdProperties[0]?.id, rating: 5, comment: 'Excellent property with all amenities. Owner is very cooperative.' },
    { userId: tenants[1]?.id, propertyId: createdProperties[0]?.id, rating: 4, comment: 'Good location but slightly expensive.' },
    { userId: tenants[2]?.id, propertyId: createdProperties[1]?.id, rating: 5, comment: 'Perfect for students, meals included are tasty!' },
    { userId: tenants[3]?.id, propertyId: createdProperties[2]?.id, rating: 4, comment: 'Premium quality but could use better ventilation.' },
    { userId: tenants[4]?.id, propertyId: createdProperties[4]?.id, rating: 5, comment: 'Amazing hostel with great facilities and supportive staff.' },
    { userId: tenants[5]?.id, propertyId: createdProperties[5]?.id, rating: 5, comment: 'Luxury apartment living at its best!' },
    { userId: tenants[6]?.id, propertyId: createdProperties[6]?.id, rating: 3, comment: 'Good but a bit dated, needs renovation.' },
    { userId: tenants[7]?.id, propertyId: createdProperties[7]?.id, rating: 4, comment: 'Very comfortable and well-maintained.' },
    { userId: tenants[8]?.id, propertyId: createdProperties[8]?.id, rating: 5, comment: 'Best hostel experience, highly recommend!' },
    { userId: tenants[9]?.id, propertyId: createdProperties[10]?.id, rating: 4, comment: 'Affordable and clean, great for working professionals.' },
    { userId: tenants[10]?.id, propertyId: createdProperties[11]?.id, rating: 5, comment: 'Family-friendly, excellent security and parking.' },
    { userId: tenants[11]?.id, propertyId: createdProperties[13]?.id, rating: 4, comment: 'Nice location, good amenities, owner is helpful.' },
    { userId: tenants[12]?.id, propertyId: createdProperties[15]?.id, rating: 5, comment: 'Outstanding sublet opportunity, friendly roommates!' },
    { userId: tenants[13]?.id, propertyId: createdProperties[18]?.id, rating: 4, comment: 'Decent bachelor room, needs some updates.' },
    { userId: tenants[14]?.id, propertyId: createdProperties[19]?.id, rating: 5, comment: 'Perfect location near my office, very satisfied!' },
  ]

  for (const review of reviews) {
    if (review.userId && review.propertyId) {
      await prisma.review.create({ data: review as any })
    }
  }

  console.log('❤️ Creating favorites...')
  const favorites = [
    { userId: tenants[0]?.id, propertyId: createdProperties[0]?.id },
    { userId: tenants[0]?.id, propertyId: createdProperties[5]?.id },
    { userId: tenants[1]?.id, propertyId: createdProperties[1]?.id },
    { userId: tenants[1]?.id, propertyId: createdProperties[4]?.id },
    { userId: tenants[2]?.id, propertyId: createdProperties[2]?.id },
    { userId: tenants[2]?.id, propertyId: createdProperties[10]?.id },
    { userId: tenants[3]?.id, propertyId: createdProperties[6]?.id },
    { userId: tenants[3]?.id, propertyId: createdProperties[13]?.id },
    { userId: tenants[4]?.id, propertyId: createdProperties[8]?.id },
    { userId: tenants[4]?.id, propertyId: createdProperties[15]?.id },
    { userId: tenants[5]?.id, propertyId: createdProperties[11]?.id },
    { userId: tenants[5]?.id, propertyId: createdProperties[18]?.id },
    { userId: tenants[6]?.id, propertyId: createdProperties[3]?.id },
    { userId: tenants[6]?.id, propertyId: createdProperties[20]?.id },
    { userId: tenants[7]?.id, propertyId: createdProperties[0]?.id },
    { userId: tenants[8]?.id, propertyId: createdProperties[5]?.id },
    { userId: tenants[9]?.id, propertyId: createdProperties[7]?.id },
    { userId: tenants[10]?.id, propertyId: createdProperties[1]?.id },
    { userId: tenants[11]?.id, propertyId: createdProperties[4]?.id },
    { userId: tenants[12]?.id, propertyId: createdProperties[9]?.id },
  ]

  for (const fav of favorites) {
    if (fav.userId && fav.propertyId) {
      try {
        await prisma.favorite.create({ data: fav as any })
      } catch (e) {
        // Skip duplicates
      }
    }
  }

  console.log('📅 Creating bookings...')
  const bookings = [
    { userId: tenants[0]?.id, propertyId: createdProperties[0]?.id, checkIn: new Date('2026-03-01'), checkOut: new Date('2026-03-05'), status: 'CONFIRMED' as const },
    { userId: tenants[1]?.id, propertyId: createdProperties[1]?.id, checkIn: new Date('2026-03-10'), checkOut: new Date('2026-03-15'), status: 'CONFIRMED' as const },
    { userId: tenants[2]?.id, propertyId: createdProperties[4]?.id, checkIn: new Date('2026-02-15'), checkOut: new Date('2026-02-20'), status: 'COMPLETED' as const },
    { userId: tenants[3]?.id, propertyId: createdProperties[5]?.id, checkIn: new Date('2026-03-20'), checkOut: new Date('2026-03-25'), status: 'CONFIRMED' as const },
    { userId: tenants[4]?.id, propertyId: createdProperties[10]?.id, checkIn: new Date('2026-02-10'), checkOut: new Date('2026-02-14'), status: 'COMPLETED' as const },
    { userId: tenants[5]?.id, propertyId: createdProperties[7]?.id, checkIn: new Date('2026-04-01'), checkOut: new Date('2026-04-10'), status: 'PENDING' as const },
    { userId: tenants[6]?.id, propertyId: createdProperties[13]?.id, checkIn: new Date('2026-02-20'), checkOut: new Date('2026-02-25'), status: 'CONFIRMED' as const },
    { userId: tenants[7]?.id, propertyId: createdProperties[18]?.id, checkIn: new Date('2026-02-28'), checkOut: new Date('2026-03-03'), status: 'COMPLETED' as const },
    { userId: tenants[8]?.id, propertyId: createdProperties[11]?.id, checkIn: new Date('2026-03-15'), checkOut: new Date('2026-03-20'), status: 'CONFIRMED' as const },
    { userId: tenants[9]?.id, propertyId: createdProperties[20]?.id, checkIn: new Date('2026-03-05'), checkOut: new Date('2026-03-08'), status: 'PENDING' as const },
  ]

  for (const booking of bookings) {
    if (booking.userId && booking.propertyId) {
      await prisma.booking.create({ data: booking as any })
    }
  }

  console.log('💬 Creating inquiries...')
  const inquiries = [
    { userId: tenants[0]?.id, propertyId: createdProperties[0]?.id, name: 'Abdullah Rahman', email: 'tenant1@example.com', phone: '+8801711111111', message: 'Is this property still available? Can I visit tomorrow?', status: 'PENDING' as const },
    { userId: tenants[1]?.id, propertyId: createdProperties[1]?.id, name: 'Zainab Ahmed', email: 'tenant2@example.com', phone: '+8801632222222', message: 'What is the nearest bus stop? Are utilities included?', status: 'RESPONDED' as const },
    { userId: tenants[2]?.id, propertyId: createdProperties[4]?.id, name: 'Bilal Hassan', email: 'tenant3@example.com', phone: '+8801633333333', message: 'Can you provide more details about the facilities?', status: 'PENDING' as const },
    { userId: tenants[3]?.id, propertyId: createdProperties[5]?.id, name: 'Hana Khan', email: 'tenant4@example.com', phone: '+8801634444444', message: 'Interested in viewing, when are you available?', status: 'RESPONDED' as const },
    { userId: tenants[4]?.id, propertyId: createdProperties[10]?.id, name: 'Imran Hossain', email: 'tenant5@example.com', phone: '+8801635555555', message: 'Is there parking available? What about guest facilities?', status: 'CLOSED' as const },
    { userId: tenants[5]?.id, propertyId: createdProperties[7]?.id, name: 'Layla Ahmed', email: 'tenant6@example.com', phone: '+8801636666666', message: 'How long is the lease period? Can we negotiate?', status: 'PENDING' as const },
    { userId: tenants[6]?.id, propertyId: createdProperties[13]?.id, name: 'Jamal Rahman', email: 'tenant7@example.com', phone: '+8801637777777', message: 'Are pets allowed? What about the deposit policy?', status: 'RESPONDED' as const },
    { userId: tenants[7]?.id, propertyId: createdProperties[18]?.id, name: 'Noor Islam', email: 'tenant8@example.com', phone: '+8801638888888', message: 'Can I schedule a video tour?', status: 'PENDING' as const },
    { userId: tenants[8]?.id, propertyId: createdProperties[11]?.id, name: 'Omar Khan', email: 'tenant9@example.com', phone: '+8801639999999', message: 'What utilities are included in the rent?', status: 'RESPONDED' as const },
    { userId: tenants[9]?.id, propertyId: createdProperties[20]?.id, name: 'Sophia Ahmed', email: 'tenant10@example.com', phone: '+8801640000000', message: 'Do you have similar properties available?', status: 'CLOSED' as const },
  ]

  for (const inquiry of inquiries) {
    if (inquiry.userId && inquiry.propertyId) {
      await prisma.inquiry.create({ data: inquiry as any })
    }
  }

  console.log('👁️ Creating property views...')
  let viewCount = 0
  for (const property of createdProperties) {
    const viewsForProperty = Math.floor(Math.random() * 15) + 5 // 5-20 views per property
    for (let i = 0; i < viewsForProperty; i++) {
      const randomTenant = tenants[Math.floor(Math.random() * tenants.length)]
      if (randomTenant) {
        try {
          await prisma.propertyView.create({
            data: {
              userId: randomTenant.id,
              propertyId: property.id,
            },
          })
          viewCount++
        } catch (e) {
          // Skip duplicates
        }
      }
    }
  }

  // ============================================
  // SUMMARY
  // ============================================

  console.log('')
  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📊 Data Summary:')
  console.log(`   Users Created: 28 (3 admins + 10 owners + 15 tenants)`)
  console.log(`   Properties Created: ${createdProperties.length}`)
  console.log(`   Reviews Created: ${reviews.filter(r => r.userId && r.propertyId).length}`)
  console.log(`   Favorites Created: ${favorites.filter(f => f.userId && f.propertyId).length}`)
  console.log(`   Bookings Created: ${bookings.filter(b => b.userId && b.propertyId).length}`)
  console.log(`   Inquiries Created: ${inquiries.filter(i => i.userId && i.propertyId).length}`)
  console.log(`   Property Views Created: ${viewCount}`)
  console.log('')
  console.log('🔐 Test User Credentials:')
  console.log('')
  console.log('   Admin Users:')
  console.log('   Email: admin@bdfhub.com | Password: Admin@123')
  console.log('   Email: moderator@bdfhub.com | Password: Admin@123')
  console.log('   Email: support@bdfhub.com | Password: Admin@123')
  console.log('')
  console.log('   Owner Users:')
  console.log('   Email: owner1@example.com | Password: Owner@123')
  console.log('   Email: owner2@example.com | Password: Owner@123')
  console.log('   (+ 8 more owner accounts)')
  console.log('')
  console.log('   Tenant Users:')
  console.log('   Email: tenant1@example.com | Password: Tenant@123')
  console.log('   Email: tenant2@example.com | Password: Tenant@123')
  console.log('   (+ 13 more tenant accounts)')
  console.log('')
  console.log('💡 Next Steps:')
  console.log('   1. Start backend: npm run dev')
  console.log('   2. Start frontend: npm run dev')
  console.log('   3. Login with test credentials')
  console.log('   4. Visit Prisma Studio: npm run studio')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
