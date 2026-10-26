import type { User } from '@/modules/auth/domain/models/User';

// Fictitious test account taken from the login mockup. Not real Foundation data.
export const MOCK_ACCOUNT: { password: string; user: User } = {
  password: 'contrasena',
  user: {
    username: 'marcela.ramirez',
    email: 'marcela.ramirez@correo.com',
    roles: ['ACUDIENTE'],
  },
};

export const MOCK_TOKEN = 'mock-session-token';
