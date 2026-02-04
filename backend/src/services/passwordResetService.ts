import crypto from 'crypto'
import { prisma } from '../models'

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function storeResetToken(userId: string, hashedToken: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  })
}

export async function findUserByResetToken(hashedToken: string) {
  return prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  })
}

export async function clearResetToken(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })
}
