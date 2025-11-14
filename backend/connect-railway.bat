@echo off
REM Batch script to connect to Railway MongoDB
REM Usage: connect-railway.bat

echo 🔌 Setting up Railway MongoDB connection...

REM Set Railway MongoDB connection string
set MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database

echo ✅ MONGODB_URI environment variable set!
echo.
echo Available commands:
echo   1. Test connection:     node connect-railway-db.js
echo   2. Seed family admins:  npm run seed:family-admins
echo   3. Seed super admin:    npm run seed:super-admin
echo   4. Seed all admins:     npm run seed:all-admins
echo.
echo Running connection test...
echo.

node connect-railway-db.js

