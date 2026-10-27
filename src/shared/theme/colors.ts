// Palette taken from the mockups (docs/diseno/README.md). Contrast is already checked: do not change values.
export const COLORS = {
  primary: '#1F6B65',
  primaryPressed: '#164B47',
  headerButton: '#175650',
  onPrimary: '#FFFFFF',

  secondary: '#2D938B',
  secondarySoft: '#E7F1EF',
  secondaryBorder: '#B9D5D1',
  onSecondarySoft: '#17544F',

  accent: '#F19700',
  accentSoft: '#FDEFD9',
  onAccentSoft: '#8A4E00',
  onAccentSoftStrong: '#6B3D00',

  info: '#2F6AB0',
  infoSoft: '#E3EDF8',
  onInfoSoft: '#1B4677',

  achievement: '#7B4FB0',
  achievementSoft: '#EFE7F7',
  onAchievementSoft: '#4A2A72',

  background: '#F7F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE9DC',
  onSurfaceMuted: '#40514F',
  border: '#E4DED2',
  divider: '#E0D9CC',
  inputBackground: '#F7F4EE',
  inputBorder: '#DDD5C6',

  textTitle: '#16302E',
  // Post body text.
  textBody: '#2E4341',
  text: '#1C2B2A',
  textStrong: '#3E4F4D',
  textSecondary: '#5A6B69',
  textTertiary: '#6B7A78',

  alert: '#D9534F',
  danger: '#8A2F2F',
} as const;

// Forum categories: Avisos, Preguntas, Guías, Logros.
export type CategoryKey = 'announcements' | 'questions' | 'guides' | 'achievements';

type CategoryPalette = {
  // Card stripe.
  main: string;
  soft: string;
  onSoft: string;
  // Solid category label on cards (background and text).
  label: string;
  onLabel: string;
};

// Forum categories always pair color with a text label (never color alone).
export const CATEGORY_COLORS: Record<CategoryKey, CategoryPalette> = {
  announcements: {
    main: COLORS.accent,
    soft: COLORS.accentSoft,
    onSoft: COLORS.onAccentSoft,
    label: COLORS.accent,
    onLabel: COLORS.text,
  },
  questions: {
    main: COLORS.info,
    soft: COLORS.infoSoft,
    onSoft: COLORS.onInfoSoft,
    label: COLORS.info,
    onLabel: COLORS.onPrimary,
  },
  guides: {
    main: COLORS.secondary,
    soft: COLORS.secondarySoft,
    onSoft: COLORS.onSecondarySoft,
    label: COLORS.primary,
    onLabel: COLORS.onPrimary,
  },
  achievements: {
    main: COLORS.achievement,
    soft: COLORS.achievementSoft,
    onSoft: COLORS.onAchievementSoft,
    label: COLORS.achievement,
    onLabel: COLORS.onPrimary,
  },
};
