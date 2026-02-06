import crypto from 'crypto'
import { prisma } from '../models'

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function storeResetToken(userId: string, hashedToken: string): Promise<void> {
  await prisma.passwordReset.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  })
}

export async function findUserByResetToken(hashedToken: string) {
  const passwordReset = await prisma.passwordReset.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
      used: false,
    },
    include: {
      user: true,
    },
  })
  return passwordReset?.user
}

export async function clearResetToken(userId: string): Promise<void> {
  await prisma.passwordReset.updateMany({
    where: { userId },
    data: { used: true },
  })
}
