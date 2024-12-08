import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailTemplate = 'verify-email' | 'reset-password' | 'welcome' | 'reservation-confirmation'

const templates: Record<EmailTemplate, (params: any) => { subject: string, html: string }> = {
  'verify-email': (params: { name: string; verifyUrl: string }) => ({
    subject: 'Verify your email address',
    html: `
      <div>
        <h1>Welcome to Salmiya Grand Hotel!</h1>
        <p>Hello ${params.name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${params.verifyUrl}">Verify Email Address</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `
  }),
  'reset-password': (params: { name: string; resetUrl: string }) => ({
    subject: 'Reset your password',
    html: `
      <div>
        <h1>Password Reset Request</h1>
        <p>Hello ${params.name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${params.resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `
  }),
  'welcome': (params: { name: string; loginUrl: string }) => ({
    subject: 'Welcome to Salmiya Grand Hotel',
    html: `
      <div>
        <h1>Welcome to Salmiya Grand Hotel!</h1>
        <p>Hello ${params.name},</p>
        <p>Thank you for creating an account with us. You can now:</p>
        <ul>
          <li>Make room reservations</li>
          <li>Order room service</li>
          <li>View your bills and payments</li>
          <li>And much more!</li>
        </ul>
        <p><a href="${params.loginUrl}">Login to your account</a></p>
      </div>
    `
  }),
  'reservation-confirmation': (params: { 
    name: string; 
    reservationId: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    roomNumber: string;
    totalAmount: number;
    advanceAmount: number;
    viewUrl: string;
  }) => ({
    subject: 'Reservation Confirmation - Salmiya Grand Hotel',
    html: `
      <div>
        <h1>Reservation Confirmation</h1>
        <p>Hello ${params.name},</p>
        <p>Your reservation has been confirmed. Here are the details:</p>
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <p><strong>Reservation ID:</strong> ${params.reservationId}</p>
          <p><strong>Check-in:</strong> ${params.checkIn}</p>
          <p><strong>Check-out:</strong> ${params.checkOut}</p>
          <p><strong>Room Type:</strong> ${params.roomType}</p>
          <p><strong>Room Number:</strong> ${params.roomNumber}</p>
          <p><strong>Total Amount:</strong> $${params.totalAmount.toFixed(2)}</p>
          <p><strong>Advance Paid:</strong> $${params.advanceAmount.toFixed(2)}</p>
          <p><strong>Balance Due:</strong> $${(params.totalAmount - params.advanceAmount).toFixed(2)}</p>
        </div>
        <p><a href="${params.viewUrl}">View Reservation Details</a></p>
        <p>We look forward to welcoming you!</p>
      </div>
    `
  })
}

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  params: any
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const { subject, html } = templates[template](params)
    
    console.log('Sending email with Resend:', {
      to,
      template,
      subject
    })
    
    const data = await resend.emails.send({
      from: 'Salmiya Grand Hotel <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '') // Plain text version
    })

    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
