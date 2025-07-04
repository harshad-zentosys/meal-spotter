// Email service utility - currently mock implementation
// You can extend this to use actual email providers


interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

import nodemailer from 'nodemailer';
import { configDotenv } from "dotenv";

// Load environment variables
configDotenv();


// Mock email service for development
class MockEmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log("📧 Mock Email Service");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Content:", options.text || options.html);
    console.log("---");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      tls: {
        ciphers: 'SSLv3',
      },
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    } as any);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("✅ Email sent successfully:", info.messageId);

    return true;
  }
}

// You can replace this with actual email service implementations
class EmailService {
  private provider: MockEmailService;

  constructor() {
    this.provider = new MockEmailService();

    // TODO: Replace with actual email service based on environment
    // if (process.env.EMAIL_PROVIDER === 'sendgrid') {
    //   this.provider = new SendGridService();
    // } else if (process.env.EMAIL_PROVIDER === 'ses') {
    //   this.provider = new AWSESService();
    // }
  }

  async sendOTPEmail(
    email: string,
    otp: string,
    purpose: string
  ): Promise<boolean> {
    const subjectMap: Record<string, string> = {
      "mess-owner-signup": "Verify Your Email - Meal Spotter",
      "password-reset": "Reset Your Password - Meal Spotter",
    };

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email - Meal Spotter</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
        background-color: #f3f4f6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #f97316, #dc2626);
        color: #fff;
        text-align: center;
        padding: 20px 20px 30px;
        position: relative;
      }
      .header::before {
        content: "";
        position: absolute;
        top: -50px;
        left: -50px;
        width: 150px;
        height: 150px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        z-index: 0;
      }
      .header img {
        z-index: 1;
        position: relative;
        width: 90px;
        margin-bottom: 10px;
      }
      .header h1 {
        margin: 10px 0 5px;
        font-size: 26px;
        font-weight: 700;
        z-index: 1;
        position: relative;
      }
      .header h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 400;
        opacity: 0.9;
        z-index: 1;
        position: relative;
      }

      .content {
        padding: 30px;
      }
      .content p {
        font-size: 16px;
        margin: 18px 0;
        line-height: 1.6;
      }

      .otp-box {
        text-align: center;
        background-color: #fefefe;
        border: 2px dashed #f97316;
        padding: 30px 20px;
        margin: 25px 0;
        border-radius: 12px;
      }

      .otp-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .otp-code {
        font-size: 40px;
        font-weight: 700;
        color: #dc2626;
        letter-spacing: 12px;
        margin: 10px 0;
      }

      .otp-expire {
        font-size: 13px;
        color: #999;
        margin-top: 10px;
      }

      .warning {
        background: #fff7ed;
        border-left: 5px solid #f59e0b;
        padding: 15px;
        font-size: 14px;
        color: #92400e;
        border-radius: 6px;
        margin: 30px 0;
      }

      .footer {
        text-align: center;
        font-size: 13px;
        color: #888;
        background-color: #f9fafb;
        padding: 20px;
      }

      @media only screen and (max-width: 600px) {
        .otp-code {
          font-size: 30px;
          letter-spacing: 8px;
        }

        .content {
          padding: 20px;
        }

        .header {
          padding: 30px 20px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/davi8is9g/image/upload/v1749313110/logo_transparent_oiddu7.png" alt="Meal Spotter Logo" />
        <h1>Meal'Spotter</h1>
        <h2>Email Verification</h2>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Thank you for joining <strong>Meal'Spotter</strong> as a Mess Owner! To complete your registration, please enter the following code in the verification screen:</p>

        <div class="otp-box">
          <div class="otp-label">Your One-Time Verification Code</div>
          <div class="otp-code">${otp}</div>
          <div class="otp-expire">This code is valid for 10 minutes</div>
        </div>

        <p>If you did not request this, you can safely ignore this message.</p>

        <div class="warning">
          <strong>Security Tip:</strong> Never share this code with anyone. Meal Spotter will never ask for your verification code.
        </div>

        <p>Warm regards,<br><strong>The Meal Spotter Team</strong></p>
      </div>
      <div class="footer">
        This is an automated email. Please do not reply to this message.
      </div>
    </div>
  </body>
</html>
`

    const textTemplate = `
      Meal Spotter - Email Verification
      
      Hello,
      
      Thank you for signing up as a Mess Owner on Meal Spotter!
      
      Your verification code is: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't request this verification, please ignore this email.
      
      Best regards,
      The Meal Spotter Team
    `;

    return this.provider.sendEmail({
      to: email,
      subject: subjectMap[purpose] || "Verification Code - Meal Spotter",
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async sendPlanPurchaseEmail(
    userName: string,
    messName: string,
    planName: string,
    planDescription: string,
    price: number,
    duration: number,
    startDate: string,
    endDate: string,
    dashboardUrl: string,
    email: string
  ): Promise<boolean> {

    const subject = `Purchase Confirmation - ${planName} Plan`;
    const htmlTemplate = `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      .header img {
        width: 70px;
        margin-bottom: 10px;
      }
      .content {
        padding: 30px 20px;
      }
      .highlight {
        background: #ecfdf5;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888;
        padding: 20px;
      }
      .button {
        display: inline-block;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/davi8is9g/image/upload/v1749313110/logo_transparent_oiddu7.png" alt="Meal Spotter Logo" />
        <h1>Meal Spotter</h1>
        <h2>Plan Subscription Confirmed!</h2>
      </div>
      <div class="content">
        <p>Hello <strong>${userName}</strong>,</p>
        <p>
          Thank you for subscribing to a meal plan with <strong>${messName}</strong> on Meal Spotter.
        </p>

        <div class="highlight">
          <h3>Plan Details</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Price:</strong> ₹${price}</p>
          <p><strong>Duration:</strong> ${duration} days</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>End Date:</strong> ${endDate}</p>
        </div>

        <p>
          We hope this plan helps you enjoy regular, delicious, and timely meals! You can manage or cancel your subscription anytime from your dashboard.
        </p>

        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>

        <p style="margin-top: 30px;">
          If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@mealspotter.com">support@mealspotter.com</a>.
        </p>
      </div>
      <div class="footer">
        <p>This is an automated email. Please do not reply.</p>
        <p>© ${new Date().getFullYear()} Meal Spotter. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

    `

    return this.provider.sendEmail({
      to: email,
      subject: subject,
      html: htmlTemplate,
    });
  }

}

// Export singleton instance
export const emailService = new EmailService();

// Example implementations for actual email services:

/*
// SendGrid implementation
class SendGridService {
  private sgMail: any;

  constructor() {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.sgMail = sgMail;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.sgMail.send({
        to: options.to,
        from: process.env.FROM_EMAIL,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }
}

// AWS SES implementation
class AWSESService {
  private ses: any;

  constructor() {
    const AWS = require('aws-sdk');
    this.ses = new AWS.SES({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.ses.sendEmail({
        Source: process.env.FROM_EMAIL,
        Destination: { ToAddresses: [options.to] },
        Message: {
          Subject: { Data: options.subject },
          Body: {
            Html: { Data: options.html },
            Text: { Data: options.text },
          },
        },
      }).promise();
      return true;
    } catch (error) {
      console.error('AWS SES error:', error);
      return false;
    }
  }
}
*/
