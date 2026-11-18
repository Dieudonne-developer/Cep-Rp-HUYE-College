const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const ChoirUser = require('../models/UserRegistration');
const AnointedUser = require('../models/AnointedUser');
const AbanyamugishaUser = require('../models/AbanyamugishaUser');
const Psalm23User = require('../models/Psalm23User');
const Psalm46User = require('../models/Psalm46User');
const ProtocolUser = require('../models/ProtocolUser');
const SocialUser = require('../models/SocialUser');
const EvangelicalUser = require('../models/EvangelicalUser');
const upload = require('../middleware/upload');
const { sendVerificationEmail } = require('../utils/email');

// User Registration API
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const rawGroup = (req.body.userGroup || req.query.userGroup || '').toLowerCase();
    const userGroup = ['cepier','anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical', 'choir'].includes(rawGroup) ? rawGroup : 'choir';
    const CepierUser = require('../models/CepierUser');
    const UserModel = userGroup === 'cepier' ? CepierUser : userGroup === 'anointed' ? AnointedUser : userGroup === 'abanyamugisha' ? AbanyamugishaUser : userGroup === 'psalm23' ? Psalm23User : userGroup === 'psalm46' ? Psalm46User : userGroup === 'protocol' ? ProtocolUser : userGroup === 'social' ? SocialUser : userGroup === 'evangelical' ? EvangelicalUser : ChoirUser;
    
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Email:', req.body.email);
    console.log('Username:', req.body.username);
    console.log('Profile Image:', req.file ? req.file.filename : 'None');
    
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email: req.body.email.toLowerCase() }, { username: req.body.username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    const emailLower = req.body.email.toLowerCase();
    let usernameToUse = req.body.username;
    if (!usernameToUse || !usernameToUse.trim()) {
      usernameToUse = emailLower;
    }

    // Create user registration (password will be set during verification)
    const userRegistration = new UserModel({
      email: emailLower,
      username: usernameToUse,
      profileImage: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null,
      verificationToken,
      userGroup,
      adminGroup: userGroup,
      role: 'viewer',
      // password will be set during verification process
    });
    
    console.log('Saving user registration:', { 
      email: req.body.email, 
      username: req.body.username, 
      verificationToken,
      profileImage: userRegistration.profileImage 
    });
    await userRegistration.save();
    console.log('User registration saved successfully with ID:', userRegistration._id);
    
    // Send verification email
    console.log('Sending verification email to:', emailLower);
    // Use frontend URL for verification link (not backend URL)
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/choir/set-password?token=${verificationToken}`;
    console.log('Email link:', verificationLink);
    console.log('User group for email:', userGroup);
    
    const displayAs = (req.body.displayAs || '').toLowerCase();
    const emailBrandGroup = displayAs && ['cepier','choir','anointed','abanyamugisha','psalm23','psalm46','protocol','social','evangelical'].includes(displayAs)
      ? displayAs
      : userGroup;
    const emailResult = await sendVerificationEmail(emailLower, usernameToUse, verificationLink, emailBrandGroup);
    
    if (emailResult.success) {
      console.log('Verification email sent successfully');
      res.json({
        success: true,
        message: 'Registration successful! Please check your Gmail for the verification link to set your password.',
        verificationLink: verificationLink,
        token: verificationToken,
        emailSent: true
      });
    } else {
      console.warn('Email sending failed:', emailResult.message);
      // Render free tier blocks SMTP - provide verification link in response
      // This allows users to set password even when email fails
      console.warn('Email sending failed due to Render SMTP blocking. Providing verification link in response as fallback.');
      res.json({
        success: true,
        message: 'Registration successful! Email sending is currently unavailable due to service restrictions. Please use the verification link below to set your password.',
        verificationLink: verificationLink,
        token: verificationToken,
        emailSent: false,
        emailError: emailResult.message,
        note: 'Click the verification link above to set your password. If email service is restored, you will also receive it via email.'
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Email verification endpoint
router.get('/verify', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.query;
    
    console.log('=== VERIFICATION REQUEST ===');
    console.log('Query params:', req.query);
    console.log('Token received:', token);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    
    // If password parameters are present, redirect to set-password endpoint
    if (password || confirmPassword) {
      console.log('Password parameters detected, redirecting to set-password endpoint');
      return res.redirect(`/api/auth/set-password?token=${token}&password=${password}&confirmPassword=${confirmPassword}`);
    }
    
    if (!token) {
      console.log('No token provided');
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Invalid Verification Link</h1>
            <p>The verification link is invalid or has expired.</p>
            <a href="http://10.11.217.77:5173/choir" style="color: #4CAF50; font-size: 18px; text-decoration: none; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Choir Page</a>
          </body>
        </html>
      `);
    }
    
    console.log('Looking up user with token:', token);
    // Search for user across all family models
    const CepierUser = require('../models/CepierUser');
    let user = await ChoirUser.findOne({ verificationToken: token }) ||
               await CepierUser.findOne({ verificationToken: token }) ||
               await AnointedUser.findOne({ verificationToken: token }) ||
               await AbanyamugishaUser.findOne({ verificationToken: token }) ||
               await Psalm23User.findOne({ verificationToken: token }) ||
               await Psalm46User.findOne({ verificationToken: token }) ||
               await ProtocolUser.findOne({ verificationToken: token }) ||
               await SocialUser.findOne({ verificationToken: token }) ||
               await EvangelicalUser.findOne({ verificationToken: token });
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', { 
        email: user.email, 
        username: user.username, 
        isVerified: user.isVerified,
        hasPassword: !!user.password,
        userGroup: user.userGroup || user.adminGroup || 'choir'
      });
    }
    
    // Determine family name and redirect URL based on user's group
    let familyName = 'Ishyanga Ryera Choir';
    let redirectUrl = 'http://10.11.217.77:5173/choir';
    
    if (user) {
      const userGroup = (user.userGroup || user.adminGroup || 'choir').toLowerCase();
      const familyNames = {
        'choir': 'Ishyanga Ryera Choir',
        'anointed': 'Anointed Worship Team',
        'abanyamugisha': 'Abanyamugisha Family',
        'psalm23': 'Psalm 23 Family',
        'psalm46': 'Psalm 46 Family',
        'protocol': 'Protocol Family',
        'social': 'Social Family',
        'evangelical': 'Evangelical Family'
      };
      const redirectUrls = {
        'choir': 'http://10.11.217.77:5173/choir',
        'anointed': 'http://10.11.217.77:5173/anointed',
        'abanyamugisha': 'http://10.11.217.77:5173/abanyamugisha',
        'psalm23': 'http://10.11.217.77:5173/psalm23',
        'psalm46': 'http://10.11.217.77:5173/psalm46',
        'protocol': 'http://10.11.217.77:5173/protocol',
        'social': 'http://10.11.217.77:5173/social',
        'evangelical': 'http://10.11.217.77:5173/evangelical'
      };
      familyName = familyNames[userGroup] || familyName;
      redirectUrl = redirectUrls[userGroup] || redirectUrl;
    }
    
    // If user not found by token, check if token was already used
    if (!user) {
      console.log('User not found with token:', token);
      // Check if this token was used before (user might be already verified)
      const verifiedUser = await ChoirUser.findOne({ verificationToken: null, isVerified: true }) ||
                           await AnointedUser.findOne({ verificationToken: null, isVerified: true }) ||
                           await AbanyamugishaUser.findOne({ verificationToken: null, isVerified: true }) ||
                           await Psalm23User.findOne({ verificationToken: null, isVerified: true }) ||
                           await Psalm46User.findOne({ verificationToken: null, isVerified: true }) ||
                           await ProtocolUser.findOne({ verificationToken: null, isVerified: true }) ||
                           await SocialUser.findOne({ verificationToken: null, isVerified: true }) ||
                           await EvangelicalUser.findOne({ verificationToken: null, isVerified: true });
      
      if (verifiedUser) {
        console.log('Token was likely used already. User appears to be verified but may not have password.');
        // Still show password setup form even if verified (in case password wasn't set)
        user = verifiedUser;
        familyName = (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'anointed' ? 'Anointed Worship Team' :
                    (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'abanyamugisha' ? 'Abanyamugisha Family' :
                    (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'psalm23' ? 'Psalm 23 Family' :
                    (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'psalm46' ? 'Psalm 46 Family' :
                    (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'protocol' ? 'Protocol Family' :
                    (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'social' ? 'Social Family' :
                    (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'evangelical' ? 'Evangelical Family' : 'Ishyanga Ryera Choir';
        redirectUrl = (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'anointed' ? 'http://10.11.217.77:5173/anointed' :
                     (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'abanyamugisha' ? 'http://10.11.217.77:5173/abanyamugisha' :
                     (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'psalm23' ? 'http://10.11.217.77:5173/psalm23' :
                     (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'psalm46' ? 'http://10.11.217.77:5173/psalm46' :
                     (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'protocol' ? 'http://10.11.217.77:5173/protocol' :
                     (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'social' ? 'http://10.11.217.77:5173/social' :
                     (verifiedUser.userGroup || verifiedUser.adminGroup || 'choir').toLowerCase() === 'evangelical' ? 'http://10.11.217.77:5173/evangelical' : 'http://10.11.217.77:5173/choir';
      } else {
        return res.status(400).send(`Invalid Verification Link`);
      }
    }
    
    // Show password setup form regardless of verification status if no password is set
    // Also show form if user is verified but wants to reset/update password
    if (!user.password) {
      console.log('User does not have password, showing password setup form');
    } else if (user.isVerified && user.password) {
      console.log('User is verified and has password, but still showing form for password update');
    }
    
    console.log('Showing password setup form for user:', user.email);
    
    // Get user's family info
    const userGroup = (user.userGroup || user.adminGroup || 'choir').toLowerCase();
    const familyNames = {
      'choir': 'Ishyanga Ryera Choir',
      'anointed': 'Anointed Worship Team',
      'abanyamugisha': 'Abanyamugisha Family',
      'psalm23': 'Psalm 23 Family',
      'psalm46': 'Psalm 46 Family',
      'protocol': 'Protocol Family',
      'social': 'Social Family',
      'evangelical': 'Evangelical Family'
    };
    const redirectUrls = {
      'choir': 'http://10.11.217.77:5173/choir',
      'anointed': 'http://10.11.217.77:5173/anointed',
      'abanyamugisha': 'http://10.11.217.77:5173/abanyamugisha',
      'psalm23': 'http://10.11.217.77:5173/psalm23',
      'psalm46': 'http://10.11.217.77:5173/psalm46',
      'protocol': 'http://10.11.217.77:5173/protocol',
      'social': 'http://10.11.217.77:5173/social',
      'evangelical': 'http://10.11.217.77:5173/evangelical'
    };
    const userFamilyName = familyNames[userGroup] || 'Ishyanga Ryera Choir';
    const userRedirectUrl = redirectUrls[userGroup] || 'http://10.11.217.77:5173/choir';
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Set Password - ${userFamilyName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 0;
            font-size: 16px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: bold;
          }
          .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
          }
          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }
          .btn {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .btn:hover {
            background: #5a6fd8;
          }
          .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .success {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }
          .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Set Your Password</h1>
            <p>Complete your registration for ${userFamilyName}</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">Welcome, <strong>${user.username}</strong>!</p>
          </div>
          
          <form id="passwordForm">
            <div class="form-group">
              <label for="password">New Password:</label>
              <input type="password" id="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
            </div>
            <button type="submit" class="btn">Set Password & Complete Registration</button>
            <div id="message"></div>
          </form>
        </div>
        
        <script>
          document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('message');
            
            if (password !== confirmPassword) {
              messageDiv.innerHTML = '<div class="error">Passwords do not match</div>';
              return;
            }
            
            if (password.length < 6) {
              messageDiv.innerHTML = '<div class="error">Password must be at least 6 characters long</div>';
              return;
            }
            
            try {
              const response = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: '` + token + `',
                  email: '${user.email}',
                  password: password
                })
              });
              
              const data = await response.json();
              
              if (data.success) {
                messageDiv.innerHTML = '<div class="success">Password set successfully! You can now login to the chat.</div>';
                setTimeout(() => {
                  window.location.href = '${userRedirectUrl}';
                }, 2000);
              } else {
                messageDiv.innerHTML = '<div class="error">' + data.message + '</div>';
                // If already verified, redirect to appropriate page after showing message
                if (data.alreadyVerified) {
                  setTimeout(() => {
                    window.location.href = '${userRedirectUrl}';
                  }, 3000);
                }
              }
            } catch (error) {
              messageDiv.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
              console.error('Error:', error);
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #e74c3c;">Verification Error</h1>
          <p>An error occurred during verification. Please try again.</p>
          <a href="http://10.11.217.77:5173/choir" style="color: #4CAF50; font-size: 18px; text-decoration: none; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Choir Page</a>
        </body>
      </html>
    `);
  }
});

// Set password GET endpoint (for redirects from verification)
router.get('/set-password', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Invalid Link</h1>
            <p>No verification token provided.</p>
            <a href="http://10.11.217.77:5173/choir" style="color: #4CAF50; font-size: 18px; text-decoration: none; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Choir Page</a>
          </body>
        </html>
      `);
    }
    
    const user = await ChoirUser.findOne({ verificationToken: token }); // Assuming ChoirUser is the default model
    
    if (!user) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Invalid Token</h1>
            <p>This verification token is invalid or has expired.</p>
            <a href="http://10.11.217.77:5173/choir" style="color: #4CAF50; font-size: 18px; text-decoration: none; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Choir Page</a>
          </body>
        </html>
      `);
    }
    
    if (user.isVerified) {
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #27ae60;">Already Verified</h1>
            <p>Your account is already verified. You can now login to the choir chat.</p>
            <a href="http://10.11.217.77:5173/choir" style="color: #4CAF50; font-size: 18px; text-decoration: none; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">Go to Choir Page</a>
          </body>
        </html>
      `);
    }
    
    // Show password setup form
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Set Password - Ishyanga Ryera Choir</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 0;
            font-size: 16px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: bold;
          }
          .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
          }
          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }
          .btn {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .btn:hover {
            background: #5a6fd8;
          }
          .success {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }
          .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Set Your Password</h1>
            <p>Complete your registration for ${userFamilyName}</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">Welcome, <strong>${user.username}</strong>!</p>
          </div>
          
          <form id="passwordForm">
            <div class="form-group">
              <label for="password">New Password:</label>
              <input type="password" id="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
            </div>
            <button type="submit" class="btn">Set Password & Complete Registration</button>
            <div id="message"></div>
          </form>
        </div>
        
        <script>
          document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('message');
            
            if (password !== confirmPassword) {
              messageDiv.innerHTML = '<div class="error">Passwords do not match</div>';
              return;
            }
            
            if (password.length < 6) {
              messageDiv.innerHTML = '<div class="error">Password must be at least 6 characters long</div>';
              return;
            }
            
            try {
              const response = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: '` + token + `',
                  email: '${user.email}',
                  password: password
                })
              });
              
              const data = await response.json();
              
              if (data.success) {
                messageDiv.innerHTML = '<div class="success">Password set successfully! You can now login to the chat.</div>';
                setTimeout(() => {
                  window.location.href = '${userRedirectUrl}';
                }, 2000);
              } else {
                messageDiv.innerHTML = '<div class="error">' + data.message + '</div>';
                if (data.alreadyVerified) {
                  setTimeout(() => {
                    window.location.href = '${userRedirectUrl}';
                  }, 3000);
                }
              }
            } catch (error) {
              messageDiv.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
              console.error('Error:', error);
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Set password GET error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #e74c3c;">Error</h1>
          <p>An error occurred. Please try again.</p>
          <a href="http://10.11.217.77:5173/choir" style="color: #4CAF50; font-size: 18px; text-decoration: none; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Choir Page</a>
        </body>
      </html>
    `);
  }
});

// User login endpoint for chat (supports all family groups)
router.post('/login', async (req, res) => {
  try {
    const { username, password, userGroup } = req.body;
    
    console.log('=== USER LOGIN REQUEST ===');
    console.log('Username:', username);
    console.log('User Group:', userGroup);
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // If userGroup is provided, ONLY search in that specific model
    // This ensures users can only log in through their own family page
    let user = null;
    let foundGroup = null;
    
    if (userGroup) {
      const requestedGroup = userGroup.toLowerCase();
      const groupModelMap = {
        'choir': ChoirUser,
        'cepier': ChoirUser,
        'anointed': AnointedUser,
        'abanyamugisha': AbanyamugishaUser,
        'psalm23': Psalm23User,
        'psalm46': Psalm46User,
        'protocol': ProtocolUser,
        'social': SocialUser,
        'evangelical': EvangelicalUser
      };
      
      const UserModel = groupModelMap[requestedGroup];
      if (UserModel) {
        user = await UserModel.findOne({
          $or: [{ username }, { email: username }]
        });
        if (user) {
          // Determine the effective group to compare, allowing cepier<->choir alias
          foundGroup = requestedGroup;
          const userActualGroup = (user.userGroup || user.adminGroup || 'choir').toLowerCase();
          if (userActualGroup !== requestedGroup) {
            return res.status(403).json({
              success: false,
              message: `This account belongs to the ${userActualGroup} family. Please log in through the ${userActualGroup} page.`
            });
          }
        } else {
          // User not found in the specified group
          return res.status(401).json({
            success: false,
            message: `Invalid username or password. Please ensure you are logging in through the correct ${userGroup} page.`
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user group specified'
        });
      }
    } else {
      // If userGroup not provided, search all models (backward compatibility)
      const searchResults = await Promise.all([
        ChoirUser.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'choir' })),
        AnointedUser.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'anointed' })),
        AbanyamugishaUser.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'abanyamugisha' })),
        Psalm23User.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'psalm23' })),
        Psalm46User.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'psalm46' })),
        ProtocolUser.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'protocol' })),
        SocialUser.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'social' })),
        EvangelicalUser.findOne({ $or: [{ username }, { email: username }] }).then(u => ({ user: u, group: 'evangelical' }))
      ]);
      
      const found = searchResults.find(r => r.user !== null);
      if (found) {
        user = found.user;
        foundGroup = found.group;
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email and set your password first'
      });
    }
    
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please set your password first by clicking the link in your verification email'
      });
    }
    
    // Check if user is approved by admin
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for approval before accessing the chat.'
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    console.log('User login successful for:', username, 'Group:', foundGroup);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        isApproved: user.isApproved,
        userGroup: foundGroup || (user.userGroup || user.adminGroup || 'choir').toLowerCase()
      }
    });
    
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Set password POST endpoint
router.post('/set-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;
    
    console.log('=== SET PASSWORD POST REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Token:', token);
    console.log('Email:', email);
    console.log('Password length:', password ? password.length : 'undefined');
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    if (!token && !email) {
      return res.status(400).json({
        success: false,
        message: 'Token or email is required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Search for user across all family models by verificationToken first
    const CepierUser = require('../models/CepierUser');
    let user = null;
    if (token) {
      user = await ChoirUser.findOne({ verificationToken: token }) ||
             await CepierUser.findOne({ verificationToken: token }) ||
             await AnointedUser.findOne({ verificationToken: token }) ||
             await AbanyamugishaUser.findOne({ verificationToken: token }) ||
             await Psalm23User.findOne({ verificationToken: token }) ||
             await Psalm46User.findOne({ verificationToken: token }) ||
             await ProtocolUser.findOne({ verificationToken: token }) ||
             await SocialUser.findOne({ verificationToken: token }) ||
             await EvangelicalUser.findOne({ verificationToken: token });
    }
    
    // If not found by token, try to find by email (for verified users whose token was cleared)
    if (!user && email) {
      console.log('User not found by token, searching by email:', email);
      const emailLower = email.toLowerCase().trim();
      user = await ChoirUser.findOne({ email: emailLower }) ||
             await CepierUser.findOne({ email: emailLower }) ||
             await AnointedUser.findOne({ email: emailLower }) ||
             await AbanyamugishaUser.findOne({ email: emailLower }) ||
             await Psalm23User.findOne({ email: emailLower }) ||
             await Psalm46User.findOne({ email: emailLower }) ||
             await ProtocolUser.findOne({ email: emailLower }) ||
             await SocialUser.findOne({ email: emailLower }) ||
             await EvangelicalUser.findOne({ email: emailLower });
    }
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', {
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        hasPassword: !!user.password,
        userGroup: user.userGroup || user.adminGroup || 'choir'
      });
    }
    
    // If user not found, return error
    if (!user) {
      console.log('User not found by token or email.');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email if needed.',
        invalidToken: true
      });
    }
    
    // Allow password setting if user doesn't have a password yet, regardless of verification status
    // Only reject if user is verified AND already has a password set
    if (user.isVerified && user.password && user.password.trim() !== '') {
      console.log('User is already verified and has password set.');
      return res.status(400).json({
        success: false,
        message: 'User is already verified and has a password set. Please use the login page or password reset feature.',
        alreadyVerified: true
      });
    }
    
    // If user is verified but doesn't have a password, allow them to set it
    if (user.isVerified && (!user.password || user.password.trim() === '')) {
      console.log('User is verified but has no password. Allowing password setup.');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user
    user.password = hashedPassword;
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    
    // Determine appropriate message based on role
    const isAdmin = user.role && ['admin', 'super-admin', 'editor'].includes(user.role.toLowerCase());
    const message = isAdmin 
      ? 'Password set successfully! You can now login to the admin panel.'
      : 'Password set successfully! You can now login to the chat.';
    
    res.json({
      success: true,
      message: message
    });
    
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set password',
      error: error.message
    });
  }
});

// Get user profile image by username
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await ChoirUser.findOne({ username }).select('username email profileImage'); // Assuming ChoirUser is the default model
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('=== FORGOT PASSWORD REQUEST ===');
    console.log('Email:', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Search for user across all family models
    const CepierUser = require('../models/CepierUser');
    let user = await ChoirUser.findOne({ email: emailLower }) ||
               await CepierUser.findOne({ email: emailLower }) ||
               await AnointedUser.findOne({ email: emailLower }) ||
               await AbanyamugishaUser.findOne({ email: emailLower }) ||
               await Psalm23User.findOne({ email: emailLower }) ||
               await Psalm46User.findOne({ email: emailLower }) ||
               await ProtocolUser.findOne({ email: emailLower }) ||
               await SocialUser.findOne({ email: emailLower }) ||
               await EvangelicalUser.findOne({ email: emailLower });
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', {
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        userGroup: user.userGroup || user.adminGroup || 'choir'
      });
    }
    
    if (!user) {
      // Don't reveal if email exists for security
      console.log('User not found, but returning success message for security');
      return res.json({
        success: true,
        message: 'If this email exists, a verification code has been sent'
      });
    }
    
    // Generate and send verification code
    const { generateVerificationCode, sendVerificationCode, storeVerificationCode } = require('../utils/passwordReset');
    
    const code = generateVerificationCode();
    console.log('Generated verification code for:', emailLower);
    storeVerificationCode(emailLower, code);
    
    const result = await sendVerificationCode(emailLower, code);
    console.log('Email send result:', result);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Verification code sent to your email'
      });
    } else {
      console.error('Failed to send verification code:', result.message);
      // Render free tier blocks SMTP - provide code in response as fallback
      // This allows users to reset password even when email fails
      console.warn('Email sending failed due to Render SMTP blocking. Providing verification code in response as fallback.');
      res.json({
        success: true, // Still return success so user can proceed
        message: 'Email sending is currently unavailable due to service restrictions. Please use the verification code below to reset your password.',
        emailSent: false,
        verificationCode: code, // Provide code in response as fallback
        codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        note: 'This code will expire in 10 minutes. If email service is restored, you will also receive it via email.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify code endpoint
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }
    
    const { verifyCode } = require('../utils/passwordReset');
    const result = verifyCode(email, code);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Code verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
      error: error.message
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    
    console.log('=== RESET PASSWORD REQUEST ===');
    console.log('Email:', email);
    console.log('Verification code provided:', verificationCode ? 'YES' : 'NO');
    
    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Verify the code
    const { verifyCode } = require('../utils/passwordReset');
    const verifyResult = verifyCode(emailLower, verificationCode);
    
    console.log('Code verification result:', verifyResult);
    
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message
      });
    }
    
    // Find user across all family models and update password
    const CepierUser = require('../models/CepierUser');
    let user = await ChoirUser.findOne({ email: emailLower }) ||
               await CepierUser.findOne({ email: emailLower }) ||
               await AnointedUser.findOne({ email: emailLower }) ||
               await AbanyamugishaUser.findOne({ email: emailLower }) ||
               await Psalm23User.findOne({ email: emailLower }) ||
               await Psalm46User.findOne({ email: emailLower }) ||
               await ProtocolUser.findOne({ email: emailLower }) ||
               await SocialUser.findOne({ email: emailLower }) ||
               await EvangelicalUser.findOne({ email: emailLower });
    
    if (!user) {
      console.log('User not found for password reset');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found, updating password');
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password reset successful for:', emailLower);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
