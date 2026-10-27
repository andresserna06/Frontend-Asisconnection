import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';

// Each weight is loaded as its own family, so use these names instead of fontWeight.
export const FONT_FAMILY = {
  heading: 'Nunito_800ExtraBold',
  headingBold: 'Nunito_700Bold',
  body: 'SourceSans3_400Regular',
  bodySemiBold: 'SourceSans3_600SemiBold',
  bodyBold: 'SourceSans3_700Bold',
} as const;

export const FONT_ASSETS = {
  [FONT_FAMILY.heading]: Nunito_800ExtraBold,
  [FONT_FAMILY.headingBold]: Nunito_700Bold,
  [FONT_FAMILY.body]: SourceSans3_400Regular,
  [FONT_FAMILY.bodySemiBold]: SourceSans3_600SemiBold,
  [FONT_FAMILY.bodyBold]: SourceSans3_700Bold,
};

// Keys mirror the px values in docs/diseno/html so sizes can be copied 1:1.
export const FONT_SIZE = {
  s9_5: 9.5,
  s10: 10,
  s10_5: 10.5,
  s11: 11,
  s11_5: 11.5,
  s12: 12,
  s12_5: 12.5,
  s13: 13,
  s13_5: 13.5,
  s14: 14,
  s14_5: 14.5,
  s15: 15,
  s16: 16,
  s16_5: 16.5,
  s17: 17,
  s18: 18,
  s20: 20,
  s21: 21,
  s22: 22,
  s27: 27,
  s30: 30,
} as const;

export const LINE_HEIGHT = {
  // 27 px title at 1.18.
  display: 32,
  // 22 px name at 1.15.
  name: 25,
  // 14 px post text at 1.42.
  body: 20,
  // 12.5 px note at 1.35.
  note: 17,
} as const;

export const LETTER_SPACING = {
  // 0.14em on 13 px uppercase labels.
  wide: 1.8,
} as const;
