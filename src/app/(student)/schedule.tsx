import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import {
    ScheduleOnboardingWizard,
    SchedulePrefs,
    loadSchedulePrefsForStudent,
} from '@/components/schedule-onboarding-wizard';
import { Spatial360Viewer } from '@/components/spatial-360-viewer';
import {
    GlassBadge,
    GlassButton,
    GlassCard,
    GlassSectionHeader,
    GlassView,
} from '@/components/ui/glass-components';
import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { SEED_360_LOCATIONS } from '@/services/seed-data';
import {
    TIMETABLE_BRANCHES,
    TimetableEntry,
    getDivisionSchedule,
    getSlotStatus,
    getTodayLiveSchedule,
} from '@/services/timetable-data';
import { Campus360Location } from '@/types';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Animated gradient orb background ────────────────────────────────────────
function GlassOrb({
  color,
  size,
  x,
  y,
  dur,
}: {
  color: string;
  size: number;
  x: number;
  y: number;
  dur: number;
}) {
  const tx = useRef(new Animated.Value(x)).current;
  const ty = useRef(new Animated.Value(y)).current;
  const sc = useRef(new Animated.Value(1)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(op, { toValue: 0.15, duration: 1800, useNativeDriver: true }).start();
    const go = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(tx, { toValue: x + 90, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tx, { toValue: x - 60, duration: dur * 1.1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tx, { toValue: x, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ty, { toValue: y - 120, duration: dur * 1.2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(ty, { toValue: y + 80, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(ty, { toValue: y, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(sc, { toValue: 1.25, duration: dur * 0.9, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(sc, { toValue: 0.85, duration: dur * 0.9, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(sc, { toValue: 1, duration: dur * 0.9, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start(go);
    };
    go();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
      }}
    />
  );
}

// ─── Pulsing Live Dot ─────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const ring = useRef(new Animated.Value(1)).current;
  const ringOp = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, { toValue: 2.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOp, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(ringOp, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 1.5,
          borderColor: color,
          opacity: ringOp,
          transform: [{ scale: ring }],
        }}
      />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  lecture: { label: 'Lecture', icon: '📖', color: Glass.purple, bg: Glass.purpleDim },
  lab: { label: 'Lab', icon: '🧪', color: Glass.teal, bg: Glass.tealDim },
  tutorial: { label: 'Tutorial', icon: '✏️', color: Glass.gold, bg: Glass.goldDim },
  break: { label: 'Break', icon: '☕', color: Glass.textDim, bg: 'rgba(156,163,175,0.1)' },
  doubt: { label: 'Doubt Session', icon: '🙋', color: Glass.gold, bg: Glass.goldDim },
};

function TypeBadge({ type }: { type: string }) {
  const m = TYPE_META[type] || TYPE_META.lecture;
  const variant = type === 'lab' ? 'teal' : type === 'tutorial' ? 'gold' : type === 'doubt' ? 'gold' : type === 'break' ? 'info' : 'purple';
  return (
    <GlassBadge variant={variant} size="sm" style={{ backgroundColor: m.bg, borderColor: `${m.color}40` }}>
      {`${m.icon} ${m.label}`}
    </GlassBadge>
  );
}

// ─── Glass Slot Card ──────────────────────────────────────────────────────────
interface SlotCardProps {
  slot: TimetableEntry;
  status: 'ongoing' | 'upcoming' | 'ended';
  branchColor: string;
  onNavigate?: () => void;
  index: number;
}

function SlotCard({ slot, status, branchColor, onNavigate, index }: SlotCardProps) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay: index * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const isOngoing = status === 'ongoing';
  const isEnded = status === 'ended';

  const cardBg = isOngoing
    ? `${branchColor}14`
    : isEnded
    ? 'rgba(255,255,255,0.02)'
    : Glass.bgCard;
  const borderColor = isOngoing
    ? `${branchColor}70`
    : isEnded
    ? Glass.borderSubtle
    : Glass.borderPurple;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {/* Top row: time + badges */}
      <View style={styles.topRow}>
        <View style={styles.timeChip}>
          <Ionicons name="time-outline" size={12} color={isOngoing ? branchColor : Glass.purple} />
          <Text style={[styles.timeText, isOngoing && { color: branchColor }]}>
            {slot.startTime} – {slot.endTime}
          </Text>
        </View>
        <View style={styles.badgeGroup}>
          <TypeBadge type={slot.type} />
          {isOngoing && (
            <View style={[styles.statusPill, { backgroundColor: `${branchColor}20`, borderColor: `${branchColor}40` }]}>
              <PulseDot color={branchColor} />
              <Text style={[styles.statusText, { color: branchColor }]}>LIVE</Text>
            </View>
          )}
          {isEnded && (
            <View style={styles.endedPill}>
              <Text style={styles.endedText}>✓ DONE</Text>
            </View>
          )}
        </View>
      </View>

      {/* Subject name */}
      <Text style={[styles.subject, { opacity: isEnded ? 0.4 : 1 }]} numberOfLines={2}>
        {slot.subject}
      </Text>
      {Boolean(slot.subjectCode) ? (
        <Text style={[styles.subjectCode, { opacity: isEnded ? 0.3 : 0.5 }]}>{slot.subjectCode}</Text>
      ) : null}

      {/* Glass divider */}
      <View style={styles.divider} />

      {/* Meta chips: room + teacher */}
      {(Boolean(slot.room && slot.room !== '-') || Boolean(slot.teacher && slot.teacher !== '-')) && (
        <View style={styles.metaRow}>
          {slot.room && slot.room !== '-' ? (
            <GlassView variant="subtle" style={styles.metaChip}>
              <Ionicons name="location" size={13} color={isOngoing ? branchColor : Glass.purple} />
              <Text style={[styles.metaText, { opacity: isEnded ? 0.4 : 1 }]}>{slot.room}</Text>
            </GlassView>
          ) : null}
          {slot.teacher && slot.teacher !== '-' ? (
            <GlassView variant="subtle" style={styles.metaChip}>
              <Ionicons name="person" size={13} color={isOngoing ? branchColor : Glass.purple} />
              <Text style={[styles.metaText, { opacity: isEnded ? 0.4 : 1 }]}>{slot.teacher}</Text>
            </GlassView>
          ) : null}
        </View>
      )}

      {/* Navigate button for active/upcoming */}
      {!isEnded && Boolean(onNavigate) && Boolean(slot.room && slot.room !== '-') ? (
        <GlassButton
          variant={isOngoing ? 'primary' : 'secondary'}
          size="md"
          leftIcon={<Ionicons name="navigate" size={14} color={isOngoing ? Glass.text : Glass.purple} />}
          onPress={onNavigate}
          style={styles.navBtn}
        >
          Navigate to {slot.room}
        </GlassButton>
      ) : null}
    </Animated.View>
  );
}

// ─── Live Banner Card ─────────────────────────────────────────────────────────
interface LiveBannerProps {
  slot: TimetableEntry | null;
  isOngoing: boolean;
  branchColor: string;
  onPress: () => void;
}

function LiveBanner({ slot, isOngoing, branchColor, onPress }: LiveBannerProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isOngoing) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [isOngoing]);

  if (!slot) {
    return (
      <Pressable style={[styles.emptyCard]} onPress={onPress}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <View>
          <Text style={styles.emptyTitle}>All classes done for today!</Text>
          <Text style={styles.emptySub}>Tap to view your full schedule</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={Glass.textDim} />
      </Pressable>
    );
  }

  const glowColor = isOngoing ? branchColor : Glass.purple;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.liveCard,
        {
          borderColor: isOngoing ? `${branchColor}60` : Glass.borderPurple,
          backgroundColor: isOngoing ? `${branchColor}12` : Glass.purpleDim,
        },
        pressed && { opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      {/* Glow shimmer layer */}
      {isOngoing && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: `${branchColor}08`,
              opacity: shimmer,
            },
          ]}
        />
      )}

      <View style={styles.liveInnerRow}>
        {/* Left: indicator + details */}
        <View style={styles.liveLeftCol}>
          <View style={styles.liveStatusRow}>
            {isOngoing ? <PulseDot color={glowColor} /> : <Ionicons name="time" size={11} color={glowColor} />}
            <Text style={[styles.liveStatusLabel, { color: glowColor }]}>
              {isOngoing ? 'HAPPENING NOW' : 'NEXT UP'}
            </Text>
          </View>
          <Text style={styles.liveSubject} numberOfLines={1}>{slot.subject}</Text>
          {(Boolean(slot.room && slot.room !== '-') || Boolean(slot.teacher && slot.teacher !== '-')) && (
            <View style={styles.liveMetaRow}>
              {slot.room && slot.room !== '-' ? (
                <View style={styles.liveMetaItem}>
                  <Ionicons name="location" size={11} color={glowColor} />
                  <Text style={styles.liveMetaText}>{slot.room}</Text>
                </View>
              ) : null}
              {Boolean(slot.room && slot.room !== '-' && slot.teacher && slot.teacher !== '-') ? (
                <View style={styles.liveDot} />
              ) : null}
              {slot.teacher && slot.teacher !== '-' ? (
                <View style={styles.liveMetaItem}>
                  <Ionicons name="person" size={11} color={glowColor} />
                  <Text style={styles.liveMetaText}>{slot.teacherShort || slot.teacher}</Text>
                </View>
              ) : null}
            </View>
          )}
          <Text style={styles.liveTimeText}>{slot.startTime} – {slot.endTime}</Text>
        </View>

        {/* Right: type icon */}
        <View style={[styles.liveIconBox, { backgroundColor: `${glowColor}18` }]}>
          <Text style={styles.liveIconEmoji}>{TYPE_META[slot.type]?.icon || '📖'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Glass Prefs Chip ─────────────────────────────────────────────────────────
interface PrefsChipProps {
  prefs: SchedulePrefs;
  branchColor: string;
  branchEmoji: string;
  branchCode: string;
  onPress: () => void;
}

function PrefsChip({ prefs, branchColor, branchEmoji, branchCode, onPress }: PrefsChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.prefsChip,
        { borderColor: `${branchColor}40`, backgroundColor: `${branchColor}10` },
        pressed && { opacity: 0.75 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.prefsEmoji}>{branchEmoji}</Text>
      <Text style={[styles.prefsLabel, { color: branchColor }]}>
        {branchCode} · Div {prefs.divisionId} · {prefs.batchLabel}
      </Text>
      <View style={[styles.prefsEditDot, { backgroundColor: `${branchColor}30` }]}>
        <Ionicons name="pencil" size={10} color={branchColor} />
      </View>
    </Pressable>
  );
}

// ─── Day Pill ─────────────────────────────────────────────────────────────────
interface DayPillProps {
  label: string;
  isSelected: boolean;
  isToday: boolean;
  color: string;
  onPress: () => void;
}

function DayPill({ label, isSelected, isToday, color, onPress }: DayPillProps) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: isSelected ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [isSelected]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.dayPill,
          {
            backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: [Glass.bgCard, color] }),
            borderColor: anim.interpolate({ inputRange: [0, 1], outputRange: [Glass.borderPurple, color] }),
          },
        ]}
      >
        <Text style={[styles.dayLabel, isSelected && styles.daySelectedLabel]}>{label}</Text>
        {isToday && !isSelected && <View style={styles.dayTodayDot} />}
      </Animated.View>
    </Pressable>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined ? (
        <GlassBadge variant="purple" size="sm">{count}</GlassBadge>
      ) : null}
    </View>
  );
}

