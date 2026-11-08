import { useMemo } from 'react';

import type { AssistantService } from '@/modules/assistant/domain/AssistantService';
import { useAuthorizedHttpClient } from '@/modules/auth';

import { createAssistantService } from './services/assistantService';

export function useAssistantService(): AssistantService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createAssistantService(client), [client]);
}
