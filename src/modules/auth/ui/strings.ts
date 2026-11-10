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
  consent: 'Acepto el tratamiento de mis datos personales (Ley 1581 de 2012).',
  submit: 'Iniciar sesión',
  slowServer: 'Conectando… la primera vez puede tardar hasta 30 segundos.',
  firstTime: '¿Primera vez aquí?',
  createAccount: 'Crear cuenta',
  guest: 'Ingresar como invitado',
  registerTitle: 'Crear nueva cuenta',
  usernameLabel: 'Nombre de usuario',
  usernamePlaceholder: 'ej. maria.gomez',
  roleLabel: 'Tu rol en la comunidad',
  registerSubmit: 'Registrarme e ingresar',
  registerCancel: 'Cancelar',
  footer: 'Fundación ASISCO UP · Manizales',
  brandDescription: 'Un espacio para compartir, aprender y acompañarnos en comunidad.',
} as const;

export const FORM_ISSUE_MESSAGES: Record<LoginFormIssue, string> = {
  emailRequired: 'Ingresa tu correo.',
  emailNotEmail: 'Por ahora ingresa con tu correo.',
  passwordRequired: 'Ingresa tu contraseña.',
  consentRequired: 'Debes aceptar el tratamiento de datos para ingresar.',
};

export const AUTH_ERROR_MESSAGES: Record<AuthErrorKind, string> = {
  invalidCredentials: 'Correo o contraseña incorrectos.',
  sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  forbidden: 'No tienes permiso para entrar.',
  conflict:
    'Ya existe una cuenta registrada con ese correo electrónico o nombre de usuario. Inicia sesión o usa otro.',
  network: 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.',
  validation: 'Revisa los datos marcados.',
  unknown: 'Algo salió mal. Inténtalo de nuevo.',
};
