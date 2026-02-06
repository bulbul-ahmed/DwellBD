const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('1. Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    
    console.log('2. Checking password...');
    const isValidPassword = await bcrypt.compare('Admin123!', user.password);
    console.log('Password valid:', isValidPassword);
    
    if (isValidPassword) {
      console.log('3. Login would be successful');
    } else {
      console.log('3. Invalid password');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
