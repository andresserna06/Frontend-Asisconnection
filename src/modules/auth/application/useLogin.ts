import { useRef, useState } from 'react';

import { type AuthError, toAuthError } from '@/modules/auth/domain/models/AuthError';
import type { LoginCredentials, LoginField } from '@/modules/auth/domain/models/LoginCredentials';
import { type LoginFormIssues, validateLoginForm } from '@/modules/auth/domain/validateLoginForm';

import { useAuth } from './AuthProvider';

export function useLogin() {
  const { signIn } = useAuth();
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
      await signIn({ email: credentials.email.trim(), password: credentials.password });
    } catch (caught) {
      setError(toAuthError(caught));
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

  return { submit, clearFeedback, isSubmitting, formIssues, error };
}
