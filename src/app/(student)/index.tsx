import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import {
    loadSchedulePrefsForStudent,
    SchedulePrefs,
} from '@/components/schedule-onboarding-wizard';
import { Spatial360Viewer } from '@/components/spatial-360-viewer';
import {
    GlassAvatar,
    GlassBadge,
    GlassButton,
    GlassCard,
    GlassView
} from '@/components/ui/glass-components';
import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { DataService } from '@/services/data-service';
import { SEED_360_LOCATIONS } from '@/services/seed-data';
import {
    getTodayLiveSchedule,
    TIMETABLE_BRANCHES,
    TimetableEntry,
} from '@/services/timetable-data';
import { Campus360Location, Notice, Order, TimetableSlot } from '@/types';

// ─── Live Pulse Dot (for dashboard) ──────────────────────────────────────────
function PulseDotHome({ color }: { color: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.9, duration: 950, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 950, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.15, duration: 950, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.8, duration: 950, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 10, height: 10, borderRadius: 5,
        backgroundColor: color, opacity: opacityAnim, transform: [{ scale: pulse }],
      }} />
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

// ─── Quick Action Pill ───────────────────────────────────────────────────────
function QuickActionPill({ icon, label, subLabel, onPress, color }: {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionPill,
        pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
        { borderColor: `${color}40` },
      ]}
      onPress={onPress}
    >
      <View style={[styles.actionIconBox, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <Text style={styles.actionPillBold}>{label}</Text>
      <Text style={[styles.actionPillMuted, { color: Glass.textMuted }]}>{subLabel}</Text>
    </Pressable>
  );
}

