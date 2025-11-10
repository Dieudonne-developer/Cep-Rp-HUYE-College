# Ishyangaryera Choir - Admin Guide

## 🎯 Quick Access

### Admin Login
- **URL**: http://10.11.217.77:5173/choir/admin/login
- **Email**: admin@ishyangaryera.com
- **Username**: admin
- **Password**: admin123

---

## 📋 Admin Features

### 1. Dashboard
- **URL**: http://10.11.217.77:5173/choir/admin/dashboard
- Overview of choir statistics
- Total users, songs, events
- Recent activity

### 2. Member Management (APPROVE USERS)
- **URL**: http://10.11.217.77:5173/choir/admin/members
- **Key Feature**: Approve pending users who want to access the chat
- View all registered members
- Approve/Reject user registration requests
- Two tabs:
  - **Pending Approval**: Users waiting for admin approval
  - **All Members**: All registered and approved members

### 3. Events Management
- **URL**: http://10.11.217.77:5173/choir/admin/events
- Create and manage choir events
- Upcoming performances, rehearsals, etc.

### 4. Songs Management
- **URL**: http://10.11.217.77:5173/choir/admin/songs
- Upload and manage choir songs
- Audio files and metadata

### 5. Ideas Review
- **URL**: http://10.11.217.77:5173/choir/admin/ideas
- Review and manage user-submitted ideas
- Implement selected ideas

---

## ✅ How to Approve Users

1. **Login** to the admin panel at http://10.11.217.77:5173/choir/admin/login
2. Navigate to **Members** page
3. You'll see two tabs:
   - **Pending Approval** (shows count badge)
   - **All Members**
4. Click on **Pending Approval** tab
5. You'll see list of users waiting for approval with:
   - Username
   - Email
   - Profile image
   - Registration date
   - Status: "Pending"
6. For each user, you have two actions:
   - **✓ Approve** (Green checkmark) - Allows user to login and access chat
   - **✗ Reject** (Red X) - Rejects the user's request
7. Click **✓ Approve** to approve users
8. Approved users can now login to access the choir chat

---

## 🔐 User Login Process

Users must be approved before they can access the chat:

1. **User registers** → Account created (unapproved)
2. **User verifies email** and sets password
3. **User tries to login** → Gets message: "Your account is pending admin approval..."
4. **Admin approves** → User can now login
5. **User logs in again** → Can access chat successfully

---

## ⚠️ Security Notes

1. **Change the default password** after first login
2. Only approve legitimate choir members
3. Review user profiles before approving
4. Keep admin credentials secure

---

## 🔄 Resetting Admin Password

If you need to reset the admin user, run:
```bash
cd backend
node seed-admin.js
```

This will create the admin user if it doesn't exist (or notify if it already exists).

---

## 📞 Support

For issues or questions:
- Check backend logs in the terminal
- Check browser console for frontend errors
- Verify MongoDB connection

---

## 🎵 Welcome to Ishyangaryera Choir Admin Panel!

You now have full control over the choir management system.


