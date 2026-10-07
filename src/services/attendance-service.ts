// ─── Attendance Tracking & Safety Intelligence Service ─────────────────────────
// Ported & enhanced from: https://github.com/samarthdahiwal438-source/rscoetimetable
// Implements 75% minimum threshold mathematics, streak analytics, and local persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'NOT_CONDUCTED';

export interface AttendanceRecord {
  id: string;             // unique identifier e.g. "2026-10-06_Calculus_10:45"
  date: string;           // "YYYY-MM-DD" in IST
  subject: string;        // e.g. "Calculus" or "Engineering Mechanics"
  subjectCode?: string;   // e.g. "ES1301T"
  slotTime?: string;      // e.g. "10:45 AM – 11:45 AM"
  status: AttendanceStatus;
  notes?: string;
  timestamp: number;
}

export interface AttendanceCounts {
  present: number;
  absent: number;
  notConducted: number;
  totalCounted: number;   // present + absent (classes that impact % attendance)
  percentage: number | null;
}

export interface SubjectAttendanceStat extends AttendanceCounts {
  subject: string;
  subjectCode?: string;
  statusTone: 'green' | 'amber' | 'red' | 'none';
  canMissCount: number;
  mustAttendCount: number;
  insightText: string;
}

export interface AttendanceSummary {
  overall: AttendanceCounts;
  statusTone: 'green' | 'amber' | 'red' | 'none';
  canMissCount: number;
  mustAttendCount: number;
  insightText: string;
  dayStreak: number;
  rowStreak: number;
  bySubject: SubjectAttendanceStat[];
  recentRecords: AttendanceRecord[];
}

const STORAGE_KEY = '@campus_connect_attendance_v1';
export const TARGET_PERCENT = 75;
export const MIN_SAMPLE_FOR_PREDICTIONS = 3;

