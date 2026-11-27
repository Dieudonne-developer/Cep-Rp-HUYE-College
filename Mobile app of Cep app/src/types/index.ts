export type AdminRole = 'admin' | 'super-admin';

export type AdminGroup =
  | 'choir'
  | 'anointed'
  | 'abanyamugisha'
  | 'psalm23'
  | 'psalm46'
  | 'protocol'
  | 'social'
  | 'evangelical'
  | 'cepier';

export interface AdminAccount {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  role: AdminRole;
  adminGroup: AdminGroup | string;
}

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerification: number;
  totalSongs: number;
  totalEvents: number;
  ideas?: number;
  members?: number;
  songs?: number;
  events?: number;
  donations?: number;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentActivity?: any[];
  recentActivities?: any[];
}

export interface Member {
  _id: string;
  email: string;
  username: string;
  profileImage?: string;
  createdAt?: string;
  isApproved?: boolean;
  approvedAt?: string;
  userGroup?: AdminGroup;
}

export interface Idea {
  _id: string;
  idea: string;
  category?: string;
  submittedBy?: string;
  email?: string;
  anonymous?: boolean;
  status?: 'implemented' | 'pending';
  notes?: string;
  implementationDetails?: string;
  implementedDate?: string;
  createdAt?: string;
}


