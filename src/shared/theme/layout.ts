// Keys mirror the px values in docs/diseno/html so spacing can be copied 1:1.
export const SPACING = {
  s1: 1,
  s2: 2,
  s3: 3,
  s4: 4,
  s5: 5,
  s6: 6,
  s7: 7,
  s8: 8,
  s9: 9,
  s10: 10,
  s11: 11,
  s12: 12,
  s13: 13,
  s14: 14,
  s16: 16,
  s18: 18,
  s20: 20,
  s24: 24,
  s28: 28,
  s30: 30,
  s34: 34,
  s50: 50,
  s56: 56,
} as const;

export const RADIUS = {
  small: 6,
  control: 10,
  field: 12,
  headerButton: 13,
  button: 14,
  card: 18,
  cardLarge: 22,
  sheet: 24,
  ecosystemCard: 20,
  ecosystemIcon: 18,
  pill: 999,
} as const;

export const SIZE = {
  touchTarget: 44,
  header: 108,
  input: 48,
  button: 52,
  buttonSecondary: 50,
  icon: 20,
  iconSmall: 16,
  iconButton: 19,
  iconTiny: 15,
  avatarLarge: 84,
  avatarSmall: 26,
  avatarAction: 32,
  avatarComment: 38,
  avatarReply: 30,
  avatarComposer: 36,
  likeColumn: 40,
  sheetHandleWidth: 40,
  sheetHandleHeight: 5,
  thumbnail: 72,
  tab: 46,
  ecosystemIcon: 68,
  ecosystemCardMin: 140,
} as const;

export const CONTENT_MAX_WIDTH = 840;
export const TABLET_MIN_WIDTH = 768;
export const DESKTOP_MIN_WIDTH = 1024;
export const DESKTOP_WIDE_MIN_WIDTH = 1280;

export const DESKTOP_LAYOUT = {
  sidebarWidth: 248,
  columnWidth: 720,
  feedWidth: 640,
  asideWidth: 320,
  dialogWidth: 600,
  dialogMaxHeight: 720,
  brandLogoWidth: 320,
  authFormWidth: 460,
  postMediaAspectRatio: 16 / 10,
  postTextMinHeight: 160,
} as const;

export const BORDER_WIDTH = {
  hairline: 1,
  medium: 1.5,
  strong: 2,
  indicator: 3,
  stripe: 4,
} as const;

export const OPACITY = {
  disabled: 0.6,
  pressed: 0.7,
  decorPrimary: 0.14,
  decorAccent: 0.16,
} as const;
