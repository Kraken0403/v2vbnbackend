import nodemailer from 'nodemailer'

export const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // Gmail on 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function sendResetPasswordEmail(
  to: string,
  resetLink: string,
) {
  await mailer.sendMail({
    from: process.env.MAIL_FROM || `"V2VBN" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Reset your V2VBN password',
    html: `
      <div style="font-family: Arial; line-height: 1.6">
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetLink}" style="padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:4px">
            Reset Password
          </a>
        </p>
        <p>This link is valid for 30 minutes.</p>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `,
  })
}
