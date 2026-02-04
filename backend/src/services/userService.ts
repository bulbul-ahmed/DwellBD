import bcryptjs from 'bcryptjs'
import { prisma, CreateUserInput, UserRole } from '../models'

export async function createUser(input: CreateUserInput) {
  const hashedPassword = await bcryptjs.hash(input.password, 10)

  const data: any = {
    email: input.email,
    password: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role || ('TENANT' as UserRole),
  }

  if (input.phone) {
    data.phone = input.phone
  }

  return prisma.user.create({ data })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcryptjs.compare(plainPassword, hashedPassword)
}

export async function updateUserVerification(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  })
}
