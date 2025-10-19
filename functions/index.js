// functions/index.js

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest, onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2/options");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Set the region to match your Firestore location (australia-southeast2)
setGlobalOptions({
  region: "australia-southeast2",
});

// SendGrid API key will be set dynamically in each function that needs it

/**
 * Callable Function - Send custom email (with attachment support)
 * Uses onCall type, automatically handles authentication and CORS
 */
exports.sendCustomEmail = onCall({secrets: ["SENDGRID_API_KEY"]}, async (request) => {
  console.log("📧 sendCustomEmail called");
  
  // Set SendGrid API key from secret
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("❌ SENDGRID_API_KEY is not set");
    throw new Error("Email service is not configured. Please contact administrator.");
  }
  // Remove any whitespace, newlines, or carriage returns from the API key
  const cleanedApiKey = apiKey.trim().replace(/[\r\n]/g, '');
  sgMail.setApiKey(cleanedApiKey);
  
  // Check if user is logged in
  if (!request.auth) {
    console.log("❌ Unauthorized: User not logged in");
    throw new Error("You must be logged in to send emails");
  }
  
  const {to, subject, message, attachments} = request.data;
  
  // Validate required fields
  if (!to || !subject || !message) {
    console.log("❌ Missing required fields");
    throw new Error("Missing required fields: to, subject, or message");
  }
  
  console.log(`📮 Preparing to send email to: ${to}`);
  console.log(`📝 Subject: ${subject}`);
  console.log(`👤 Sender: ${request.auth.token.email}`);
  
  // Build email content
  const msg = {
    to: to,
    from: "1464035670@qq.com", // Must be a verified sender in SendGrid
    subject: `[User Feedback] ${subject}`,
    text: message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #0d6efd; margin-bottom: 20px;">User Feedback</h2>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #0d6efd; margin-bottom: 20px;">
            <strong style="color: #333;">Subject:</strong> ${subject}
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 4px;">
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <div style="color: #666; font-size: 12px;">
            <p><strong>Submitter Information:</strong></p>
            <p>📧 Email: ${request.auth.token.email}</p>
            <p>🕐 Submitted at: ${new Date().toLocaleString('en-AU', {timeZone: 'Australia/Sydney'})}</p>
            <p style="margin-top: 15px; color: #999;">This feedback was submitted via NFP Wellness Platform</p>
          </div>
        </div>
      </div>
    `,
  };
  
  // Add attachments (if any)
  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    console.log(`📎 Includes ${attachments.length} attachment(s)`);
    msg.attachments = attachments.map((att) => ({
      content: att.content,
      filename: att.filename,
      type: att.type,
      disposition: "attachment",
    }));
  }
  
  try {
    const response = await sgMail.send(msg);
    console.log("✅ SendGrid response:", response[0].statusCode);
    console.log("🎉 Email sent successfully!");
    
    return {
      success: true,
      message: "Email sent successfully",
      statusCode: response[0].statusCode,
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    if (error.response) {
      console.error("❌ SendGrid error details:", error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
});