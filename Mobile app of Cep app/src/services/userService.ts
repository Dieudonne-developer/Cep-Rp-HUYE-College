import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/api';

export interface MemberUser {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  isApproved?: boolean;
  userGroup?: string;
}

export interface LoginResult {
  accessToken: string;
  user: MemberUser;
}

export const memberLogin = async (username: string, password: string, userGroup: string): Promise<LoginResult> => {
  const res = await apiClient.post(API_ENDPOINTS.userLogin, { username, password, userGroup });
  if (!res.data?.success || !res.data?.accessToken) {
    throw new Error(res.data?.message || 'Login failed');
  }
  return { accessToken: res.data.accessToken, user: res.data.user };
};

export const fetchMyAttendance = async (token: string) => {
  const res = await apiClient.get(API_ENDPOINTS.attendanceMe, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchActivities = async () => {
  const res = await apiClient.get(API_ENDPOINTS.homeActivities);
  const data = res.data;
  return Array.isArray(data) ? data : (data?.events || data?.activities || []);
};

export const fetchWhatsAppGroups = async () => {
  const res = await apiClient.get(API_ENDPOINTS.whatsappGroups);
  return res.data?.groups || [];
};
