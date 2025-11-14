import { apiClient, withAdminHeaders } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { AdminAccount, DashboardResponse, Idea, Member } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
  adminGroup?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  admin?: AdminAccount;
}

export const loginRequest = async (payload: LoginPayload): Promise<AdminAccount> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.login, payload);

  if (!response.data.success || !response.data.admin) {
    throw new Error(response.data.message || 'Invalid credentials');
  }

  return response.data.admin;
};

export const fetchDashboard = async (admin: AdminAccount): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>(API_ENDPOINTS.dashboard, {
    headers: withAdminHeaders(admin)
  });
  return response.data;
};

export const fetchMembers = async (admin: AdminAccount): Promise<Member[]> => {
  const response = await apiClient.get<Member[]>(API_ENDPOINTS.members, {
    headers: withAdminHeaders(admin)
  });
  return response.data;
};

export const fetchPendingMembers = async (admin: AdminAccount): Promise<Member[]> => {
  const response = await apiClient.get<Member[]>(API_ENDPOINTS.pendingMembers, {
    headers: withAdminHeaders(admin)
  });
  return response.data;
};

export const approveMember = async (admin: AdminAccount, id: string): Promise<void> => {
  await apiClient.post(
    API_ENDPOINTS.approveMember(id),
    { approvedBy: admin.username },
    { headers: withAdminHeaders(admin) }
  );
};

export const rejectMember = async (admin: AdminAccount, id: string): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.rejectMember(id), {}, { headers: withAdminHeaders(admin) });
};

export const fetchIdeas = async (admin: AdminAccount): Promise<Idea[]> => {
  const response = await apiClient.get<Idea[]>(API_ENDPOINTS.ideas, {
    headers: withAdminHeaders(admin)
  });
  return response.data;
};


