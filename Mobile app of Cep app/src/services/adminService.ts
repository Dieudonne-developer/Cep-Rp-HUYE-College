import { apiClient, withAdminHeaders } from '@/services/apiClient';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';
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



// ===== Extended admin endpoints =====
export const fetchEvents = async (admin: AdminAccount) => {
  const res = await apiClient.get<any[]>(API_ENDPOINTS.events, { headers: withAdminHeaders(admin) });
  const d:any=res.data; return Array.isArray(d) ? d : (d?.events || []);
};
export const createEvent = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.post(API_ENDPOINTS.events, data, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const deleteEvent = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_ENDPOINTS.events}/${id}`, { headers: withAdminHeaders(admin) });
};

export const fetchSongs = async (admin: AdminAccount) => {
  const res = await apiClient.get<any[]>(API_ENDPOINTS.songs, { headers: withAdminHeaders(admin) });
  const d:any=res.data; return Array.isArray(d) ? d : (d?.songs || []);
};
export const deleteSong = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_ENDPOINTS.songs}/${id}`, { headers: withAdminHeaders(admin) });
};

export const fetchSupportItems = async (admin: AdminAccount) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/admin/support-items?group=${admin.adminGroup}`, { headers: withAdminHeaders(admin) });
  return res.data?.items || res.data || [];
};
export const createSupportItem = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.post(`${API_BASE_URL}/api/admin/support-items`, { group: admin.adminGroup, ...data }, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const deleteSupportItem = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_BASE_URL}/api/admin/support-items/${id}?group=${admin.adminGroup}`, { headers: withAdminHeaders(admin) });
};

export const fetchWhatsAppGroups = async (admin: AdminAccount) => {
  const res = await apiClient.get(API_ENDPOINTS.whatsappAdminGroups, { headers: withAdminHeaders(admin) });
  return res.data?.groups || [];
};
export const fetchWhatsAppRequests = async (admin: AdminAccount) => {
  const res = await apiClient.get(API_ENDPOINTS.whatsappAdminRequests, { headers: withAdminHeaders(admin) });
  return res.data?.requests || [];
};
export const decideWhatsAppRequest = async (admin: AdminAccount, id: string, approve: boolean) => {
  await apiClient.post(`${API_ENDPOINTS.whatsappAdminRequests}/${id}/decision`, { approve }, { headers: withAdminHeaders(admin) });
};

export const fetchAttendanceSessions = async (admin: AdminAccount) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/attendance/sessions?group=${admin.adminGroup}`, { headers: withAdminHeaders(admin) });
  return res.data?.sessions || [];
};
export const createAttendanceSession = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.post(`${API_BASE_URL}/api/attendance/sessions`, data, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const deleteAttendanceSession = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_BASE_URL}/api/attendance/sessions/${id}`, { headers: withAdminHeaders(admin) });
};
export const fetchAttendanceRoster = async (admin: AdminAccount, sessionId: string) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/attendance/sessions/${sessionId}/roster`, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const saveAttendanceRecords = async (admin: AdminAccount, sessionId: string, records: any[]) => {
  const res = await apiClient.put(`${API_BASE_URL}/api/attendance/sessions/${sessionId}/records`, { records }, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const createSinger = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.post(`${API_BASE_URL}/api/attendance/singers`, data, { headers: withAdminHeaders(admin) });
  return res.data;
};

export const fetchSuperAdmins = async (admin: AdminAccount) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/admin/super-admins`, { headers: withAdminHeaders(admin) });
  return res.data?.admins || [];
};
export const createSuperAdmin = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.post(`${API_BASE_URL}/api/admin/super-admins/create`, data, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const deleteSuperAdmin = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_BASE_URL}/api/admin/super-admins/${id}`, { headers: withAdminHeaders(admin) });
};
export const fetchGlobalActivities = async (admin: AdminAccount) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/admin/super-admin/home/activities`, { headers: withAdminHeaders(admin) });
  return res.data?.events || [];
};
export const createGlobalActivity = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.post(`${API_BASE_URL}/api/admin/super-admin/home/activities`, data, { headers: withAdminHeaders(admin) });
  return res.data;
};
export const deleteGlobalActivity = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_BASE_URL}/api/admin/super-admin/home/activities/${id}`, { headers: withAdminHeaders(admin) });
};
export const fetchGlobalIdeas = async (admin: AdminAccount) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/admin/super-admin/home/ideas`, { headers: withAdminHeaders(admin) });
  return res.data?.ideas || [];
};
export const implementGlobalIdea = async (admin: AdminAccount, id: string) => {
  await apiClient.put(`${API_BASE_URL}/api/admin/super-admin/home/ideas/${id}/implement`, {}, { headers: withAdminHeaders(admin) });
};
export const deleteGlobalIdea = async (admin: AdminAccount, id: string) => {
  await apiClient.delete(`${API_BASE_URL}/api/admin/super-admin/home/ideas/${id}`, { headers: withAdminHeaders(admin) });
};
export const fetchGlobalSupport = async (admin: AdminAccount) => {
  const res = await apiClient.get(`${API_BASE_URL}/api/admin/super-admin/home/support`, { headers: withAdminHeaders(admin) });
  return res.data?.support || {};
};
export const saveGlobalSupport = async (admin: AdminAccount, data: any) => {
  const res = await apiClient.put(`${API_BASE_URL}/api/admin/super-admin/home/support`, data, { headers: withAdminHeaders(admin) });
  return res.data;
};
