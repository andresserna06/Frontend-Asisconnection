import type { AuthErrorKind } from '@/modules/auth/domain/models/AuthError';
import type { LoginFormIssue } from '@/modules/auth/domain/validateLoginForm';

// User-facing texts of the auth module (Spanish).
export const LOGIN_STRINGS = {
  logoLabel: 'Asisco UP, Asociación de Interés Social Comunitario',
  title: 'Bienvenido a la\ncomunidad UP',
  emailLabel: 'Correo o documento',
  emailPlaceholder: 'marcela.ramirez@correo.com',
  passwordLabel: 'Contraseña',
  showPassword: 'Mostrar contraseña',
  hidePassword: 'Ocultar contraseña',
  forgotPassword: '¿Olvidaste tu contraseña?',
  submit: 'Iniciar sesión',
  slowServer: 'Conectando… la primera vez puede tardar hasta 30 segundos.',
  firstTime: '¿Primera vez aquí?',
  createAccount: 'Crear cuenta',
  guest: 'Ingresar como invitado',
  footer: 'Fundación ASISCO UP · Manizales',
} as const;

export const FORM_ISSUE_MESSAGES: Record<LoginFormIssue, string> = {
  emailRequired: 'Ingresa tu correo.',
  emailNotEmail: 'Por ahora ingresa con tu correo.',
  passwordRequired: 'Ingresa tu contraseña.',
};

export const AUTH_ERROR_MESSAGES: Record<AuthErrorKind, string> = {
  invalidCredentials: 'Correo o contraseña incorrectos.',
  sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  forbidden: 'No tienes permiso para entrar.',
  network: 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.',
  validation: 'Revisa los datos marcados.',
  unknown: 'Algo salió mal. Inténtalo de nuevo.',
};
