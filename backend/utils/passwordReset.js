require('dotenv').config();
const nodemailer = require('nodemailer');

// In-memory storage for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Create transporter for sending emails
function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('Email configuration missing: EMAIL_USER or EMAIL_APP_PASSWORD not set');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
}

// Generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code to user's email
async function sendVerificationCode(email, code) {
  console.log('=== SENDING VERIFICATION CODE ===');
  console.log('Email:', email);
  console.log('Code:', code);
  console.log('EMAIL_USER configured:', !!process.env.EMAIL_USER);
  console.log('EMAIL_APP_PASSWORD configured:', !!process.env.EMAIL_APP_PASSWORD);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('Email configuration is missing!');
    return { 
      success: false, 
      message: 'Email service is not configured. Please contact the administrator.' 
    };
  }
  
  const transporter = createTransporter();
  
  if (!transporter) {
    return { 
      success: false, 
      message: 'Failed to create email transporter. Please check email configuration.' 
    };
  }
  
  const mailOptions = {
    from: `"Ishyanga Ryera Choir" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #667eea; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Password Reset Verification</h2>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            You requested to reset your password for your Ishyanga Ryera Choir account.
          </p>
          <div style="background-color: #3b82f6; color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h1 style="margin: 0; font-size: 42px; letter-spacing: 12px; font-weight: bold;">${code}</h1>
          </div>
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            Enter this code to reset your password. This code will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you didn't request this code, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Ishyanga Ryera Choir. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Verification Code
      
      You requested to reset your password for your Ishyanga Ryera Choir account.
      
      Your verification code is: ${code}
      
      Enter this code to reset your password. This code will expire in 10 minutes.
      
      If you didn't request this code, please ignore this email.
    `
  };

  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification code email:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    console.error('Full error:', error);
    
    let errorMessage = 'Failed to send verification code email.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check internet connection.';
    } else if (error.response) {
      errorMessage = `Email server error: ${error.response}`;
    } else if (error.message) {
      errorMessage = `Email error: ${error.message}`;
    }
    
    return { success: false, message: errorMessage };
  }
}

// Store verification code with expiration
function storeVerificationCode(email, code) {
  // Normalize email to lowercase for consistency
  const emailLower = email ? email.toLowerCase().trim() : '';
  
  if (!emailLower || !code) {
    console.error('Cannot store verification code: email or code is missing');
    return;
  }
  
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
  verificationCodes.set(emailLower, {
    code: code.toString().trim(),
    expiresAt
  });
  
  console.log('Verification code stored for email:', emailLower, 'expires at:', new Date(expiresAt).toISOString());
  
  // Clean up expired codes
  setTimeout(() => {
    verificationCodes.delete(emailLower);
    console.log('Cleaned up expired code for email:', emailLower);
  }, 10 * 60 * 1000);
}

// Verify the code
function verifyCode(email, code) {
  // Normalize email to lowercase for consistency
  const emailLower = email ? email.toLowerCase().trim() : '';
  
  if (!emailLower || !code) {
    return { success: false, message: 'Email and code are required' };
  }
  
  const stored = verificationCodes.get(emailLower);
  
  if (!stored) {
    console.log('No verification code found for email:', emailLower);
    return { success: false, message: 'No verification code found for this email' };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(emailLower);
    console.log('Verification code expired for email:', emailLower);
    return { success: false, message: 'Verification code has expired' };
  }
  
  if (stored.code !== code.trim()) {
    console.log('Invalid code provided for email:', emailLower);
    return { success: false, message: 'Invalid verification code' };
  }
  
  console.log('Code verified successfully for email:', emailLower);
  return { success: true };
}

// Get verification code for email
function getVerificationCode(email) {
  return verificationCodes.get(email);
}

module.exports = {
  generateVerificationCode,
  sendVerificationCode,
  storeVerificationCode,
  verifyCode,
  getVerificationCode
};

