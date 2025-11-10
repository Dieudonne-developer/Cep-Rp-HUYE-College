const nodemailer = require('nodemailer');

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, username, verificationLink, userGroup = 'choir') => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing - EMAIL_USER or EMAIL_APP_PASSWORD not set');
      return {
        success: false,
        message: 'Email configuration not available'
      };
    }

    // Map userGroup to family name
    const familyNames = {
      'cepier': 'CEPier',
      'choir': 'Ishyanga Ryera Choir',
      'anointed': 'Anointed Worship Team',
      'abanyamugisha': 'Abanyamugisha Family',
      'psalm23': 'Psalm 23 Family',
      'psalm46': 'Psalm 46 Family',
      'protocol': 'Protocol Family',
      'social': 'Social Family',
      'evangelical': 'Evangelical Family'
    };

    const familyName = familyNames[userGroup.toLowerCase()] || 'Ishyanga Ryera Choir';

    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');

    const mailOptions = {
      from: `"${familyName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Complete Your Registration - ${familyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Registration</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #4CAF50;
            }
            .header h1 {
              color: #4CAF50;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 16px;
            }
            .content {
              margin-bottom: 30px;
            }
            .welcome {
              background: #e8f5e8;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #4CAF50;
            }
            .welcome h2 {
              color: #2e7d32;
              margin: 0 0 10px 0;
              font-size: 20px;
            }
            .welcome p {
              margin: 0;
              color: #555;
            }
            .cta-button {
              text-align: center;
              margin: 30px 0;
            }
            .cta-button a {
              display: inline-block;
              background: #4CAF50;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
              transition: background 0.3s;
            }
            .cta-button a:hover {
              background: #45a049;
            }
            .instructions {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .instructions h3 {
              color: #333;
              margin: 0 0 15px 0;
              font-size: 18px;
            }
            .instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .instructions li {
              margin-bottom: 8px;
              color: #555;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .link-fallback {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 14px;
              color: #856404;
            }
            .link-fallback strong {
              display: block;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 ${familyName}</h1>
              <p>Complete Your Registration</p>
            </div>
            
            <div class="content">
              <div class="welcome">
                <h2>Welcome, ${username}!</h2>
                <p>Thank you for joining the ${familyName} community. We're excited to have you as part of our family!</p>
              </div>
              
              <p>To complete your registration and access the chat, please set your password by clicking the button below:</p>
              
              <div class="cta-button">
                <a href="${verificationLink}">Set Password & Complete Registration</a>
              </div>
              
              <div class="instructions">
                <h3>What happens next?</h3>
                <ol>
                  <li>Click the "Set Password" button above</li>
                  <li>Choose a secure password (at least 6 characters)</li>
                  <li>Confirm your password</li>
                  <li>Start chatting with fellow choir members!</li>
                </ol>
              </div>
              
              <div class="link-fallback">
                <strong>Button not working?</strong>
                Copy and paste this link into your browser:<br>
                <a href="${verificationLink}" style="color: #4CAF50; word-break: break-all;">${verificationLink}</a>
              </div>
              
              <p><strong>Important:</strong> This link will expire in 24 hours for security reasons. If you need a new link, please contact the ${familyName} administrator.</p>
            </div>
            
            <div class="footer">
              <p>This email was sent by the ${familyName} system.</p>
              <p>If you didn't request this registration, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to ${familyName}!
        
        Hello ${username},
        
        Thank you for joining the ${familyName} community. To complete your registration and access the chat, please set your password by visiting the link below:
        
        ${verificationLink}
        
        What happens next?
        1. Click the link above
        2. Choose a secure password (at least 6 characters)
        3. Confirm your password
        4. Start chatting with fellow members!
        
        Important: This link will expire in 24 hours for security reasons.
        
        If you didn't request this registration, please ignore this email.
        
        Best regards,
        ${familyName} Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'Verification email sent successfully',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, username, resetLink) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return {
        success: false,
        message: 'Email configuration not available'
      };
    }

    const transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: `"Ishyanga Ryera Choir" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - Ishyanga Ryera Choir',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>You requested a password reset for your Ishyanga Ryera Choir account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>Ishyanga Ryera Choir Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Password reset email sent successfully',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: 'Failed to send password reset email',
      error: error.message
    };
  }
};

