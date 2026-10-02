import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  resolveStudentSchedulePrefsFromPrn,
  TIMETABLE_BRANCHES,
} from '@/services/timetable-data';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Storage ──────────────────────────────────────────────────────────────────
export const SCHEDULE_PREFS_KEY = 'cc_schedule_prefs';

export interface SchedulePrefs {
  branchId: string;
  divisionId: string;
  batchId: string;
  branchLabel: string;
  divisionLabel: string;
  batchLabel: string;
  savedAt: string;
}

export async function loadSchedulePrefs(): Promise<SchedulePrefs | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      raw = window.localStorage.getItem(SCHEDULE_PREFS_KEY);
    } else {
      raw = await AsyncStorage.getItem(SCHEDULE_PREFS_KEY);
    }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSchedulePrefs(prefs: SchedulePrefs): Promise<void> {
  const raw = JSON.stringify(prefs);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(SCHEDULE_PREFS_KEY, raw);
  } else {
    await AsyncStorage.setItem(SCHEDULE_PREFS_KEY, raw);
  }
}

export async function loadSchedulePrefsForStudent(prnCandidate: string): Promise<SchedulePrefs | null> {
  const inferred = resolveStudentSchedulePrefsFromPrn(prnCandidate);
  if (inferred) {
    await saveSchedulePrefs(inferred);
    return inferred;
  }
  return loadSchedulePrefs();
}

// ─── Preset Items Matching Screenshot 2 ────────────────────────────────────────
const BRANCH_ITEMS = [
  { id: 'ME', code: 'ME', name: 'Mechanical' },
  { id: 'IT', code: 'IT', name: 'Information Tech' },
  { id: 'CE', code: 'CS', name: 'Computer' },
  { id: 'ENTC', code: 'ENTC', name: 'Electronics' },
  { id: 'ELECTRICAL', code: 'EE', name: 'Electrical' },
  { id: 'CIVIL', code: 'CIVIL', name: 'Civil' },
  { id: 'AR', code: 'AR', name: 'A & R' },
  { id: 'CSBS', code: 'CSBS', name: 'CS & Business' },
];

const DIVISION_ITEMS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'M', 'N', 'J', 'K', 'L'];
const BATCH_ITEMS = ['1', '2', '3'];

const CYAN = '#00E5FF';
const CYAN_DIM = 'rgba(0, 229, 255, 0.15)';
const CYAN_BORDER_DIM = 'rgba(0, 229, 255, 0.35)';

