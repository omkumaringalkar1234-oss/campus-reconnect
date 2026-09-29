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
    BranchData,
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

// ─── Ambient Blob ─────────────────────────────────────────────────────────────
function AmbientBlob({
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
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(op, { toValue: 0.35, duration: 1600, useNativeDriver: true }).start();
    const animate = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(tx, { toValue: x + 80, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tx, { toValue: x - 50, duration: dur * 1.1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tx, { toValue: x, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ty, { toValue: y - 100, duration: dur * 1.2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(ty, { toValue: y + 70, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(ty, { toValue: y, duration: dur * 0.9, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(sc, { toValue: 1.3, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(sc, { toValue: 0.8, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(sc, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start(animate);
    };
    animate();
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

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({
  steps,
  current,
  color,
}: {
  steps: string[];
  current: number;
  color: string;
}) {
  return (
    <View style={si.container}>
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <View style={si.stepItem}>
              <View
                style={[
                  si.circle,
                  isDone && { backgroundColor: color, borderColor: color },
                  isActive && { borderColor: color, borderWidth: 2 },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                ) : (
                  <Text style={[si.stepNum, isActive && { color }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[si.stepLabel, (isDone || isActive) && { color: isActive ? color : 'rgba(255,255,255,0.5)' }]}>
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[si.line, isDone && { backgroundColor: color }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const si = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 0,
  },
  stepItem: { alignItems: 'center', gap: 5 },
  circle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.3)' },
  stepLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 0.4 },
  line: {
    flex: 1, height: 1.5, backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16, marginHorizontal: 6,
  },
});

// ─── Branch Card ──────────────────────────────────────────────────────────────
function BranchCard({
  branch,
  selected,
  onPress,
}: {
  branch: BranchData;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 14 }),
    ]).start();
    onPress();
  };

  const cardW = Math.min((SCREEN_W - 72) / 3, 108);

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          bCard.card,
          { width: cardW, height: cardW * 1.15, transform: [{ scale }] },
          selected && {
            borderColor: branch.color,
            backgroundColor: `${branch.color}18`,
          },
        ]}
      >
        {/* Glow layer */}
        {selected && (
          <Animated.View
            style={[
              bCard.glow,
              { backgroundColor: branch.color, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }) },
            ]}
          />
        )}

        <Text style={bCard.emoji}>{branch.emoji}</Text>
        <Text style={[bCard.code, selected && { color: branch.color }]}>{branch.branchCode}</Text>
        <Text style={bCard.name} numberOfLines={2}>{branch.branchLabel}</Text>

        {selected && (
          <View style={[bCard.check, { backgroundColor: branch.color }]}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const bCard = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
  },
  emoji: { fontSize: 28, marginBottom: 6 },
  code: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  name: { fontSize: 9, color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontWeight: '600', lineHeight: 13 },
  check: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Glass Pill Option ────────────────────────────────────────────────────────
function GlassPill({
  label,
  sublabel,
  selected,
  color,
  onPress,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  color: string;
  onPress: () => void;
}) {
  const sc = useRef(new Animated.Value(1)).current;
  const bg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bg, { toValue: selected ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [selected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(sc, { toValue: 0.94, duration: 70, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          gp.pill,
          {
            transform: [{ scale: sc }],
            borderColor: selected ? color : 'rgba(255,255,255,0.12)',
            backgroundColor: bg.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255,255,255,0.04)', `${color}22`],
            }),
          },
        ]}
      >
        {selected && (
          <View style={[gp.selectedDot, { backgroundColor: color }]} />
        )}
        <View>
          <Text style={[gp.label, selected && { color: '#FFF' }]}>{label}</Text>
          {sublabel && <Text style={gp.sublabel}>{sublabel}</Text>}
        </View>
        {selected && (
          <View style={[gp.checkIcon, { backgroundColor: `${color}30` }]}>
            <Ionicons name="checkmark" size={14} color={color} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const gp = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, borderWidth: 1.5,
    paddingHorizontal: 20, paddingVertical: 15,
    minWidth: 140, gap: 10,
  },
  selectedDot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.55)' },
  sublabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '600', marginTop: 1 },
  checkIcon: { marginLeft: 'auto', width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

// ─── Main Wizard ──────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onComplete: (prefs: SchedulePrefs) => void;
}

export function ScheduleOnboardingWizard({ visible, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const slideX = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const sheetAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(sheetAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 14,
      }).start();
    } else {
      Animated.timing(sheetAnim, {
        toValue: SCREEN_H,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const branch = TIMETABLE_BRANCHES.find((b) => b.branchId === selectedBranch);
  const division = branch?.divisions.find((d) => d.divisionId === selectedDivision);
  const branchColor = branch?.color || '#9B5CFF';

  const animateStep = (toStep: number) => {
    const dir = toStep > step ? 1 : -1;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 0, duration: 130, useNativeDriver: true }),
        Animated.timing(slideX, { toValue: -dir * 30, duration: 130, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setStep(toStep);
      slideX.setValue(dir * 30);
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideX, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  };

  const canProceed =
    (step === 0 && !!selectedBranch) ||
    (step === 1 && !!selectedDivision) ||
    (step === 2 && !!selectedBatch);

  const handleNext = () => {
    if (step === 0 && selectedBranch) animateStep(1);
    else if (step === 1 && selectedDivision) animateStep(2);
    else if (step === 2 && selectedBatch) handleFinish();
  };

  const handleFinish = async () => {
    if (!branch || !division || !selectedBatch) return;
    const batchObj = division.batches.find((b) => b.batchId === selectedBatch)!;
    const prefs: SchedulePrefs = {
      branchId: selectedBranch!,
      divisionId: selectedDivision!,
      batchId: selectedBatch,
      branchLabel: branch.branchLabel,
      divisionLabel: division.divisionLabel,
      batchLabel: batchObj.batchLabel,
      savedAt: new Date().toISOString(),
    };
    await saveSchedulePrefs(prefs);
    onComplete(prefs);
  };

  const stepLabels = ['Branch', 'Division', 'Batch'];
  const stepTitles = [
    'Which branch?',
    'Which division?',
    'Which batch?',
  ];
  const stepSubtitles = [
    'Select your engineering branch',
    `${branch?.branchLabel || 'Your branch'} — pick your class division`,
    `${division?.divisionLabel || 'Your division'} — pick your lab batch`,
  ];

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      {/* Darkened backdrop */}
      <View style={wiz.backdrop}>
        {/* Ambient blobs in background */}
        <AmbientBlob color="#7C3AED" size={280} x={-60} y={-40} dur={4800} />
        <AmbientBlob color={branchColor} size={220} x={SCREEN_W - 140} y={180} dur={5600} />
        <AmbientBlob color="#EC4899" size={180} x={40} y={SCREEN_H * 0.65} dur={3900} />

        {/* Sheet */}
        <Animated.View
          style={[
            wiz.sheet,
            { transform: [{ translateY: sheetAnim }] },
          ]}
        >
          {/* Handle bar */}
          <View style={wiz.handle} />

          {/* College tag */}
          <View style={wiz.collegeTag}>
            <Text style={wiz.collegeTagEmoji}>🎓</Text>
            <View>
              <Text style={wiz.collegeTagName}>JSPM Tathawade</Text>
              <Text style={wiz.collegeTagSub}>FY B.Tech · SEM-I · 2026–27</Text>
            </View>
          </View>

          {/* Step indicator */}
          <StepIndicator steps={stepLabels} current={step} color={branchColor} />

          {/* Step content */}
          <Animated.View
            style={[
              wiz.stepContent,
              { opacity: contentFade, transform: [{ translateX: slideX }] },
            ]}
          >
            <Text style={wiz.stepTitle}>{stepTitles[step]}</Text>
            <Text style={wiz.stepSub}>{stepSubtitles[step]}</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={wiz.scrollContent}
            >
              {/* STEP 0: Branch grid */}
              {step === 0 && (
                <View style={wiz.branchGrid}>
                  {TIMETABLE_BRANCHES.map((b) => (
                    <BranchCard
                      key={b.branchId}
                      branch={b}
                      selected={selectedBranch === b.branchId}
                      onPress={() => {
                        setSelectedBranch(b.branchId);
                        setSelectedDivision(null);
                        setSelectedBatch(null);
                      }}
                    />
                  ))}
                </View>
              )}

              {/* STEP 1: Divisions */}
              {step === 1 && branch && (
                <View style={wiz.pillGrid}>
                  {branch.divisions.map((div) => (
                    <GlassPill
                      key={div.divisionId}
                      label={div.divisionLabel}
                      sublabel={`${div.batches.length} batches`}
                      selected={selectedDivision === div.divisionId}
                      color={branchColor}
                      onPress={() => { setSelectedDivision(div.divisionId); setSelectedBatch(null); }}
                    />
                  ))}
                </View>
              )}

              {/* STEP 2: Batches */}
              {step === 2 && branch && division && (
                <>
                  <View style={wiz.batchHintBox}>
                    <Ionicons name="information-circle-outline" size={15} color="#C4AAFF" />
                    <Text style={wiz.batchHint}>
                      Lab batches rotate practicals on different days. Select yours carefully.
                    </Text>
                  </View>
                  <View style={wiz.pillGrid}>
                    {division.batches.map((batch) => (
                      <GlassPill
                        key={batch.batchId}
                        label={batch.batchLabel}
                        selected={selectedBatch === batch.batchId}
                        color={branchColor}
                        onPress={() => setSelectedBatch(batch.batchId)}
                      />
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>

          {/* Footer */}
          <View style={wiz.footer}>
            {step > 0 ? (
              <Pressable style={wiz.backBtn} onPress={() => animateStep(step - 1)}>
                <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.5)" />
                <Text style={wiz.backText}>Back</Text>
              </Pressable>
            ) : <View />}

            <Pressable
              style={[
                wiz.nextBtn,
                canProceed
                  ? { backgroundColor: branchColor }
                  : { backgroundColor: 'rgba(255,255,255,0.07)' },
              ]}
              onPress={handleNext}
              disabled={!canProceed}
            >
              {step === 2 ? (
                <>
                  <Text style={[wiz.nextText, !canProceed && { color: 'rgba(255,255,255,0.25)' }]}>
                    ✨ Let's go!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[wiz.nextText, !canProceed && { color: 'rgba(255,255,255,0.25)' }]}>
                    Continue
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={canProceed ? '#FFF' : 'rgba(255,255,255,0.25)'} />
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const wiz = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,0,14,0.88)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  sheet: {
    backgroundColor: '#0D0020',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(196,170,255,0.18)',
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    maxHeight: SCREEN_H * 0.9,
    minHeight: SCREEN_H * 0.72,
  },
  handle: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: 20,
  },
  collegeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,170,255,0.12)',
    padding: 12, marginBottom: 24,
  },
  collegeTagEmoji: { fontSize: 24 },
  collegeTagName: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  collegeTagSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginTop: 1 },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 5, lineHeight: 34,
  },
  stepSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginBottom: 22, lineHeight: 20,
  },
  scrollContent: { paddingBottom: 16 },
  branchGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
  },
  pillGrid: {
    gap: 10,
  },
  batchHintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(196,170,255,0.07)',
    borderRadius: 14, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(196,170,255,0.12)',
  },
  batchHint: {
    flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '600', lineHeight: 18,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, marginTop: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  backText: { fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: '700' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 28,
  },
  nextText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
