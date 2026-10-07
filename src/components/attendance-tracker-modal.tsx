import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import {
  AttendanceService,
  AttendanceSummary,
  AttendanceRecord,
  AttendanceStatus,
  getTodayIST,
  TARGET_PERCENT,
} from '@/services/attendance-service';
import { TimetableEntry } from '@/services/timetable-data';

interface AttendanceTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  todaySlots?: TimetableEntry[];
}

export function AttendanceTrackerModal({
  visible,
  onClose,
  todaySlots = [],
}: AttendanceTrackerModalProps) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayRecords, setTodayRecords] = useState<Record<string, AttendanceStatus>>({});

  const todayIso = useMemo(() => getTodayIST(), []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await AttendanceService.getSummary();
      setSummary(data);

      // Map today's marked statuses
      const allRecs = await AttendanceService.getAllRecords();
      const todayMap: Record<string, AttendanceStatus> = {};
      allRecs
        .filter((r) => r.date === todayIso)
        .forEach((r) => {
          todayMap[r.id] = r.status;
        });
      setTodayRecords(todayMap);
    } catch (e) {
      console.error('Failed to load attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const handleMarkSlot = async (slot: TimetableEntry, status: AttendanceStatus) => {
    const slotId = AttendanceService.generateSlotId(todayIso, slot.subject, slot.startTime);
    const existing = todayRecords[slotId];

    // If clicking same status, remove it (toggle off)
    if (existing === status) {
      await AttendanceService.removeRecord(slotId);
      setTodayRecords((prev) => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    } else {
      await AttendanceService.recordStatus({
        id: slotId,
        date: todayIso,
        subject: slot.originalSubject || slot.subject,
        subjectCode: slot.subjectCode,
        slotTime: `${slot.startTime} – ${slot.endTime}`,
        status,
      });
      setTodayRecords((prev) => ({ ...prev, [slotId]: status }));
    }

    // Refresh summary
    const updated = await AttendanceService.getSummary();
    setSummary(updated);
  };

  const overall = summary?.overall;
  const pct = overall?.percentage ?? null;

  let toneColor = Glass.purpleBright;
  let toneBg = 'rgba(196, 170, 255, 0.15)';
  if (summary?.statusTone === 'green') {
    toneColor = '#4ADE80';
    toneBg = 'rgba(74, 222, 128, 0.15)';
  } else if (summary?.statusTone === 'amber') {
    toneColor = Glass.gold;
    toneBg = 'rgba(255, 184, 75, 0.15)';
  } else if (summary?.statusTone === 'red') {
    toneColor = '#F87171';
    toneBg = 'rgba(248, 113, 113, 0.15)';
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Ionicons name="shield-checkmark" size={22} color={Glass.purple} />
                <Text style={styles.titleText}>Attendance Tracker</Text>
              </View>
              <Text style={styles.subtitleText}>Target: {TARGET_PERCENT}% minimum threshold</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Glass.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Top Stat Card */}
            <View style={[styles.mainStatCard, { borderColor: `${toneColor}40` }]}>
              <View style={styles.statTopRow}>
                <View>
                  <Text style={styles.statLabel}>OVERALL ATTENDANCE</Text>
                  <View style={styles.pctRow}>
                    <Text style={[styles.pctNumber, { color: toneColor }]}>
                      {pct !== null ? `${pct}%` : '—'}
                    </Text>
                    {pct !== null && (
                      <View style={[styles.pctBadge, { backgroundColor: toneBg }]}>
                        <Text style={[styles.pctBadgeText, { color: toneColor }]}>
                          {pct >= TARGET_PERCENT ? 'SAFE' : 'LOW ATTENDANCE'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Streak Counter */}
                <View style={styles.streakBox}>
                  <Ionicons name="flame" size={20} color="#FF6B4A" />
                  <Text style={styles.streakCount}>{summary?.dayStreak || 0}d</Text>
                  <Text style={styles.streakLabel}>Streak</Text>
                </View>
              </View>

              {/* Bunk / Safety Intelligence Text */}
              <View style={styles.insightBox}>
                <Ionicons
                  name={summary?.statusTone === 'green' ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={toneColor}
                />
                <Text style={[styles.insightText, { color: Glass.text }]}>
                  {summary?.insightText || 'Log classes to view bunk buffer calculation.'}
                </Text>
              </View>

              {/* Counts footer */}
              <View style={styles.countsRow}>
                <View style={styles.countItem}>
                  <Text style={styles.countVal}>{overall?.present || 0}</Text>
                  <Text style={styles.countTag}>Attended</Text>
                </View>
                <View style={styles.countDivider} />
                <View style={styles.countItem}>
                  <Text style={styles.countVal}>{overall?.absent || 0}</Text>
                  <Text style={styles.countTag}>Missed</Text>
                </View>
                <View style={styles.countDivider} />
                <View style={styles.countItem}>
                  <Text style={styles.countVal}>{overall?.notConducted || 0}</Text>
                  <Text style={styles.countTag}>Cancelled</Text>
                </View>
                <View style={styles.countDivider} />
                <View style={styles.countItem}>
                  <Text style={styles.countVal}>{overall?.totalCounted || 0}</Text>
                  <Text style={styles.countTag}>Total Conducted</Text>
                </View>
              </View>
            </View>

            {/* Today's Classes to Mark */}
            {todaySlots.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="today-outline" size={16} color={Glass.purple} />
                  <Text style={styles.sectionTitle}>Today's Classes</Text>
                  <Text style={styles.sectionDate}>{todayIso}</Text>
                </View>

                {todaySlots.map((slot, idx) => {
                  const slotId = AttendanceService.generateSlotId(
                    todayIso,
                    slot.subject,
                    slot.startTime
                  );
                  const currentStatus = todayRecords[slotId];

                  return (
                    <View key={`${slot.startTime}-${idx}`} style={styles.slotCard}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.slotTime}>{slot.time}</Text>
                        <Text style={styles.slotSubject} numberOfLines={1}>
                          {slot.subject}
                        </Text>
                        <Text style={styles.slotTeacher}>
                          {slot.room} · {slot.teacherShort || slot.teacher}
                        </Text>
                      </View>

                      {/* Action buttons */}
                      <View style={styles.markButtonsRow}>
                        {/* Present */}
                        <Pressable
                          style={[
                            styles.markBtn,
                            currentStatus === 'PRESENT' && styles.markBtnPresentActive,
                          ]}
                          onPress={() => handleMarkSlot(slot, 'PRESENT')}
                        >
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={currentStatus === 'PRESENT' ? '#FFF' : '#4ADE80'}
                          />
                        </Pressable>

                        {/* Absent */}
                        <Pressable
                          style={[
                            styles.markBtn,
                            currentStatus === 'ABSENT' && styles.markBtnAbsentActive,
                          ]}
                          onPress={() => handleMarkSlot(slot, 'ABSENT')}
                        >
                          <Ionicons
                            name="close"
                            size={16}
                            color={currentStatus === 'ABSENT' ? '#FFF' : '#F87171'}
                          />
                        </Pressable>

                        {/* Cancelled */}
                        <Pressable
                          style={[
                            styles.markBtn,
                            currentStatus === 'NOT_CONDUCTED' && styles.markBtnCancelActive,
                          ]}
                          onPress={() => handleMarkSlot(slot, 'NOT_CONDUCTED')}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={currentStatus === 'NOT_CONDUCTED' ? '#FFF' : Glass.textMuted}
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Subject-Wise Breakdown */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="bar-chart-outline" size={16} color={Glass.purple} />
                <Text style={styles.sectionTitle}>Subject Breakdown</Text>
              </View>

              {(!summary?.bySubject || summary.bySubject.length === 0) && (
                <View style={styles.emptySubjectBox}>
                  <Text style={styles.emptySubjectText}>
                    No subject records yet. Mark your classes above to see subject statistics!
                  </Text>
                </View>
              )}

              {summary?.bySubject?.map((s) => {
                const subPct = s.percentage;
                let subColor = '#4ADE80';
                if (s.statusTone === 'amber') subColor = Glass.gold;
                if (s.statusTone === 'red') subColor = '#F87171';

                return (
                  <View key={s.subject} style={styles.subjectCard}>
                    <View style={styles.subTopRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.subjectTitle}>{s.subject}</Text>
                        {s.subjectCode && (
                          <Text style={styles.subjectCode}>{s.subjectCode}</Text>
                        )}
                      </View>
                      <View style={styles.subPctWrap}>
                        <Text style={[styles.subPctNum, { color: subColor }]}>
                          {subPct !== null ? `${subPct}%` : '—'}
                        </Text>
                        <Text style={styles.subAttendedRatio}>
                          {s.present}/{s.totalCounted}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, subPct || 0)}%`,
                            backgroundColor: subColor,
                          },
                        ]}
                      />
                    </View>

                    {/* Prediction line */}
                    <Text style={styles.subInsightText}>{s.insightText}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F0318',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(196,170,255,0.25)',
    maxHeight: '92%',
    minHeight: '75%',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: Glass.text,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  subtitleText: {
    fontSize: 12,
    color: Glass.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  mainStatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Glass.purple,
    letterSpacing: 0.8,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  pctNumber: {
    fontSize: 34,
    fontWeight: '800',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pctBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  streakBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 74, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.3)',
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF8A65',
    marginTop: 2,
  },
  streakLabel: {
    fontSize: 9,
    color: '#FFA285',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  insightText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  countItem: {
    alignItems: 'center',
  },
  countVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Glass.text,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  countTag: {
    fontSize: 10,
    color: Glass.textMuted,
    marginTop: 2,
  },
  countDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Glass.text,
    fontFamily: 'SpaceGrotesk_700Bold',
    flex: 1,
  },
  sectionDate: {
    fontSize: 11,
    color: Glass.textMuted,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  slotTime: {
    fontSize: 10,
    color: Glass.purple,
    fontWeight: '700',
  },
  slotSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: Glass.text,
    marginTop: 2,
  },
  slotTeacher: {
    fontSize: 11,
    color: Glass.textMuted,
    marginTop: 2,
  },
  markButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  markBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  markBtnPresentActive: {
    backgroundColor: '#16A34A',
    borderColor: '#22C55E',
  },
  markBtnAbsentActive: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  markBtnCancelActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: Glass.textSub,
  },
  emptySubjectBox: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptySubjectText: {
    fontSize: 12,
    color: Glass.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  subjectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  subTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Glass.text,
  },
  subjectCode: {
    fontSize: 10,
    color: Glass.purple,
    fontWeight: '600',
    marginTop: 1,
  },
  subPctWrap: {
    alignItems: 'flex-end',
  },
  subPctNum: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  subAttendedRatio: {
    fontSize: 10,
    color: Glass.textMuted,
    marginTop: 1,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  subInsightText: {
    fontSize: 11,
    color: Glass.textSub,
  },
});