// ─── Glowing Slider Card ───────────────────────────────────────────────────────
function GlowSliderCard({
  label,
  selected,
  onPress,
  size = 'md',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  size?: 'branch' | 'division' | 'batch';
}) {
  const scale = useRef(new Animated.Value(selected ? 1.15 : 0.92)).current;
  const glowOpacity = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: selected ? (size === 'batch' ? 1.12 : 1.16) : 0.92,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: selected ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selected]);

  const getDimensions = () => {
    switch (size) {
      case 'branch':
        return { width: 78, height: 96, fontSize: 18 };
      case 'division':
        return { width: 66, height: 92, fontSize: 32 };
      case 'batch':
        return { width: 88, height: 94, fontSize: 34 };
    }
  };

  const dim = getDimensions();

  return (
    <Pressable onPress={onPress} style={styles.cardTouchTarget}>
      <Animated.View
        style={[
          styles.glowCard,
          {
            width: dim.width,
            height: dim.height,
            transform: [{ scale }],
            borderColor: selected ? CYAN : CYAN_BORDER_DIM,
            borderWidth: selected ? 2.5 : 1.5,
            backgroundColor: selected ? CYAN_DIM : 'rgba(10, 16, 32, 0.65)',
            ...Platform.select({
              web: {
                boxShadow: selected
                  ? '0 0 24px rgba(0, 229, 255, 0.75), inset 0 0 14px rgba(0, 229, 255, 0.25)'
                  : 'none',
              } as any,
              default: {
                shadowColor: CYAN,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: selected ? 0.9 : 0,
                shadowRadius: selected ? 18 : 0,
                elevation: selected ? 12 : 0,
              },
            }),
          },
        ]}
      >
        <Text
          style={[
            styles.cardText,
            {
              fontSize: dim.fontSize,
              color: selected ? CYAN : 'rgba(255, 255, 255, 0.6)',
              fontWeight: selected ? '900' : '700',
              ...Platform.select({
                web: {
                  textShadow: selected ? '0 0 12px rgba(0, 229, 255, 0.8)' : 'none',
                } as any,
              }),
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Schedule Onboarding / Switcher Wizard ──────────────────────────────
interface Props {
  visible: boolean;
  onComplete: (prefs: SchedulePrefs) => void;
  onClose?: () => void;
}

export function ScheduleOnboardingWizard({ visible, onComplete, onClose }: Props) {
  const [selectedBranch, setSelectedBranch] = useState('IT');
  const [selectedDivision, setSelectedDivision] = useState('C');
  const [selectedBatch, setSelectedBatch] = useState('1');

  const branchScrollRef = useRef<ScrollView>(null);
  const divScrollRef = useRef<ScrollView>(null);

  // Initialize from saved prefs or student PRN if available
  useEffect(() => {
    (async () => {
      const saved = await loadSchedulePrefs();
      if (saved) {
        const foundBranch = BRANCH_ITEMS.find(
          (b) => b.id === saved.branchId || b.code === saved.branchId
        );
        if (foundBranch) setSelectedBranch(foundBranch.code);
        if (saved.divisionId) setSelectedDivision(saved.divisionId.toUpperCase());
        const num = saved.batchId?.replace(/\D/g, '');
        if (num) setSelectedBatch(num);
      }
    })();
  }, [visible]);

  const handleFinish = async () => {
    const branchMeta =
      BRANCH_ITEMS.find((b) => b.code === selectedBranch || b.id === selectedBranch) ||
      BRANCH_ITEMS[1];
    const branchObj =
      TIMETABLE_BRANCHES.find(
        (b) =>
          b.branchId === branchMeta.id ||
          b.branchCode === branchMeta.code ||
          b.branchId === selectedBranch
      ) || TIMETABLE_BRANCHES[1];

    const matchedDiv = branchObj.divisions.find(
      (d) => d.divisionId.toUpperCase() === selectedDivision.toUpperCase()
    );
    const divisionId = matchedDiv ? matchedDiv.divisionId : selectedDivision;
    const divisionLabel = matchedDiv ? matchedDiv.divisionLabel : `Section ${selectedDivision}`;

    const numOnly = selectedBatch.replace(/\D/g, '') || '1';
    let matchedBatch = matchedDiv?.batches.find(
      (b) => b.batchId.endsWith(numOnly) || b.batchLabel.endsWith(numOnly)
    );
    if (!matchedBatch && matchedDiv?.batches?.length) {
      matchedBatch = matchedDiv.batches[0];
    }

    const batchId = matchedBatch ? matchedBatch.batchId : `${divisionId}${numOnly}`;
    const batchLabel = matchedBatch ? matchedBatch.batchLabel : `${divisionId}${numOnly}`;

    const prefs: SchedulePrefs = {
      branchId: branchObj.branchId,
      divisionId,
      batchId,
      branchLabel: branchObj.branchLabel,
      divisionLabel,
      batchLabel,
      savedAt: new Date().toISOString(),
    };

    await saveSchedulePrefs(prefs);
    onComplete(prefs);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.topHeader}>
            <View style={styles.glowLogoDot} />
            <Text style={styles.headerTitle}>SELECT TIMETABLE</Text>
            {onClose ? (
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </Pressable>
            ) : null}
          </View>

          {/* ─── 1. BRANCH SLIDER (Row 1) ─────────────────────────────────── */}
          <View style={styles.rowSection}>
            <Text style={styles.sectionLabel}>BRANCH</Text>
            <ScrollView
              ref={branchScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderTrack}
            >
              {BRANCH_ITEMS.map((item) => (
                <GlowSliderCard
                  key={item.code}
                  label={item.code}
                  size="branch"
                  selected={selectedBranch === item.code}
                  onPress={() => setSelectedBranch(item.code)}
                />
              ))}
            </ScrollView>
          </View>

          {/* ─── 2. DIVISION SLIDER (Row 2) ───────────────────────────────── */}
          <View style={styles.rowSection}>
            <Text style={styles.sectionLabel}>DIVISION</Text>
            <ScrollView
              ref={divScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderTrack}
            >
              {DIVISION_ITEMS.map((div) => (
                <GlowSliderCard
                  key={div}
                  label={div}
                  size="division"
                  selected={selectedDivision === div}
                  onPress={() => setSelectedDivision(div)}
                />
              ))}
            </ScrollView>
          </View>

          {/* ─── 3. BATCH SELECTOR (Row 3) ────────────────────────────────── */}
          <View style={styles.rowSection}>
            <Text style={styles.sectionLabel}>BATCH</Text>
            <View style={styles.batchRow}>
              {BATCH_ITEMS.map((batch) => (
                <GlowSliderCard
                  key={batch}
                  label={batch}
                  size="batch"
                  selected={selectedBatch === batch}
                  onPress={() => setSelectedBatch(batch)}
                />
              ))}
            </View>
          </View>

          {/* ─── 4. NEXT BUTTON (Row 4) ───────────────────────────────────── */}
          <View style={styles.bottomArea}>
            <Pressable
              style={({ pressed }) => [
                styles.nextCapsuleBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleFinish}
            >
              <Text style={styles.nextBtnText}>NEXT</Text>
              <Ionicons name="arrow-forward" size={18} color={CYAN} style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 16, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#090D1C',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.25)',
      } as any,
      default: {
        shadowColor: CYAN,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 20,
      },
    }),
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  glowLogoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CYAN,
    marginRight: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px #00E5FF',
      } as any,
    }),
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: CYAN,
    letterSpacing: 3,
  },
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: -2,
    padding: 6,
  },
  rowSection: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0, 229, 255, 0.65)',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  sliderTrack: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cardTouchTarget: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCard: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    letterSpacing: 1,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  nextCapsuleBtn: {
    width: '78%',
    maxWidth: 260,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: CYAN,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 22px rgba(0, 229, 255, 0.6), inset 0 0 10px rgba(0, 229, 255, 0.2)',
        cursor: 'pointer',
      } as any,
      default: {
        shadowColor: CYAN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: CYAN,
    letterSpacing: 2.5,
  },
});
