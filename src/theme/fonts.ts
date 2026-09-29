/**
 * Locally bundled typefaces.
 *
 * Both families ship as static TTFs via @expo-google-fonts, so they render
 * identically on web / iOS / Android / Expo Go and work with no network.
 * Inter is also referenced by `src/global.css` for raw HTML text.
 */

import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/** Space Grotesk — geometric display face for headlines and numerals. */
export const displayFonts = {
  'SpaceGrotesk_300Light': SpaceGrotesk_300Light,
  'SpaceGrotesk_400Regular': SpaceGrotesk_400Regular,
  'SpaceGrotesk_500Medium': SpaceGrotesk_500Medium,
  'SpaceGrotesk_600SemiBold': SpaceGrotesk_600SemiBold,
  'SpaceGrotesk_700Bold': SpaceGrotesk_700Bold,
};

/** Inter — legible UI/body face. */
export const bodyFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

export const appFontMap = { ...displayFonts, ...bodyFonts };
