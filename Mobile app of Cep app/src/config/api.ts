import Constants from 'expo-constants';

const FALLBACK_API_URL = 'https://cep-backend-hjfu.onrender.com';
const FALLBACK_GROUP = 'choir';

const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const envUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();
const extraUrl = (extra?.apiBaseUrl || '').trim?.() || '';

const resolvedBaseUrl = (envUrl || extraUrl || FALLBACK_API_URL).replace(/\/$/, '');

export const API_BASE_URL = resolvedBaseUrl;
export const DEFAULT_ADMIN_GROUP: string = extra?.defaultGroup || FALLBACK_GROUP;

export const API_ENDPOINTS = {
  login: '/api/admin/login',
  dashboard: '/api/admin/dashboard',
  members: '/api/admin/members',
  pendingMembers: '/api/admin/members/pending',
  approveMember: (id: string) => `/api/admin/members/${id}/approve`,
  rejectMember: (id: string) => `/api/admin/members/${id}/reject`,
  ideas: '/api/admin/ideas',
  events: '/api/admin/events',
  songs: '/api/admin/songs',
  health: '/health'
} as const;


