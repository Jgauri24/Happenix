import nodemailer from "nodemailer";

// Email transporter configuration
const emailConfig = {
  host: "smtp.gmail.com",
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
};

const transporter = nodemailer.createTransport(emailConfig);

// Global flag to track email health
let emailSystemHealthy = false;

export const verifyConnection = async () => {
  try {
    console.log("📧 Verifying email connection...");
    await transporter.verify();
    console.log("✅ Email service ready");
    emailSystemHealthy = true;
    return true;
  } catch (error) {
    console.error("⚠️ Email service failed verification (Timeouts expected on some clouds). Email features will be disabled.");
    // Do NOT log full error stack to keep logs clean
    emailSystemHealthy = false;
    return false;
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (
  userEmail,
  userName,
  eventTitle,
  qrCodeUrl
) => {
  // Fail silently if email system is down to prevent app crashes
  if (!emailSystemHealthy) {
    console.log("Example Email (Service Unavailable):", { to: userEmail, subject: `Booking Confirmed: ${eventTitle}` });
    return;
  }

  try {
    const mailOptions = {
      from: `"Event Discovery" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Booking Confirmed!</h2>
          <p>Hi ${userName},</p>
          <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
          <p>Please find your QR ticket attached or download it from your dashboard.</p>
          <p>We'll send you reminders before the event.</p>
          <p>Thank you for using Event Discovery!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};

/**
 * Send event reminder email
 */
export const sendEventReminder = async (
  userEmail,
  userName,
  eventTitle,
  eventDate,
  eventTime,
  isOnline,
  locationOrLink
) => {
  try {
    const mailOptions = {
      from: `"HappeniX" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Reminder: ${eventTitle} is starting soon!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Event Reminder</h2>
          <p>Hi ${userName},</p>
          <p>Just a reminder that <strong>${eventTitle}</strong> is starting soon!</p>
          <p><strong>Date:</strong> ${new Date(
            eventDate
          ).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          ${
            isOnline
              ? `<p><strong>Join Link:</strong> <a href="${locationOrLink}">${locationOrLink}</a></p>`
              : `<p><strong>Location:</strong> ${locationOrLink}</p>`
          }
          <p>See you there!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event reminder email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending event reminder email:", error);
  }
};

/**
 * Send event update notification
 */
export const sendEventUpdate = async (
  userEmail,
  userName,
  eventTitle,
  updateMessage
) => {
  try {
    const mailOptions = {
      from: `"Event Discovery" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Update: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Event Update</h2>
          <p>Hi ${userName},</p>
          <p>There's an update regarding <strong>${eventTitle}</strong>:</p>
          <p>${updateMessage}</p>
          <p>Please check your dashboard for more details.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event update email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending event update email:", error);
  }
};

