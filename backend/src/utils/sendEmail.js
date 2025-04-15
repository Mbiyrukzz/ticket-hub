const nodemailer = require('nodemailer')

// Configure the email transport (replace with your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, SendGrid)
  auth: {
    user: process.env.EMAIL_USER, // Your email address (store in .env)
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password (store in .env)
  },
})

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"Ticket Sharing App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error)
    throw new Error('Failed to send email notification')
  }
}

module.exports = { sendEmail }
