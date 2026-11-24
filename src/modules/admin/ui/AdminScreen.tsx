import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import { useAdminDashboard } from '@/modules/admin/application/useAdminDashboard';
import type { AdminService } from '@/modules/admin/domain/AdminService';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { useAdminService } from '../useAdminService';
import { ADMIN_STRINGS } from './strings';
import { EcosystemManagementSection } from './components/EcosystemManagementSection';
import { FaqManagementSection } from './components/FaqManagementSection';
import { ModerationSection } from './components/ModerationSection';
import { ModeratorManagementSection } from './components/ModeratorManagementSection';
import { ReportsSection } from './components/ReportsSection';
import { UsersManagementSection } from './components/UsersManagementSection';

const HEADER_ROW_HEIGHT = 66;

type AdminScreenProps = {
  service?: AdminService;
};

export function AdminScreen({ service: serviceOverride }: AdminScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const defaultService = useAdminService();
  const service = serviceOverride ?? defaultService;
  const isAdmin = user?.roles.includes('ADMIN') ?? false;
  const isModerator = user?.roles.includes('MODERATOR') ?? false;
  const canAccessModeration = isAdmin || isModerator;
  const queryClient = useQueryClient();
  // Without this the forum keeps showing its cached list after a decision.
  const handleContentChanged = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    void queryClient.invalidateQueries({ queryKey: ['comments'] });
  }, [queryClient]);
  const dashboard = useAdminDashboard(service, canAccessModeration, isAdmin, handleContentChanged);
  const [headerHeight] = useState(() => new Animated.Value(insets.top + HEADER_ROW_HEIGHT));

  useEffect(() => {
    headerHeight.setValue(insets.top + HEADER_ROW_HEIGHT);
  }, [headerHeight, insets.top]);

  if (!canAccessModeration) {
    return (
      <ResponsiveScreen>
        <View style={[styles.container, styles.unauthorized, { paddingTop: insets.top }]}>
          <Text accessibilityRole="alert" style={styles.unauthorizedText}>
            {ADMIN_STRINGS.unauthorized}
          </Text>
        </View>
      </ResponsiveScreen>
    );
  }

  return (
    <ResponsiveScreen>
      <View style={styles.container}>
        <HeaderTeal
          title={ADMIN_STRINGS.header}
          headerHeight={headerHeight}
          paddingTop={insets.top + SPACING.s8}
          leftAccessory={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ADMIN_STRINGS.back}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
            </Pressable>
          }
          rightAccessory={null}
        />

        <View style={styles.intro}>
          <Text style={styles.introText}>{ADMIN_STRINGS.intro}</Text>
        </View>

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={ADMIN_STRINGS.moderationTab}
            accessibilityState={{ selected: dashboard.section === 'moderation' }}
            onPress={() => dashboard.setSection('moderation')}
            style={[styles.tab, dashboard.section === 'moderation' && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, dashboard.section === 'moderation' && styles.activeTabText]}
            >
              {ADMIN_STRINGS.moderationTab}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={ADMIN_STRINGS.reportsTab}
            accessibilityState={{ selected: dashboard.section === 'reports' }}
            onPress={() => dashboard.setSection('reports')}
            style={[styles.tab, dashboard.section === 'reports' && styles.activeTab]}
          >
            <Text style={[styles.tabText, dashboard.section === 'reports' && styles.activeTabText]}>
              {ADMIN_STRINGS.reportsTab}
            </Text>
          </Pressable>
          {isAdmin ? (
            <>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={ADMIN_STRINGS.usersTab}
                accessibilityState={{ selected: dashboard.section === 'users' }}
                onPress={() => dashboard.setSection('users')}
                style={[styles.tab, dashboard.section === 'users' && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, dashboard.section === 'users' && styles.activeTabText]}
                >
                  {ADMIN_STRINGS.usersTab}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={ADMIN_STRINGS.moderatorsTab}
                accessibilityState={{ selected: dashboard.section === 'moderators' }}
                onPress={() => dashboard.setSection('moderators')}
                style={[styles.tab, dashboard.section === 'moderators' && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    dashboard.section === 'moderators' && styles.activeTabText,
                  ]}
                >
                  {ADMIN_STRINGS.moderatorsTab}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={ADMIN_STRINGS.faqsTab}
                accessibilityState={{ selected: dashboard.section === 'faqs' }}
                onPress={() => dashboard.setSection('faqs')}
                style={[styles.tab, dashboard.section === 'faqs' && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, dashboard.section === 'faqs' && styles.activeTabText]}
                >
                  {ADMIN_STRINGS.faqsTab}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={ADMIN_STRINGS.ecosystemTab}
                accessibilityState={{ selected: dashboard.section === 'ecosystem' }}
                onPress={() => dashboard.setSection('ecosystem')}
                style={[styles.tab, dashboard.section === 'ecosystem' && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    dashboard.section === 'ecosystem' && styles.activeTabText,
                  ]}
                >
                  {ADMIN_STRINGS.ecosystemTab}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>

        {dashboard.section === 'reports' ? (
          <ReportsSection
            reports={dashboard.reports}
            statusFilter={dashboard.reportFilter}
            busyReportId={dashboard.busyReportId}
            operationError={dashboard.operationError}
            onStatusFilterChange={dashboard.setReportFilter}
            onRetry={() => void dashboard.loadReports()}
            onResolve={(report, decision) => void dashboard.resolveReport(report, decision)}
          />
        ) : dashboard.section === 'users' && isAdmin ? (
          <ScrollView
            contentContainerStyle={styles.moderatorScroll}
            showsVerticalScrollIndicator={false}
          >
            <UsersManagementSection
              users={dashboard.users}
              busyUserId={dashboard.busyUserId}
              operationError={dashboard.operationError}
              onSearch={(query) => void dashboard.loadUsers(query)}
              onUpdateStatus={dashboard.updateUserStatus}
              onToggleModerator={dashboard.toggleUserModerator}
              onRetry={() => void dashboard.loadUsers()}
            />
          </ScrollView>
        ) : dashboard.section === 'faqs' && isAdmin ? (
          <ScrollView
            contentContainerStyle={styles.moderatorScroll}
            showsVerticalScrollIndicator={false}
          >
            <FaqManagementSection
              faqs={dashboard.faqs}
              busyFaqId={dashboard.busyFaqId}
              isSavingFaq={dashboard.isSavingFaq}
              operationError={dashboard.operationError}
              onCreate={dashboard.createFaq}
              onUpdate={dashboard.updateFaq}
              onDelete={dashboard.deleteFaq}
              onRetry={() => void dashboard.loadFaqs()}
            />
          </ScrollView>
        ) : dashboard.section === 'ecosystem' && isAdmin ? (
          <ScrollView
            contentContainerStyle={styles.moderatorScroll}
            showsVerticalScrollIndicator={false}
          >
            <EcosystemManagementSection
              links={dashboard.ecosystemLinks}
              busyLinkId={dashboard.busyEcosystemLinkId}
              isSavingLink={dashboard.isSavingEcosystemLink}
              operationError={dashboard.operationError}
              onCreate={dashboard.createEcosystemLink}
              onUpdate={dashboard.updateEcosystemLink}
              onDelete={dashboard.deleteEcosystemLink}
              onRetry={() => void dashboard.loadEcosystemLinks()}
            />
          </ScrollView>
        ) : dashboard.section === 'moderation' || !isAdmin ? (
          <ModerationSection
            queue={dashboard.queue}
            filter={dashboard.filter}
            isLoadingMore={dashboard.isLoadingMore}
            loadMoreError={dashboard.loadMoreError}
            operationError={dashboard.operationError}
            onFilterChange={dashboard.setFilter}
            onRetry={() => void dashboard.loadQueue()}
            onLoadMore={() => void dashboard.loadMore()}
            onDecide={(item, decision) => void dashboard.updateModerationStatus(item, decision)}
            onLoadRemovalTarget={service.getRemovalTarget}
            onResolveRemoval={(item, shouldHide) =>
              void dashboard.resolveRemovalRequest(item, shouldHide)
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.moderatorScroll}
            showsVerticalScrollIndicator={false}
          >
            <ModeratorManagementSection
              moderators={dashboard.moderators}
              searchResults={dashboard.searchResults}
              busyModeratorId={dashboard.busyModeratorId}
              isAssigningModerator={dashboard.isAssigningModerator}
              operationError={dashboard.operationError}
              onSearch={service.searchAccounts ? dashboard.searchAccounts : undefined}
              onAssign={dashboard.assignModerator}
              onRevoke={dashboard.revokeModerator}
              onRetry={() => void dashboard.loadModerators()}
            />
          </ScrollView>
        )}
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  unauthorized: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.s24,
  },
  unauthorizedText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s16,
    textAlign: 'center',
  },
  backButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.headerButton,
  },
  pressed: {
    opacity: 0.7,
  },
  intro: {
    paddingHorizontal: SPACING.s20,
    paddingVertical: SPACING.s12,
  },
  introText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s14,
  },
  tab: {
    minWidth: 96,
    flexGrow: 1,
    minHeight: SIZE.touchTarget,
    paddingHorizontal: SPACING.s10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.surface,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  activeTabText: {
    color: COLORS.onPrimary,
  },
  moderatorScroll: {
    paddingTop: SPACING.s2,
  },
});