// ─── Main Schedule Screen ─────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const { profile } = useAuth();
  const [prefs, setPrefs] = useState<SchedulePrefs | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 1 : d;
  });
  const [now, setNow] = useState(new Date());
  const [active360Modal, setActive360Modal] = useState<Campus360Location | null>(null);
  const headerFade = useRef(new Animated.Value(0)).current;

  // Tick every 30s
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Header entrance
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Resolve from the student's PRN first so stale preferences cannot select another section.
  useEffect(() => {
    let cancelled = false;
    const loadPrefs = async () => {
      const prnCandidate = profile?.registrationId || profile?.rollNumber || profile?.studentId || '';
      const saved = await loadSchedulePrefsForStudent(prnCandidate);
      if (cancelled) return;
      if (saved) setPrefs(saved);
      else setShowOnboarding(true);
    };
    loadPrefs();
    return () => { cancelled = true; };
  }, [profile]);

  const handleOnboardingComplete = (newPrefs: SchedulePrefs) => {
    setPrefs(newPrefs);
    setShowOnboarding(false);
  };

  const branch = prefs ? TIMETABLE_BRANCHES.find((b) => b.branchId === prefs.branchId) : null;
  const branchColor = branch?.color || Glass.purpleBright;

  const weekSchedule = prefs
    ? getDivisionSchedule(prefs.branchId, prefs.divisionId, prefs.batchId) || []
    : [];

  const todayNum = now.getDay() === 0 || now.getDay() === 6 ? 1 : now.getDay();
  const displayDayNum = viewMode === 'today' ? todayNum : selectedDay;
  const displayDay = weekSchedule.find((d) => d.dayNum === displayDayNum);
  const displaySlots = displayDay?.slots.filter((s) => s.type !== 'break') || [];

  const liveData = prefs
    ? getTodayLiveSchedule(prefs.branchId, prefs.divisionId, prefs.batchId)
    : null;
  const liveSlot = liveData?.ongoing || liveData?.upcoming?.[0] || null;
  const isOngoing = !!liveData?.ongoing;

  const days = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
  ];

  const open360 = () => {
    if (SEED_360_LOCATIONS[0]) setActive360Modal(SEED_360_LOCATIONS[0]);
  };

  // Today slot stats
  const todaySlots = weekSchedule.find((d) => d.dayNum === todayNum)?.slots.filter((s) => s.type !== 'break') || [];
  const ongoingCount = todaySlots.filter((s) => getSlotStatus(s, now) === 'ongoing').length;
  const upcomingCount = todaySlots.filter((s) => getSlotStatus(s, now) === 'upcoming').length;
  const endedCount = todaySlots.filter((s) => getSlotStatus(s, now) === 'ended').length;

  return (
    <View style={styles.root}>
      {/* Background ambient orbs */}
      <GlassOrb color={Glass.purpleBright} size={320} x={-80} y={-40} dur={5000} />
      <GlassOrb color={branchColor} size={260} x={SCREEN_W - 160} y={220} dur={6200} />
      <GlassOrb color={Glass.info} size={200} x={60} y={560} dur={4800} />

      {/* Onboarding Wizard */}
      <ScheduleOnboardingWizard
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <Text style={styles.brandTag}>CAMPUS CONNECT · TIMETABLE</Text>
          <Text style={styles.heading}>Class Schedule</Text>

          {prefs && branch && (
            <PrefsChip
              prefs={prefs}
              branchColor={branchColor}
              branchEmoji={branch.emoji}
              branchCode={branch.branchCode}
              onPress={() => setShowOnboarding(true)}
            />
          )}
        </Animated.View>

        {/* ── STATS ROW ───────────────────────────────────────────────────── */}
        {prefs && viewMode === 'today' && (
          <View style={styles.statsRow}>
            {[
              { label: 'Done', value: endedCount, color: Glass.textDim },
              { label: 'Live', value: ongoingCount, color: branchColor },
              { label: 'Upcoming', value: upcomingCount, color: Glass.purple },
            ].map((stat) => (
              <GlassCard key={stat.label} variant="default" style={[styles.statCard, { borderColor: `${stat.color}25` }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {/* ── LIVE BANNER ─────────────────────────────────────────────────── */}
        {viewMode === 'today' && (
          <LiveBanner
            slot={liveSlot}
            isOngoing={isOngoing}
            branchColor={branchColor}
            onPress={open360}
          />
        )}

        {/* ── VIEW TOGGLE ─────────────────────────────────────────────────── */}
        <View style={styles.toggleGlass}>
          {(['today', 'week'] as const).map((mode) => (
            <Pressable
              key={mode}
              style={[
                styles.toggleBtn,
                viewMode === mode && [styles.toggleBtnActive, { backgroundColor: branchColor }],
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  viewMode === mode && { color: Glass.text, fontWeight: Glass.fontWeight.extrabold },
                ]}
              >
                {mode === 'today' ? 'Today' : 'Week'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── WEEK DAY TABS (week mode) ────────────────────────────────────── */}
        {viewMode === 'week' && (
          <View style={styles.dayTabs}>
            {days.map((day) => (
              <DayPill
                key={day.num}
                label={day.label}
                isSelected={selectedDay === day.num}
                isToday={day.num === todayNum}
                color={branchColor}
                onPress={() => setSelectedDay(day.num)}
              />
            ))}
          </View>
        )}

        {/* ── SLOTS LIST ───────────────────────────────────────────────────── */}
        <SectionHeader
          title={viewMode === 'today' ? `Today · ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][todayNum]}` : `Day ${selectedDay}`}
          count={displaySlots.length}
        />

        {displaySlots.length === 0 ? (
          <GlassCard variant="default" style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📅</Text>
            <Text style={styles.emptyStateTitle}>No classes scheduled</Text>
            <Text style={styles.emptyStateSub}>Enjoy your free time!</Text>
          </GlassCard>
        ) : (
          displaySlots.map((slot, idx) => {
            const status = getSlotStatus(slot, now);
            return (
              <SlotCard
                key={`${slot.time}-${slot.subject}`}
                slot={slot}
                status={status}
                branchColor={branchColor}
                onNavigate={() => setActive360Modal(SEED_360_LOCATIONS[0])}
                index={idx}
              />
            );
          })
        )}

        {/* ── SETTINGS CARD ────────────────────────────────────────────────── */}
        {prefs && (
          <GlassSectionHeader title="Settings" style={{ marginTop: Glass.space.xl }} />
        )}
        {prefs && (
          <GlassCard variant="default" style={styles.settingsCard}>
            <Pressable style={styles.settingsRow} onPress={() => setShowOnboarding(true)}>
              <View style={styles.settingsIcon}>
                <Ionicons name="settings-outline" size={20} color={Glass.purple} />
              </View>
              <View style={styles.settingsInfo}>
                <Text style={styles.settingsTitle}>Change Branch / Division</Text>
                <Text style={styles.settingsSub}>
                  {branch?.branchName || 'Branch'} · Div {prefs.divisionId} · {prefs.batchLabel}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Glass.textDim} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.settingsRow} onPress={() => open360()}>
              <View style={styles.settingsIcon}>
                <Ionicons name="scan-outline" size={20} color={Glass.teal} />
              </View>
              <View style={styles.settingsInfo}>
                <Text style={styles.settingsTitle}>360° Campus Navigation</Text>
                <Text style={styles.settingsSub}>Open spatial tour to find your classroom</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Glass.textDim} />
            </Pressable>
          </GlassCard>
        )}
      </ScrollView>

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
  root: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Glass.space.md,
    paddingTop: 54,
    paddingBottom: Glass.space.xxl,
    maxWidth: Glass.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: Glass.space.xl,
    paddingBottom: Glass.space.md,
  },
  brandTag: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 1.2,
    marginBottom: Glass.space.sm,
  },
  heading: {
    fontSize: Glass.fontSize.display,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: Glass.radius.lg,
    paddingVertical: Glass.space.md,
    paddingHorizontal: Glass.space.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: Glass.fontSize.xxl,
    fontWeight: Glass.fontWeight.black,
  },
  statLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.semibold,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  toggleGlass: {
    flexDirection: 'row',
    backgroundColor: Glass.bgCard,
    borderRadius: Glass.radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: Glass.border,
    marginBottom: Glass.space.xl,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.pill,
  },
  toggleBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleBtnText: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.textMuted,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: Glass.space.sm,
    marginBottom: Glass.space.xl,
  },
  dayPill: {
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    gap: Glass.space.xs,
  },
  dayLabel: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.textMuted,
  },
  daySelectedLabel: {
    color: Glass.text,
    fontWeight: Glass.fontWeight.extrabold,
  },
  dayTodayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Glass.purple,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
    marginBottom: Glass.space.md,
    marginTop: Glass.space.xs,
  },
  sectionTitle: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: Glass.radius.xl,
    borderWidth: 1.5,
    padding: Glass.space.md,
    marginBottom: Glass.space.md,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.md,
  },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: Glass.space.xs },
  timeText: { fontSize: Glass.fontSize.xs, color: Glass.purple, fontWeight: Glass.fontWeight.extrabold },
  badgeGroup: { flexDirection: 'row', gap: Glass.space.xs, alignItems: 'center' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: Glass.space.xs,
    paddingHorizontal: Glass.space.sm, paddingVertical: Glass.space.xs, borderRadius: Glass.radius.sm, borderWidth: 1,
  },
  statusText: { fontSize: Glass.fontSize.xs, fontWeight: Glass.fontWeight.extrabold, letterSpacing: 0.5 },
  endedPill: {
    paddingHorizontal: Glass.space.sm, paddingVertical: Glass.space.xs, borderRadius: Glass.radius.sm,
    backgroundColor: 'rgba(107,114,128,0.12)',
  },
  endedText: { fontSize: Glass.fontSize.xs, fontWeight: Glass.fontWeight.extrabold, color: Glass.textDim },
  subject: { fontSize: Glass.fontSize.lg, fontWeight: Glass.fontWeight.extrabold, color: Glass.text, lineHeight: Glass.lineHeight.tight * Glass.fontSize.lg, marginBottom: Glass.space.xs },
  subjectCode: { fontSize: Glass.fontSize.xs, color: Glass.purple, fontWeight: Glass.fontWeight.bold, marginBottom: Glass.space.md },
  divider: { height: 1, backgroundColor: Glass.borderSubtle, marginVertical: Glass.space.md },
  metaRow: { flexDirection: 'row', gap: Glass.space.sm, flexWrap: 'wrap', marginBottom: Glass.space.md },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: Glass.space.xs,
    paddingHorizontal: Glass.space.sm, paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.sm,
  },
  metaText: { fontSize: Glass.fontSize.sm, color: Glass.textSub, fontWeight: Glass.fontWeight.bold },
  navBtn: {
    width: '100%',
    marginTop: Glass.space.xs,
  },
  liveCard: {
    borderRadius: Glass.radius.xl,
    borderWidth: 1.5,
    padding: Glass.space.md,
    marginBottom: Glass.space.md,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.md,
    borderColor: Glass.teal + '33',
    backgroundColor: Glass.tealDim,
    padding: Glass.space.md,
    borderRadius: Glass.radius.xl,
    borderWidth: 1.5,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontSize: Glass.fontSize.md, fontWeight: Glass.fontWeight.extrabold, color: Glass.text },
  emptySub: { fontSize: Glass.fontSize.sm, color: Glass.textMuted, fontWeight: Glass.fontWeight.semibold, marginTop: Glass.space.xs },
  shimmer: {
    ...StyleSheet.absoluteFill,
    borderRadius: Glass.radius.xl,
  },
  liveInnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveLeftCol: { flex: 1, gap: Glass.space.xs },
  liveStatusRow: { flexDirection: 'row', alignItems: 'center', gap: Glass.space.xs, marginBottom: Glass.space.xs },
  liveStatusLabel: { fontSize: Glass.fontSize.xs, fontWeight: Glass.fontWeight.extrabold, letterSpacing: 0.8 },
  liveSubject: { fontSize: Glass.fontSize.xl, fontWeight: Glass.fontWeight.extrabold, color: Glass.text, lineHeight: Glass.lineHeight.tight * Glass.fontSize.xl },
  liveMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Glass.space.sm, flexWrap: 'wrap' },
  liveMetaItem: { flexDirection: 'row', alignItems: 'center', gap: Glass.space.xs },
  liveMetaText: { fontSize: Glass.fontSize.sm, color: Glass.textMuted, fontWeight: Glass.fontWeight.bold },
  liveDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Glass.border },
  liveTimeText: { fontSize: Glass.fontSize.xs, color: Glass.textDim, fontWeight: Glass.fontWeight.bold, marginTop: Glass.space.xs },
  liveIconBox: {
    width: 52, height: 52, borderRadius: Glass.radius.lg,
    alignItems: 'center', justifyContent: 'center', marginLeft: Glass.space.md,
  },
  liveIconEmoji: { fontSize: 24 },
  prefsChip: {
    flexDirection: 'row', alignItems: 'center', gap: Glass.space.sm,
    alignSelf: 'flex-start', paddingHorizontal: Glass.space.md, paddingVertical: Glass.space.sm,
    borderRadius: Glass.radius.pill, borderWidth: 1.5,
  },
  prefsEmoji: { fontSize: 16 },
  prefsLabel: { fontSize: Glass.fontSize.md, fontWeight: Glass.fontWeight.extrabold },
  prefsEditDot: { width: 20, height: 20, borderRadius: Glass.radius.circle, alignItems: 'center', justifyContent: 'center' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Glass.space.xxl,
    paddingHorizontal: Glass.space.xl,
  },
  emptyStateEmoji: { fontSize: 48, marginBottom: Glass.space.md },
  emptyStateTitle: { fontSize: Glass.fontSize.lg, fontWeight: Glass.fontWeight.extrabold, color: Glass.text, marginBottom: Glass.space.xs },
  emptyStateSub: { fontSize: Glass.fontSize.md, color: Glass.textMuted },
  settingsCard: {
    marginBottom: Glass.space.xl,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Glass.space.md,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: Glass.radius.md,
    backgroundColor: Glass.purpleDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Glass.space.md,
  },
  settingsInfo: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  settingsSub: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
  },
});