/** Today's date string in Asia/Kolkata timezone: YYYY-MM-DD */
export function getTodayIST(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/** Determines visual alert tone based on attendance percentage */
export function getPercentTone(percent: number | null): 'green' | 'amber' | 'red' | 'none' {
  if (percent === null) return 'none';
  if (percent >= 75) return 'green';
  if (percent >= 65) return 'amber';
  return 'red';
}

/** Calculates how many more classes can be safely skipped while staying >= 75% */
export function calculateCanMiss(present: number, total: number, target = TARGET_PERCENT): number {
  if (total === 0) return 0;
  const t = target / 100;
  // Formula: present / (total + x) >= t  =>  x <= present / t - total
  return Math.max(0, Math.floor(present / t - total + 1e-9));
}

/** Calculates consecutive classes that must be attended to reach 75% */
export function calculateMustAttend(present: number, total: number, target = TARGET_PERCENT): number {
  const t = target / 100;
  if (total === 0 || present / total >= t) return 0;
  // Formula: (present + x) / (total + x) >= t  =>  x >= (t*total - present) / (1 - t)
  return Math.ceil((t * total - present) / (1 - t) - 1e-9);
}

export function computeCounts(records: { status: AttendanceStatus }[]): AttendanceCounts {
  let present = 0;
  let absent = 0;
  let notConducted = 0;

  for (const r of records) {
    if (r.status === 'PRESENT') present++;
    else if (r.status === 'ABSENT') absent++;
    else if (r.status === 'NOT_CONDUCTED') notConducted++;
  }

  const totalCounted = present + absent;
  const percentage = totalCounted > 0 ? Math.round((present / totalCounted) * 100) : null;

  return { present, absent, notConducted, totalCounted, percentage };
}

/** Compute consecutive streak values */
export function computeStreaks(records: AttendanceRecord[]): { dayStreak: number; rowStreak: number } {
  const counted = records
    .filter((r) => r.status !== 'NOT_CONDUCTED')
    .sort((a, b) => b.timestamp - a.timestamp);

  // Row streak: consecutive PRESENT classes starting from most recent
  let rowStreak = 0;
  for (const r of counted) {
    if (r.status === 'PRESENT') rowStreak++;
    else break;
  }

  // Day streak: group by date
  const byDate = new Map<string, AttendanceRecord[]>();
  for (const r of counted) {
    const list = byDate.get(r.date) || [];
    list.push(r);
    byDate.set(r.date, list);
  }

  const sortedDates = Array.from(byDate.keys()).sort().reverse();
  let dayStreak = 0;
  for (const d of sortedDates) {
    const dayRecords = byDate.get(d) || [];
    const hasAbsent = dayRecords.some((r) => r.status === 'ABSENT');
    const hasPresent = dayRecords.some((r) => r.status === 'PRESENT');

    if (hasAbsent) break;
    if (hasPresent) dayStreak++;
  }

  return { dayStreak, rowStreak };
}

export function getOverallInsight(present: number, total: number): { tone: 'green' | 'amber' | 'none'; text: string } {
  if (total < MIN_SAMPLE_FOR_PREDICTIONS) {
    return { tone: 'none', text: `Log at least ${MIN_SAMPLE_FOR_PREDICTIONS} classes to see attendance forecast.` };
  }
  const pct = (present / total) * 100;
  if (pct >= TARGET_PERCENT) {
    const n = calculateCanMiss(present, total);
    return n === 0
      ? { tone: 'amber', text: "You're right at 75%. Missing the next class will put you in the shortage zone!" }
      : { tone: 'green', text: `Bunk buffer: You can safely miss ${n} more ${n === 1 ? 'class' : 'classes'} and stay above 75%.` };
  }
  const n = calculateMustAttend(present, total);
  return {
    tone: 'amber',
    text: `Attendance Warning: Attend your next ${n} consecutive ${n === 1 ? 'class' : 'classes'} to cross 75%!`,
  };
}

export const AttendanceService = {
  /** Fetch all saved attendance records from local storage */
  async getAllRecords(): Promise<AttendanceRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as AttendanceRecord[];
    } catch (e) {
      console.warn('Failed to load attendance records:', e);
      return [];
    }
  },

  /** Save or update an attendance record */
  async recordStatus(record: Omit<AttendanceRecord, 'timestamp'>): Promise<AttendanceRecord[]> {
    try {
      const existing = await this.getAllRecords();
      const updatedItem: AttendanceRecord = {
        ...record,
        timestamp: Date.now(),
      };

      const filtered = existing.filter((r) => r.id !== record.id);
      const nextRecords = [updatedItem, ...filtered];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
      return nextRecords;
    } catch (e) {
      console.warn('Failed to save attendance record:', e);
      return [];
    }
  },

  /** Remove an attendance record by ID */
  async removeRecord(id: string): Promise<AttendanceRecord[]> {
    try {
      const existing = await this.getAllRecords();
      const nextRecords = existing.filter((r) => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
      return nextRecords;
    } catch (e) {
      console.warn('Failed to remove attendance record:', e);
      return [];
    }
  },

  /** Compute full analytics summary */
  async getSummary(): Promise<AttendanceSummary> {
    const records = await this.getAllRecords();
    const overallCounts = computeCounts(records);
    const tone = getPercentTone(overallCounts.percentage);
    const insight = getOverallInsight(overallCounts.present, overallCounts.totalCounted);
    const canMissCount = calculateCanMiss(overallCounts.present, overallCounts.totalCounted);
    const mustAttendCount = calculateMustAttend(overallCounts.present, overallCounts.totalCounted);
    const { dayStreak, rowStreak } = computeStreaks(records);

    // Group by subject
    const subjectMap = new Map<string, AttendanceRecord[]>();
    for (const r of records) {
      const list = subjectMap.get(r.subject) || [];
      list.push(r);
      subjectMap.set(r.subject, list);
    }

    const bySubject: SubjectAttendanceStat[] = Array.from(subjectMap.entries())
      .map(([subj, list]) => {
        const counts = computeCounts(list);
        const subTone = getPercentTone(counts.percentage);
        const subCanMiss = calculateCanMiss(counts.present, counts.totalCounted);
        const subMustAttend = calculateMustAttend(counts.present, counts.totalCounted);
        let text = '';
        if (counts.totalCounted < MIN_SAMPLE_FOR_PREDICTIONS) {
          text = `${counts.present}/${counts.totalCounted} classes marked.`;
        } else if ((counts.percentage || 0) >= TARGET_PERCENT) {
          text = subCanMiss === 0 ? 'Borderline 75%' : `Can miss ${subCanMiss} class${subCanMiss === 1 ? '' : 'es'}`;
        } else {
          text = `Need ${subMustAttend} in a row to reach 75%`;
        }

        return {
          subject: subj,
          subjectCode: list[0]?.subjectCode,
          ...counts,
          statusTone: subTone,
          canMissCount: subCanMiss,
          mustAttendCount: subMustAttend,
          insightText: text,
        };
      })
      .sort((a, b) => a.subject.localeCompare(b.subject));

    return {
      overall: overallCounts,
      statusTone: tone,
      canMissCount,
      mustAttendCount,
      insightText: insight.text,
      dayStreak,
      rowStreak,
      bySubject,
      recentRecords: records.slice(0, 20),
    };
  },

  /** Generate standard ID for slot to avoid duplicate entries for the same slot on the same day */
  generateSlotId(dateIso: string, subject: string, startTime: string): string {
    const cleanSubj = subject.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanTime = startTime.replace(/[^a-zA-Z0-9]/g, '_');
    return `${dateIso}_${cleanSubj}_${cleanTime}`;
  },
};
