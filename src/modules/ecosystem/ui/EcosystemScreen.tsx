import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEcosystemLinks } from '@/modules/ecosystem/application/useEcosystemLinks';
import { useEcosystemService } from '@/modules/ecosystem/useEcosystemService';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { EcosystemCard } from './components/EcosystemCard';
import { ECOSYSTEM_STRINGS } from './strings';

// One-off geometry of the banner's decorative circles.
const BANNER_PRIMARY_CIRCLE = { size: 190, top: -70, right: -50 };
const BANNER_ACCENT_CIRCLE = { size: 84, bottom: -30, right: 96 };

export function EcosystemScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsiveLayout();
  const service = useEcosystemService();
  const { findLinkForTitle } = useEcosystemLinks(service);

  const banner = (
    <View
      style={[
        styles.banner,
        isDesktop ? styles.desktopBanner : { paddingTop: insets.top + SPACING.s18 },
      ]}
    >
      <View style={[styles.circle, styles.primaryCircle]} />
      <View style={[styles.circle, styles.accentCircle]} />
      <View style={styles.bannerIcon}>
        <Icon name="grid" size={SIZE.icon} color={COLORS.onPrimary} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {ECOSYSTEM_STRINGS.title}
      </Text>
      <Text style={styles.subtitle}>{ECOSYSTEM_STRINGS.subtitle}</Text>
      <View style={styles.countPill}>
        <Text style={styles.countLabel}>
          {ECOSYSTEM_STRINGS.systemsCount(ECOSYSTEM_STRINGS.items.length)}
        </Text>
      </View>
    </View>
  );

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <FlatList
          // FlatList cannot change numColumns on a mounted instance.
          key={isDesktop ? 'grid' : 'list'}
          numColumns={isDesktop ? 2 : 1}
          columnWrapperStyle={isDesktop ? styles.gridRow : undefined}
          contentContainerStyle={styles.list}
          data={ECOSYSTEM_STRINGS.items}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={banner}
          renderItem={({ item }) => {
            const link = findLinkForTitle(item.title);
            return (
              <EcosystemCard
                item={item}
                onPress={link !== null ? () => void Linking.openURL(link.url) : undefined}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
        />
      </View>
    </ResponsiveScreen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  banner: {
    alignItems: 'flex-start',
    gap: SPACING.s5,
    overflow: 'hidden',
    marginHorizontal: -SPACING.s20,
    marginBottom: SPACING.s16,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: RADIUS.cardLarge,
    borderBottomRightRadius: RADIUS.cardLarge,
  },
  desktopBanner: {
    marginTop: SPACING.s16,
    paddingTop: SPACING.s20,
    borderRadius: RADIUS.cardLarge,
  },
  circle: {
    position: 'absolute',
    borderRadius: RADIUS.pill,
  },
  primaryCircle: {
    width: BANNER_PRIMARY_CIRCLE.size,
    height: BANNER_PRIMARY_CIRCLE.size,
    top: BANNER_PRIMARY_CIRCLE.top,
    right: BANNER_PRIMARY_CIRCLE.right,
    backgroundColor: COLORS.secondary,
  },
  accentCircle: {
    width: BANNER_ACCENT_CIRCLE.size,
    height: BANNER_ACCENT_CIRCLE.size,
    bottom: BANNER_ACCENT_CIRCLE.bottom,
    right: BANNER_ACCENT_CIRCLE.right,
    backgroundColor: COLORS.accent,
  },
  bannerIcon: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.s6,
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.headerButton,
  },
  title: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s27,
  },
  subtitle: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s16,
  },
  countPill: {
    marginTop: SPACING.s8,
    paddingHorizontal: SPACING.s12,
    paddingVertical: SPACING.s5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.headerButton,
  },
  countLabel: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s20,
  },
  gridRow: {
    gap: SPACING.s12,
  },
  separator: {
    height: SPACING.s12,
  },
});
