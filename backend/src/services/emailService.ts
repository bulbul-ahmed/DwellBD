import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service configuration error:', error)
  } else {
    console.log('Email service ready to send messages')
  }
})

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  firstName: string
): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: `"BD Flat Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request - BD Flat Hub',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #5A8FA3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #5A8FA3;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .warning { color: #d32f2f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>

              <p>We received a request to reset your password for your BD Flat Hub account.</p>

              <p>Click the button below to reset your password:</p>

              <a href="${resetUrl}" class="button">Reset Password</a>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #5A8FA3;">${resetUrl}</p>

              <p class="warning">This link will expire in 1 hour.</p>

              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>

              <p>For security reasons, we recommend:</p>
              <ul>
                <li>Using a strong, unique password</li>
                <li>Not sharing your password with anyone</li>
                <li>Changing your password regularly</li>
              </ul>

              <p>Best regards,<br>The BD Flat Hub Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BD Flat Hub. All rights reserved.</p>
              <p>If you have any questions, contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${firstName},

We received a request to reset your password for your BD Flat Hub account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The BD Flat Hub Team
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${to}`)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  to: string,
  verificationToken: string,
  firstName: string
): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

  const mailOptions = {
    from: `"BD Flat Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email - BD Flat Hub',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #5A8FA3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #5A8FA3;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to BD Flat Hub!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>

              <p>Thank you for registering with BD Flat Hub. To complete your registration, please verify your email address.</p>

              <p>Click the button below to verify your email:</p>

              <a href="${verificationUrl}" class="button">Verify Email</a>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #5A8FA3;">${verificationUrl}</p>

              <p>This link will expire in 24 hours.</p>

              <p>If you didn't create an account with BD Flat Hub, please ignore this email.</p>

              <p>Best regards,<br>The BD Flat Hub Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BD Flat Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${firstName},

Thank you for registering with BD Flat Hub. To complete your registration, please verify your email address.

Click the link below to verify your email:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with BD Flat Hub, please ignore this email.

Best regards,
The BD Flat Hub Team
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${to}`)
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Send welcome email after email verification
 */
export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const mailOptions = {
    from: `"BD Flat Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to BD Flat Hub!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #5A8FA3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #5A8FA3;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to BD Flat Hub!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>

              <p>Your email has been successfully verified! Welcome to the BD Flat Hub community.</p>

              <p>Here's what you can do now:</p>
              <ul>
                <li>Browse available properties</li>
                <li>Save your favorite properties</li>
                <li>Schedule property visits</li>
                <li>Contact property owners directly</li>
              </ul>

              <a href="${process.env.FRONTEND_URL}/properties" class="button">Browse Properties</a>

              <p>If you have any questions or need assistance, feel free to reach out to us.</p>

              <p>Happy house hunting!<br>The BD Flat Hub Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BD Flat Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${firstName},

Your email has been successfully verified! Welcome to the BD Flat Hub community.

Here's what you can do now:
- Browse available properties
- Save your favorite properties
- Schedule property visits
- Contact property owners directly

Visit ${process.env.FRONTEND_URL}/properties to start browsing.

If you have any questions or need assistance, feel free to reach out to us.

Happy house hunting!
The BD Flat Hub Team
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent to ${to}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    // Don't throw error for welcome email - it's not critical
  }
}
