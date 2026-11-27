import Constants from 'expo-constants';

const FALLBACK_API_URL = 'https://cep-rp-huye-college-yt6x-eight.vercel.app';
const FALLBACK_GROUP = 'choir';

const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const envUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();
const extraUrl = (extra?.apiBaseUrl || '').trim?.() || '';

const resolvedBaseUrl = (envUrl || extraUrl || FALLBACK_API_URL).replace(/\/$/, '');

export const API_BASE_URL = resolvedBaseUrl;
export const DEFAULT_ADMIN_GROUP: string = extra?.defaultGroup || FALLBACK_GROUP;

export const API_ENDPOINTS = {
  // Admin
  login: '/api/admin/login',
  dashboard: '/api/admin/dashboard',
  members: '/api/admin/members',
  pendingMembers: '/api/admin/members/pending',
  approveMember: (id: string) => `/api/admin/members/${id}/approve`,
  rejectMember: (id: string) => `/api/admin/members/${id}/reject`,
  ideas: '/api/admin/ideas',
  events: '/api/admin/events',
  songs: '/api/admin/songs',
  whatsappAdminGroups: '/api/whatsapp/admin/groups',
  whatsappAdminRequests: '/api/whatsapp/admin/requests',
  // Super Admin
  superAdmins: '/api/admin/super-admins',
  createSuperAdmin: '/api/admin/super-admins/create',
  suspendSuperAdmin: (id: string) => `/api/admin/super-admins/${id}/suspend`,
  approveSuperAdmin: (id: string) => `/api/admin/super-admins/${id}/approve`,
  deleteSuperAdmin: (id: string) => `/api/admin/super-admins/${id}`,
  cepMembers: '/api/admin/super-admin/members',
  importCepMembers: '/api/admin/super-admin/members/import',
  globalActivities: '/api/admin/super-admin/home/activities',
  createGlobalActivity: '/api/admin/super-admin/home/activities',
  updateGlobalActivity: (id: string) => `/api/admin/super-admin/home/activities/${id}`,
  deleteGlobalActivity: (id: string) => `/api/admin/super-admin/home/activities/${id}`,
  globalIdeas: '/api/admin/super-admin/home/ideas',
  implementGlobalIdea: (id: string) => `/api/admin/super-admin/home/ideas/${id}/implement`,
  deleteGlobalIdea: (id: string) => `/api/admin/super-admin/home/ideas/${id}`,
  globalSupport: '/api/admin/super-admin/home/support',
  updateGlobalSupport: '/api/admin/super-admin/home/support',
  // Member / user
  userLogin: '/api/auth/login',
  attendanceMe: '/api/attendance/me',
  homeActivities: '/api/home/activities',
  whatsappGroups: '/api/whatsapp/groups',
  health: '/health'
} as const;