export default function StudentHomeScreen() {
  const router = useRouter();
  const { profile, college } = useAuth();
  const { glass } = useAppTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [active360Modal, setActive360Modal] = useState<Campus360Location | null>(null);
  const [schedulePrefs, setSchedulePrefs] = useState<SchedulePrefs | null>(null);
  const [now, setNow] = useState(new Date());

  // Refresh clock every 60s
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Load schedule prefs, or infer from the student's PRN / roll number if available
  useEffect(() => {
    const hydrateSchedulePrefs = async () => {
      const prnCandidate = profile?.registrationId || profile?.rollNumber || profile?.studentId || '';
      const resolved = await loadSchedulePrefsForStudent(prnCandidate);
      if (resolved) setSchedulePrefs(resolved);
    };

    hydrateSchedulePrefs();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!college) return;
    try {
      const ords = await DataService.getOrders(college.id, profile?.uid);
      setOrders(ords);

      const tt = await DataService.getTimetable(
        college.id,
        profile?.department || 'Information Technology',
        profile?.year || '3rd Year',
        profile?.division || 'Div A',
        1 // Monday
      );
      setTimetable(tt);

      const nots = await DataService.getNotices(college.id);
      setNotices(nots);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [college, profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Live schedule data from new timetable system
  const liveSchedule = schedulePrefs
    ? getTodayLiveSchedule(schedulePrefs.branchId, schedulePrefs.divisionId, schedulePrefs.batchId)
    : null;

  const liveClass: TimetableEntry | null = liveSchedule?.ongoing || liveSchedule?.upcoming[0] || null;
  const isOngoing = !!liveSchedule?.ongoing;

  // Branch color for accents
  const branch = schedulePrefs
    ? TIMETABLE_BRANCHES.find((b) => b.branchId === schedulePrefs.branchId)
    : null;
  const branchColor = branch?.color || glass.purpleBright;

  // Fallback next class from old timetable
  const nextClass = timetable[0] || {
    subject: 'Database Management Systems',
    room: 'IT-204',
    facultyName: 'Prof. Sneha Deshmukh',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
  };

  // Active order to track (latest order that is not completed)
  const activeOrder =
    orders.find((o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled') ||
    orders[0];

  const getStepState = (currentStatus: string, stepName: string) => {
    const sequence = ['placed', 'accepted', 'preparing', 'ready', 'completed'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepName);
    return currentIndex >= stepIndex;
  };

  const open360Spot = (spotId?: string) => {
    const defaultSpot: Campus360Location = {
      id: 'loc_360_jspm_main',
      collegeId: college?.id || 'col_jspm_tathawade',
      name: 'Explore JSPM in 360°',
      description: 'Immersive 360° Clear Pano spatial tour of JSPM Tathawade Campus',
      category: 'Campus Tour',
      thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80',
      embedUrl: 'https://tours.clearpano.com/I4EFHxcx',
      externalUrl: 'https://tours.clearpano.com/I4EFHxcx',
      active: true,
      displayOrder: 0,
    };
    const target =
      SEED_360_LOCATIONS.find((l) => l.id === spotId) ||
      SEED_360_LOCATIONS[0] ||
      defaultSpot;

    setActive360Modal(target);
  };

  return (
    <View style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={glass.purpleBright}
          />
        }
      >
        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.collegeTag}>
              {college?.shortName ? college.shortName.toUpperCase() : 'JSPM TATHAWADE'} • PUNE
            </Text>
            <Text style={styles.greetingTitle}>
              Hey, {profile?.name?.split(' ')[0] || 'Aarav'}
            </Text>
            <Text style={styles.dateSubtitle}>Monday, 21 September · make it count</Text>
          </View>

          <Pressable
            style={[styles.avatarCircle, { borderColor: glass.purple }]}
            onPress={() => router.push('/(student)/profile' as any)}
          >
            <GlassAvatar initials={profile?.name?.charAt(0).toUpperCase() || 'A'} size="md" ringColor={glass.purple} />
          </Pressable>
        </View>

        {/* ACADEMIC IDENTITY CARD */}
        <GlassCard variant="elevated" style={styles.academicCard}>
          <Text style={styles.academicCollegeName}>
            {college?.name || "JSPM's Tathawade Technical Campus"}
          </Text>
          <Text style={[styles.academicMeta, { color: glass.purple }]}>
            {profile?.department || 'Information Technology'} · {profile?.year || '3rd Year'} ·{' '}
            {profile?.division || 'Div A'}
          </Text>
        </GlassCard>

        {/* 4 QUICK ACTION PILLS */}
        <View style={styles.quickActionsRow}>
          <QuickActionPill
            icon={<Ionicons name="compass" size={24} color={glass.purple} />}
            label="Explore"
            subLabel="Campus"
            onPress={() => router.push('/(student)/campus' as any)}
            color={glass.purple}
          />

          <QuickActionPill
            icon={<Ionicons name="image" size={22} color={glass.teal} />}
            label="360°"
            subLabel="Campus"
            onPress={() => open360Spot('loc_360_it204')}
            color={glass.teal}
          />

          <QuickActionPill
            icon={<Ionicons name="restaurant" size={22} color={glass.gold} />}
            label="Order"
            subLabel="Canteen"
            onPress={() => router.push('/(student)/canteen' as any)}
            color={glass.gold}
          />

          <QuickActionPill
            icon={<Ionicons name="calendar" size={22} color={glass.info} />}
            label="My"
            subLabel="Schedule"
            onPress={() => router.push('/(student)/schedule' as any)}
            color={glass.info}
          />
        </View>

        {/* LIVE CLASS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isOngoing && <PulseDotHome color={branchColor} />}
            <Text style={styles.sectionTitle}>
              {liveClass ? (isOngoing ? 'Happening now' : 'Next up') : 'No classes'}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(student)/schedule' as any)}>
            <Text style={styles.sectionLink}>Full schedule</Text>
          </Pressable>
        </View>

        {liveClass ? (
          <GlassCard variant={isOngoing ? 'hero' : 'elevated'} style={styles.nextUpCard}>
            <View style={styles.nextUpTopRow}>
              <View style={[styles.timePill, isOngoing && { backgroundColor: `${branchColor}20`, borderColor: `${branchColor}40` }]}>
                <Text style={[styles.timePillText, isOngoing && { color: branchColor }]}>
                  {isOngoing ? '🔴 LIVE NOW' : '⏱ COMING UP'} · {liveClass.startTime}
                </Text>
              </View>
              <Pressable onPress={() => router.push('/(student)/schedule' as any)}>
                <Ionicons name="arrow-forward-circle" size={22} color={isOngoing ? branchColor : glass.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.classSubject}>{liveClass.subject}</Text>
            {liveClass.subjectCode && (
              <Text style={{ fontSize: 11, color: glass.textDim, fontWeight: '700', marginBottom: 8 }}>
                {liveClass.subjectCode}
              </Text>
            )}

            <View style={styles.classDetailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={15} color={isOngoing ? branchColor : glass.purple} />
                <Text style={styles.detailText}>{liveClass.room}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={15} color={isOngoing ? branchColor : glass.purple} />
                <Text style={styles.detailText}>{liveClass.teacher}</Text>
              </View>
            </View>

            <View style={styles.classDetailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={15} color={glass.textMuted} />
                <Text style={[styles.detailText, { color: glass.textMuted }]}>
                  {liveClass.startTime} – {liveClass.endTime}
                </Text>
              </View>
              {liveClass.type === 'lab' && (
                <GlassBadge variant="teal" size="sm">🧪 LAB</GlassBadge>
              )}
            </View>

            <View style={styles.nextUpActionsRow}>
              <GlassButton
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="navigate" size={16} color={glass.text} />}
                onPress={() => open360Spot('loc_360_it204')}
              >
                Navigate to {liveClass.room}
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="md"
                leftIcon={<Ionicons name="scan-outline" size={16} color={glass.purple} />}
                onPress={() => open360Spot('loc_360_it204')}
              >
                360°
              </GlassButton>
            </View>
          </GlassCard>
        ) : (
          <GlassCard variant="default" style={[styles.nextUpCard, { alignItems: 'center', paddingVertical: 32 }]}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🎉</Text>
            <Text style={[styles.classSubject, { textAlign: 'center' }]}>All done for today!</Text>
            <Text style={{ fontSize: 13, color: glass.textMuted, marginTop: 4 }}>No more classes scheduled.</Text>
            <GlassButton
              variant="primary"
              size="md"
              leftIcon={<Ionicons name="calendar" size={16} color={glass.text} />}
              onPress={() => router.push('/(student)/schedule' as any)}
              style={{ marginTop: 16, alignSelf: 'center' }}
            >
              View Full Schedule
            </GlassButton>
          </GlassCard>
        )}

        {/* UPCOMING CLASSES (next 2 after current) */}
        {liveSchedule && liveSchedule.upcoming.length > (isOngoing ? 0 : 1) && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>Coming up today</Text>
            </View>
            {(isOngoing ? liveSchedule.upcoming : liveSchedule.upcoming.slice(1)).slice(0, 3).map((cls) => (
              <GlassCard key={`${cls.time}-${cls.subject}`} variant="default" style={styles.upcomingCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upcomingSubject}>{cls.subject}</Text>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name="location-outline" size={12} color={glass.purple} />
                        <Text style={styles.upcomingMeta}>{cls.room}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name="time-outline" size={12} color={glass.purple} />
                        <Text style={styles.upcomingMeta}>{cls.startTime}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.upcomingTeacher}>{cls.teacherShort}</Text>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* ACTIVE ORDER TRACKER CARD (if exists) */}
        {activeOrder && (
          <GlassCard variant="elevated" style={styles.orderTrackerCard}>
            <View style={styles.orderHeaderRow}>
              <Text style={styles.orderNumberText}>{activeOrder.orderNumber}</Text>
              <GlassBadge
                variant={activeOrder.orderStatus === 'ready' ? 'teal' : 'purple'}
                size="md"
              >
                {activeOrder.orderStatus === 'ready' ? 'READY FOR PICKUP' : activeOrder.orderStatus.toUpperCase()}
              </GlassBadge>
            </View>

            <Text style={styles.orderItemsSummary}>
              {activeOrder.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}
            </Text>

            {/* Stepped Progress */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    getStepState(activeOrder.orderStatus, 'placed') && styles.stepCircleActive,
                  ]}
                >
                  {getStepState(activeOrder.orderStatus, 'placed') ? (
                    <Ionicons name="checkmark" size={12} color={glass.bg} />
                  ) : (
                    <View style={styles.stepDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    getStepState(activeOrder.orderStatus, 'placed') && styles.stepLabelActive,
                  ]}
                >
                  Placed
                </Text>
              </View>

              <View
                style={[
                  styles.stepLine,
                  getStepState(activeOrder.orderStatus, 'accepted') && styles.stepLineActive,
                ]}
              />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    getStepState(activeOrder.orderStatus, 'accepted') && styles.stepCircleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepDot,
                      getStepState(activeOrder.orderStatus, 'accepted') && styles.stepDotActive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    getStepState(activeOrder.orderStatus, 'accepted') && styles.stepLabelActive,
                  ]}
                >
                  Accepted
                </Text>
              </View>

              <View
                style={[
                  styles.stepLine,
                  getStepState(activeOrder.orderStatus, 'preparing') && styles.stepLineActive,
                ]}
              />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    getStepState(activeOrder.orderStatus, 'preparing') && styles.stepCircleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepDot,
                      getStepState(activeOrder.orderStatus, 'preparing') && styles.stepDotActive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    getStepState(activeOrder.orderStatus, 'preparing') && styles.stepLabelActive,
                  ]}
                >
                  Making
                </Text>
              </View>

              <View
                style={[
                  styles.stepLine,
                  getStepState(activeOrder.orderStatus, 'ready') && styles.stepLineActive,
                ]}
              />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    getStepState(activeOrder.orderStatus, 'ready') && styles.stepCircleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepDot,
                      getStepState(activeOrder.orderStatus, 'ready') && styles.stepDotActive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    getStepState(activeOrder.orderStatus, 'ready') && styles.stepLabelActive,
                  ]}
                >
                  Ready
                </Text>
              </View>
            </View>

            {/* Subtext and Pickup OTP */}
            <View style={styles.orderFooterRow}>
              <Text style={styles.orderFooterSubtext}>
                {activeOrder.paymentMethod === 'CASH'
                  ? 'Cash At Pickup · Cash Pending'
                  : 'UPI Online Payment · Verified'}
              </Text>

              {activeOrder.pickupOtp && (
                <View style={styles.otpBox}>
                  <Text style={styles.otpLabel}>PICKUP OTP</Text>
                  <Text style={styles.otpCode}>{activeOrder.pickupOtp}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        )}

        {/* CAMPUS UPDATES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Campus updates</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.noticesList}>
          {notices.map((notice) => (
            <Pressable
              key={notice.id}
              style={styles.noticeCard}
              onPress={() => setSelectedNotice(notice)}
            >
              <View style={[styles.noticeIconBox, { backgroundColor: glass.purpleDim }]}>
                <Ionicons
                  name={notice.category === 'Event' ? 'calendar' : 'notifications'}
                  size={20}
                  color={glass.purple}
                />
              </View>

              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeMeta}>
                  {notice.category} • {notice.timeAgo}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={glass.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <Modal
          visible={!!selectedNotice}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedNotice(null)}
        >
          <View style={styles.modalOverlay}>
            <GlassView variant="modal" style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <GlassBadge variant="purple" size="sm">{selectedNotice.category}</GlassBadge>
                <Pressable onPress={() => setSelectedNotice(null)}>
                  <Ionicons name="close-circle" size={26} color={glass.textMuted} />
                </Pressable>
              </View>

              <Text style={styles.modalTitle}>{selectedNotice.title}</Text>
              <Text style={styles.modalDate}>
                {selectedNotice.date} • {selectedNotice.venue || 'Campus Wide'}
              </Text>
              <Text style={styles.modalBody}>{selectedNotice.content}</Text>

              <GlassButton
                variant="primary"
                size="md"
                onPress={() => setSelectedNotice(null)}
                style={styles.modalDismissBtn}
              >
                Close Update
              </GlassButton>
            </GlassView>
          </View>
        </Modal>
      )}

      {/* 360 EXPERIENCE MODAL */}
      <Spatial360Viewer
        visible={!!active360Modal}
        location={active360Modal}
        allLocations={SEED_360_LOCATIONS}
        onClose={() => setActive360Modal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Glass.space.md,
    paddingTop: 54,
    paddingBottom: 40,
    maxWidth: Glass.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Glass.space.lg,
  },
  headerLeft: {
    flex: 1,
  },
  collegeTag: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  greetingTitle: {
    fontSize: Glass.fontSize.display,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    letterSpacing: -0.5,
  },
  dateSubtitle: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    marginTop: 4,
    fontWeight: Glass.fontWeight.medium,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Glass.purpleDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Glass.borderPurple,
  },
  academicCard: {
    borderRadius: Glass.radius.xl,
    paddingVertical: 18,
    paddingHorizontal: Glass.space.md,
    borderWidth: 1,
    borderColor: Glass.borderPurple,
    marginBottom: Glass.space.lg,
  },
  academicCollegeName: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: 6,
  },
  academicMeta: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.semibold,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Glass.space.sm,
    marginBottom: Glass.space.xl,
  },
  actionPill: {
    flex: 1,
    borderRadius: Glass.radius.xl,
    paddingVertical: Glass.space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Glass.border,
    backgroundColor: Glass.bgCard,
    gap: Glass.space.xs,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: Glass.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillBold: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginTop: 4,
  },
  actionPillMuted: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.medium,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.md,
  },
  sectionTitle: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  sectionLink: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.purple,
  },
  nextUpCard: {
    borderRadius: Glass.radius.xl,
    padding: Glass.space.md,
    borderWidth: 1,
    borderColor: Glass.borderPurple,
    marginBottom: Glass.space.lg,
  },
  nextUpTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.md,
  },
  timePill: {
    borderRadius: Glass.radius.pill,
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.xs,
    borderWidth: 1,
    borderColor: Glass.borderPurple,
    backgroundColor: Glass.purpleDim,
  },
  timePillText: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 0.5,
  },
  classSubject: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.sm,
  },
  classDetailsRow: {
    flexDirection: 'row',
    gap: Glass.space.md,
    marginBottom: Glass.space.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
  },
  detailText: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    fontWeight: Glass.fontWeight.semibold,
  },
  nextUpActionsRow: {
    flexDirection: 'row',
    gap: Glass.space.sm,
  },
  upcomingCard: {
    paddingVertical: 14,
    marginBottom: Glass.space.md,
    borderColor: Glass.borderSubtle,
  },
  upcomingSubject: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: 4,
  },
  upcomingMeta: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textMuted,
    fontWeight: Glass.fontWeight.semibold,
  },
  upcomingTeacher: {
    fontSize: Glass.fontSize.xs,
    color: Glass.purple,
    fontWeight: Glass.fontWeight.extrabold,
  },
  orderTrackerCard: {
    borderRadius: Glass.radius.xl,
    padding: Glass.space.md,
    borderWidth: 1,
    borderColor: Glass.border,
    marginBottom: Glass.space.xl,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.sm,
  },
  orderNumberText: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  orderItemsSummary: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    marginBottom: Glass.space.md,
    fontWeight: Glass.fontWeight.medium,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Glass.space.md,
    paddingHorizontal: Glass.space.xs,
  },
  stepItem: {
    alignItems: 'center',
    gap: Glass.space.xs,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Glass.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  stepCircleActive: {
    backgroundColor: Glass.purple,
    borderColor: Glass.purple,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Glass.textDim,
  },
  stepDotActive: {
    backgroundColor: Glass.bg,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Glass.border,
    marginHorizontal: Glass.space.xs,
    marginBottom: 18,
  },
  stepLineActive: {
    backgroundColor: Glass.purple,
  },
  stepLabel: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textDim,
    fontWeight: Glass.fontWeight.semibold,
  },
  stepLabelActive: {
    color: Glass.purple,
    fontWeight: Glass.fontWeight.bold,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Glass.borderSubtle,
    paddingTop: Glass.space.md,
  },
  orderFooterSubtext: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    fontWeight: Glass.fontWeight.medium,
  },
  otpBox: {
    backgroundColor: Glass.bgElevated,
    borderRadius: Glass.radius.md,
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Glass.purple,
  },
  otpLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 0.5,
  },
  otpCode: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    letterSpacing: 2,
  },
  noticesList: {
    gap: Glass.space.md,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Glass.bgCard,
    borderRadius: Glass.radius.lg,
    padding: Glass.space.md,
    gap: Glass.space.md,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  noticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: Glass.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  noticeMeta: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    fontWeight: Glass.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Glass.space.md,
  },
  modalCard: {
    borderRadius: Glass.radius.xxl,
    padding: Glass.space.lg,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: Glass.borderStrong,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.md,
  },
  modalTitle: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.sm,
  },
  modalDate: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.md,
  },
  modalBody: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    lineHeight: Glass.lineHeight.relaxed * Glass.fontSize.md,
    marginBottom: Glass.space.lg,
  },
  modalDismissBtn: {
    marginTop: Glass.space.sm,
  },
  panoramaContainer: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
});