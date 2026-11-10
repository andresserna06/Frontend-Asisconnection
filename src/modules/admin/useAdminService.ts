import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { AdminService } from './domain/AdminService';
import { createAdminService } from './services/adminService';

export function useAdminService(): AdminService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createAdminService(client), [client]);
}
