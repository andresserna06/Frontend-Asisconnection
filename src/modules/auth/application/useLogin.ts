import { useRef, useState } from 'react';

import type { RegisterCredentials } from '@/modules/auth/domain/AuthService';
import { type AuthError, toAuthError } from '@/modules/auth/domain/models/AuthError';
import type { LoginCredentials, LoginField } from '@/modules/auth/domain/models/LoginCredentials';
import { type LoginFormIssues, validateLoginForm } from '@/modules/auth/domain/validateLoginForm';

import { useAuth } from './AuthProvider';

export function useLogin() {
  const { signIn, signInAnonymous, registerAccount } = useAuth();
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
    if (isSubmittingRef.current || !signInAnonymous) {
      return;
    }
    if (!acceptConsent) {
      setFormIssues({ acceptConsent: 'consentRequired' });
      setError(null);
      return;
    }

    setFormIssues({});
    setError(null);
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await signInAnonymous({ acceptConsent, nickname });
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
    try {
      if (registerAccount) {
        await registerAccount(credentials);
      }
    } catch (caught) {
      setError(toAuthError(caught));
      throw caught;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // Called when the user edits a field: hide the feedback that no longer applies.
  function clearFeedback(field: LoginField) {
    setFormIssues((current) => ({ ...current, [field]: undefined }));
    setError(null);
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
