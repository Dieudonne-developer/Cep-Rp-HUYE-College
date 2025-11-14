import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { AdminAccount } from '@/types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
});

export const withAdminHeaders = (admin?: AdminAccount) => {
  if (!admin) {
    return {};
  }

  return {
    'x-admin-email': admin.email,
    'x-admin-group': admin.adminGroup,
    'x-admin-id': admin.id
  };
};