// Send admin invitation email (for super admin creating admin accounts)
const sendAdminInvitationEmail = async (email, username, passwordSetupLink, adminGroup = 'choir', role = 'admin') => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing - EMAIL_USER or EMAIL_APP_PASSWORD not set');
      return {
        success: false,
        message: 'Email configuration not available'
      };
    }

    // Map userGroup to family name
    const familyNames = {
      'cepier': 'CEPier',
      'choir': 'Ishyanga Ryera Choir',
      'anointed': 'Anointed Worship Team',
      'abanyamugisha': 'Abanyamugisha Family',
      'psalm23': 'Psalm 23 Family',
      'psalm46': 'Psalm 46 Family',
      'protocol': 'Protocol Family',
      'social': 'Social Family',
      'evangelical': 'Evangelical Family'
    };

    const familyName = familyNames[adminGroup.toLowerCase()] || 'Ishyanga Ryera Choir';
    const roleLabels = {
      'admin': 'Administrator',
      'editor': 'Editor',
      'viewer': 'Viewer',
      'super-admin': 'Super Administrator'
    };
    const roleLabel = roleLabels[role.toLowerCase()] || 'Administrator';

    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');

    const mailOptions = {
      from: `"${familyName} Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Admin Account Invitation - ${familyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Account Invitation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #2563eb;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 16px;
            }
            .content {
              margin-bottom: 30px;
            }
            .welcome {
              background: #eff6ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #2563eb;
            }
            .welcome h2 {
              color: #1e40af;
              margin: 0 0 10px 0;
              font-size: 20px;
            }
            .welcome p {
              margin: 0;
              color: #555;
            }
            .role-badge {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .cta-button {
              text-align: center;
              margin: 30px 0;
            }
            .cta-button a {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
              transition: background 0.3s;
            }
            .cta-button a:hover {
              background: #1d4ed8;
            }
            .instructions {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .instructions h3 {
              color: #333;
              margin: 0 0 15px 0;
              font-size: 18px;
            }
            .instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .instructions li {
              margin-bottom: 8px;
              color: #555;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .link-fallback {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 14px;
              color: #856404;
            }
            .link-fallback strong {
              display: block;
              margin-bottom: 5px;
            }
            .security-note {
              background: #fef3c7;
              border: 1px solid #fbbf24;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 14px;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 ${familyName} Admin Portal</h1>
              <p>Admin Account Invitation</p>
            </div>
            
            <div class="content">
              <div class="welcome">
                <h2>Welcome, ${username}!</h2>
                <p>You have been invited to join the ${familyName} administration team.</p>
                <span class="role-badge">${roleLabel}</span>
              </div>
              
              <p>Your admin account has been created. To activate your account and access the admin panel, please set your password by clicking the button below:</p>
              
              <div class="cta-button">
                <a href="${passwordSetupLink}">Set Password & Activate Account</a>
              </div>
              
              <div class="instructions">
                <h3>What happens next?</h3>
                <ol>
                  <li>Click the "Set Password" button above</li>
                  <li>Choose a secure password (at least 6 characters)</li>
                  <li>Confirm your password</li>
                  <li>Log in to the admin panel and start managing ${familyName}</li>
                </ol>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Notice:</strong> This invitation link is unique and will expire in 24 hours. Please keep your password secure and do not share it with anyone.
              </div>
              
              <div class="link-fallback">
                <strong>Button not working?</strong>
                Copy and paste this link into your browser:<br>
                <a href="${passwordSetupLink}" style="color: #2563eb; word-break: break-all;">${passwordSetupLink}</a>
              </div>
              
              <p><strong>Important:</strong> If you did not expect this invitation, please contact the system administrator immediately.</p>
            </div>
            
            <div class="footer">
              <p>This email was sent by the ${familyName} Admin System.</p>
              <p>If you have any questions, please contact your administrator.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Admin Account Invitation - ${familyName}
        
        Hello ${username},
        
        You have been invited to join the ${familyName} administration team as a ${roleLabel}.
        
        Your admin account has been created. To activate your account and access the admin panel, please set your password by visiting the link below:
        
        ${passwordSetupLink}
        
        What happens next?
        1. Click the link above
        2. Choose a secure password (at least 6 characters)
        3. Confirm your password
        4. Log in to the admin panel and start managing ${familyName}
        
        Security Notice: This invitation link is unique and will expire in 24 hours. Please keep your password secure.
        
        If you did not expect this invitation, please contact the system administrator immediately.
        
        Best regards,
        ${familyName} Admin Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin invitation email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'Admin invitation email sent successfully',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error sending admin invitation email:', error);
    return {
      success: false,
      message: 'Failed to send admin invitation email',
      error: error.message
    };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminInvitationEmail,
  createTransporter
};