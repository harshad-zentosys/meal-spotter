import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: Boolean(process.env.EMAIL_SERVER_SECURE),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Admin email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mealspotter.com";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || "noreply@mealspotter.com",
}: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export function getInvitationRequestEmailTemplate(
  name: string,
  messName: string
) {
  return `
    <h1>New Mess Owner Registration Request</h1>
    <p>Hello Admin,</p>
    <p>A new request for mess owner registration has been received:</p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Mess Name:</strong> ${messName}</li>
    </ul>
    <p>Please review this request in the admin dashboard.</p>
    <p>Regards,<br>MealSpotter Team</p>
  `;
}

export function getRequestConfirmationEmailTemplate(
  name: string,
  messName: string
) {
  return `
    <h1>Thank You for Your Interest in MealSpotter!</h1>
    <p>Dear ${name},</p>
    <p>We have received your request to register "${messName}" on MealSpotter. 
    Our team will review your request and get back to you shortly.</p>
    <p>If you have any questions, please feel free to contact us.</p>
    <p>Regards,<br>MealSpotter Team</p>
  `;
}

export { ADMIN_EMAIL };
