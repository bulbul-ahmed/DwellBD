import nodemailer from 'nodemailer'

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request - BDFlatHub',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  })
}
