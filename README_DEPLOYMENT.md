# Quick Deployment Reference

## Production URLs

- **Frontend**: https://cep-rp-huye-college.vercel.app
- **Backend**: https://cep-backend-hjfu.onrender.com
- **Database**: Railway MongoDB

## Quick Setup Checklist

### Vercel (Frontend)
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `dist`
- [ ] Add Environment Variable: `VITE_API_BASE_URL=https://cep-backend-hjfu.onrender.com`
- [ ] Deploy

### Render (Backend)
- [ ] Create Web Service (Docker)
- [ ] Set Root Directory: `backend`
- [ ] Set Dockerfile Path: `Dockerfile`
- [ ] Add Environment Variables:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232`
  - `CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app`
  - `FRONTEND_URL=https://cep-rp-huye-college.vercel.app`
- [ ] Deploy

### Railway (Database)
- [ ] Create MongoDB service
- [ ] Copy connection string
- [ ] Use in Render `MONGODB_URI`

## Verification

1. **Frontend**: Visit https://cep-rp-huye-college.vercel.app
2. **Backend**: Visit https://cep-backend-hjfu.onrender.com/health
3. **Login**: Test admin login at https://cep-rp-huye-college.vercel.app/admin/login

## Detailed Guides

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md)
- [Render Deployment](./RENDER_DEPLOYMENT.md)

