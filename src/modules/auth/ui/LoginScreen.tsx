import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLogin } from '@/modules/auth/application/useLogin';
import { ConsentCheckbox } from '@/modules/auth/ui/components/ConsentCheckbox';
import { PasswordField } from '@/modules/auth/ui/components/PasswordField';
import { RegisterModal } from '@/modules/auth/ui/components/RegisterModal';
import { AUTH_ERROR_MESSAGES, FORM_ISSUE_MESSAGES, LOGIN_STRINGS } from '@/modules/auth/ui/strings';
import { STRINGS } from '@/shared/config/strings';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { showComingSoonNotice } from '@/shared/lib/showComingSoonNotice';
import {
  BORDER_WIDTH,
  COLORS,
  DESKTOP_LAYOUT,
  FONT_FAMILY,
  FONT_SIZE,
  LETTER_SPACING,
  LINE_HEIGHT,
  OPACITY,
  RADIUS,
  SPACING,
} from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { TextButton } from '@/shared/ui/atoms/TextButton';
import { TextField } from '@/shared/ui/molecules/TextField';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

const LOGO = require('@/assets/images/logo-asisco-up.png');

// One-off geometry of the mockup (01-Login.html): logo and the two background circles.
const LOGO_WIDTH = 186;
const LOGO_ASPECT_RATIO = 2450 / 900;
const TAGLINE_BAR = { width: 26, height: 4, radius: 2 };
const PRIMARY_CIRCLE = { size: 330, top: -170, left: -60 };
const ACCENT_CIRCLE = { size: 210, top: -90, right: -80 };

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsiveLayout();
  const {
    submit,
    submitAnonymous,
    submitRegister,
    clearFeedback,
    isSubmitting,
    formIssues,
    error,
  } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const emailIssue = formIssues.email ? FORM_ISSUE_MESSAGES[formIssues.email] : null;
  const passwordIssue = formIssues.password ? FORM_ISSUE_MESSAGES[formIssues.password] : null;
  const consentIssue = formIssues.acceptConsent
    ? FORM_ISSUE_MESSAGES[formIssues.acceptConsent]
    : null;
  const formError = !isRegisterOpen && error ? AUTH_ERROR_MESSAGES[error.kind] : null;

  function handleSubmit() {
    submit({ email, password, acceptConsent });
  }

  function handleGuestLogin() {
    submitAnonymous(acceptConsent || true);
  }

  function handleConsentToggle() {
    setAcceptConsent((current) => !current);
    clearFeedback('acceptConsent');
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    clearFeedback('email');
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    clearFeedback('password');
  }

  const circles = (
    <>
      <View style={[styles.circle, styles.primaryCircle]} />
      <View style={[styles.circle, styles.accentCircle]} />
    </>
  );

  const brand = (
    <View style={[styles.brand, isDesktop && styles.desktopBrand]}>
      <Image
        source={LOGO}
        style={[styles.logo, isDesktop && styles.desktopLogo]}
        contentFit="contain"
        accessible
        accessibilityLabel={LOGIN_STRINGS.logoLabel}
      />
      <View style={styles.tagline}>
        <View style={styles.taglineBar} />
        <Text style={styles.taglineText}>{STRINGS.appName}</Text>
      </View>
      {isDesktop && <Text style={styles.brandDescription}>{LOGIN_STRINGS.brandDescription}</Text>}
    </View>
  );

  const screen = (
    <View style={[styles.screen, isDesktop && styles.desktopScreen]}>
      {isDesktop ? (
        <View style={styles.brandPanel}>
          {circles}
          {brand}
        </View>
      ) : (
        circles
      )}

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            isDesktop && styles.desktopContent,
            { paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.s34 },
          ]}
        >
          <View style={styles.topSpacer} />

          {!isDesktop && brand}

          <Text accessibilityRole="header" style={styles.title}>
            {LOGIN_STRINGS.title}
          </Text>

          <View style={styles.card}>
            <TextField
              label={LOGIN_STRINGS.emailLabel}
              placeholder={LOGIN_STRINGS.emailPlaceholder}
              value={email}
              onChangeText={handleEmailChange}
              error={emailIssue ?? error?.fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <PasswordField
              ref={passwordRef}
              label={LOGIN_STRINGS.passwordLabel}
              value={password}
              onChangeText={handlePasswordChange}
              error={passwordIssue ?? error?.fieldErrors.password}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <TextButton
              label={LOGIN_STRINGS.forgotPassword}
              size="small"
              onPress={showComingSoonNotice}
              style={styles.forgotPassword}
            />

            <ConsentCheckbox
              label={LOGIN_STRINGS.consent}
              isChecked={acceptConsent}
              onToggle={handleConsentToggle}
              error={consentIssue ?? error?.fieldErrors.acceptConsent}
            />

            {formError && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.formError}
              >
                {formError}
              </Text>
            )}

            <Button
              label={LOGIN_STRINGS.submit}
              iconRight="arrow-right"
              isLoading={isSubmitting}
              onPress={handleSubmit}
            />
            {isSubmitting && <Text style={styles.slowServer}>{LOGIN_STRINGS.slowServer}</Text>}
          </View>

          <View style={styles.secondaryActions}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{LOGIN_STRINGS.firstTime}</Text>
              <View style={styles.dividerLine} />
            </View>
            <Button
              label={LOGIN_STRINGS.createAccount}
              variant="outline"
              onPress={() => {
                clearFeedback();
                setIsRegisterOpen(true);
              }}
            />
            <TextButton
              label={LOGIN_STRINGS.guest}
              iconRight="arrow-right"
              onPress={handleGuestLogin}
            />
          </View>

          <View style={isDesktop ? styles.topSpacer : styles.bottomSpacer} />

          <Text style={styles.footer}>{LOGIN_STRINGS.footer}</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <RegisterModal
        visible={isRegisterOpen}
        onClose={() => {
          clearFeedback();
          setIsRegisterOpen(false);
        }}
        onSubmit={submitRegister}
        isSubmitting={isSubmitting}
        serverError={error}
        onClearError={() => clearFeedback()}
      />
    </View>
  );

  return isDesktop ? screen : <ResponsiveScreen>{screen}</ResponsiveScreen>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  desktopScreen: {
    flexDirection: 'row',
  },
  brandPanel: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderRightWidth: BORDER_WIDTH.hairline,
    borderRightColor: COLORS.border,
  },
  desktopBrand: {
    alignSelf: 'center',
    maxWidth: DESKTOP_LAYOUT.authFormWidth,
    paddingTop: 0,
  },
  desktopLogo: {
    width: DESKTOP_LAYOUT.brandLogoWidth,
  },
  brandDescription: {
    marginTop: SPACING.s12,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s20,
    lineHeight: LINE_HEIGHT.display,
    color: COLORS.textStrong,
  },
  desktopContent: {
    width: '100%',
    maxWidth: DESKTOP_LAYOUT.authFormWidth,
    alignSelf: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: RADIUS.pill,
  },
  primaryCircle: {
    width: PRIMARY_CIRCLE.size,
    height: PRIMARY_CIRCLE.size,
    top: PRIMARY_CIRCLE.top,
    left: PRIMARY_CIRCLE.left,
    backgroundColor: COLORS.secondary,
    opacity: OPACITY.decorPrimary,
  },
  accentCircle: {
    width: ACCENT_CIRCLE.size,
    height: ACCENT_CIRCLE.size,
    top: ACCENT_CIRCLE.top,
    right: ACCENT_CIRCLE.right,
    backgroundColor: COLORS.accent,
    opacity: OPACITY.decorAccent,
  },
  content: {
    flexGrow: 1,
  },
  topSpacer: {
    flexGrow: 1,
  },
  bottomSpacer: {
    flexGrow: 5,
  },
  brand: {
    paddingTop: SPACING.s56,
    paddingHorizontal: SPACING.s28,
    gap: SPACING.s8,
    alignItems: 'flex-start',
  },
  logo: {
    width: LOGO_WIDTH,
    aspectRatio: LOGO_ASPECT_RATIO,
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
    marginTop: SPACING.s10,
  },
  taglineBar: {
    width: TAGLINE_BAR.width,
    height: TAGLINE_BAR.height,
    borderRadius: TAGLINE_BAR.radius,
    backgroundColor: COLORS.accent,
  },
  taglineText: {
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s13,
    letterSpacing: LETTER_SPACING.wide,
    color: COLORS.primary,
  },
  title: {
    paddingTop: SPACING.s28,
    paddingHorizontal: SPACING.s28,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s27,
    lineHeight: LINE_HEIGHT.display,
    color: COLORS.textTitle,
  },
  card: {
    marginTop: SPACING.s24,
    marginHorizontal: SPACING.s20,
    padding: SPACING.s20,
    gap: SPACING.s14,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.cardLarge,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  formError: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.danger,
  },
  slowServer: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  secondaryActions: {
    paddingTop: SPACING.s20,
    paddingHorizontal: SPACING.s20,
    gap: SPACING.s12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s12,
  },
  dividerLine: {
    flexGrow: 1,
    height: BORDER_WIDTH.hairline,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textTertiary,
  },
  footer: {
    paddingHorizontal: SPACING.s20,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
