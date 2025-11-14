require('dotenv').config();
const nodemailer = require('nodemailer');

// In-memory storage for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Create transporter for sending emails
function createTransporter() {
  // Get email credentials from environment variables
  const emailUser = process.env.EMAIL_USER?.trim();
  // Remove spaces from app password (Gmail app passwords are 16 characters without spaces)
  const emailPassword = process.env.EMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '');
  
  if (!emailUser || !emailPassword) {
    console.error('Email configuration missing: EMAIL_USER or EMAIL_APP_PASSWORD not set');
    return null;
  }
  
  // Try port 587 first (TLS), fallback to 465 (SSL) if needed
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    },
    connectionTimeout: 20000, // 20 seconds (increased for Render)
    greetingTimeout: 20000, // 20 seconds
    socketTimeout: 20000, // 20 seconds
    // Retry configuration
    pool: false, // Disable pooling for better compatibility
    maxConnections: 1,
    maxMessages: 1
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
    console.error('Transporter creation failed - EMAIL_USER or EMAIL_APP_PASSWORD not properly configured');
    return { 
      success: false, 
      message: 'Failed to create email transporter. Please check email configuration.' 
    };
  }
  
  console.log('Transporter created successfully');
  console.log('Email user:', process.env.EMAIL_USER?.trim());
  console.log('Email password length:', process.env.EMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '').length);
  
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
    
    // Skip verification if it times out - Render may have network restrictions
    // Verification is optional and sending might still work
    try {
      console.log('Verifying email transporter connection...');
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 5000)
        )
      ]);
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      // If verification times out, continue anyway - sending might still work
      if (verifyError.code === 'ETIMEDOUT' || verifyError.message === 'Verification timeout') {
        console.warn('Verification timed out (this is common on Render), attempting to send email anyway...');
      } else {
        console.warn('Verification failed, but attempting to send email anyway:', verifyError.message);
      }
    }
    
    // Send email with extended timeout for Render
    console.log('Sending email to:', email);
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 30000) // 30 seconds for Render
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification code email:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    console.error('Error command:', error.command);
    console.error('Full error:', error);
    
    let errorMessage = 'Failed to send verification code email.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please verify EMAIL_USER and EMAIL_APP_PASSWORD are correct in Render environment variables.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to Gmail SMTP server. This may be a network issue from Render. Please try again later.';
    } else if (error.code === 'ETIMEDOUT' || error.message === 'Email send timeout' || error.message === 'Verification timeout') {
      errorMessage = 'Email server connection timeout. This may be due to Render network restrictions. Please try again later or contact support.';
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

