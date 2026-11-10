import { useRef, useState } from 'react';

import type { RegisterCredentials } from '@/modules/auth/domain/AuthService';
import { type AuthError, toAuthError } from '@/modules/auth/domain/models/AuthError';
import type { LoginCredentials, LoginField } from '@/modules/auth/domain/models/LoginCredentials';
import { type LoginFormIssues, validateLoginForm } from '@/modules/auth/domain/validateLoginForm';

import { useAuth } from './AuthProvider';

export function useLogin() {
  const { signIn, signInAnonymous, registerAccount, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formIssues, setFormIssues] = useState<LoginFormIssues>({});
  const [error, setError] = useState<AuthError | null>(null);
  // A ref (not state) so a fast double tap cannot send two requests.
  const isSubmittingRef = useRef(false);

  async function submit(credentials: LoginCredentials) {
    if (isSubmittingRef.current) {
      return;
    }
    const issues = validateLoginForm(credentials);
    setFormIssues(issues);
    setError(null);
    if (Object.keys(issues).length > 0) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await signIn({ ...credentials, email: credentials.email.trim() });
    } catch (caught) {
      setError(toAuthError(caught));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function submitAnonymous(acceptConsent: boolean, nickname?: string) {
    if (isSubmittingRef.current) {
      return;
    }
    if (!acceptConsent) {
      setFormIssues({ acceptConsent: 'consentRequired' });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormIssues({});
    setError(null);
    try {
      if (signInAnonymous) {
        await signInAnonymous({
          acceptConsent: true,
          nickname: nickname?.trim() || 'Invitado',
          roleTag: 'BENEFICIARIO',
        });
      }
    } catch (caught) {
      setError(toAuthError(caught));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function submitRegister(credentials: RegisterCredentials) {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormIssues({});
    setError(null);
    try {
      if (registerAccount) {
        await registerAccount(credentials);
      } else if (register) {
        await register(credentials);
      }
    } catch (caught) {
      const authError = toAuthError(caught);
      setError(authError);
      throw authError;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // Called when the user edits a field: hide the feedback that no longer applies.
  function clearFeedback(field?: LoginField) {
    setError(null);
    if (field) {
      setFormIssues((current) => ({ ...current, [field]: undefined }));
    }
  }

  return {
    submit,
    submitAnonymous,
    submitRegister,
    clearFeedback,
    isSubmitting,
    formIssues,
    error,
  };
}
