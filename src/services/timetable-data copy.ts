// ─── JSPM Tathawade FY B.Tech Timetable Data ─────────────────────────────────
// Matches: https://rscoetimetable.lovable.app/
// Structure: Branch → Division → Batch → Week Schedule
// AY 2026-2027, SEM-I

export interface TimetableEntry {
  time: string;   // e.g. "08:15 – 09:15"
  startTime: string; // "08:15 AM"
  endTime: string;   // "09:15 AM"
  subject: string;
  subjectCode?: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'break';
  room: string;
  teacher: string;
  teacherShort: string;
}

export interface DaySchedule {
  day: string;  // "Monday"
  dayShort: string; // "Mon"
  dayNum: number; // 1=Mon..5=Fri
  slots: TimetableEntry[];
}

export interface BatchSchedule {
  batchId: string;  // "B1", "B2", "B3"
  batchLabel: string; // "Batch 1", "Batch 2", "Batch 3"
  schedule: DaySchedule[];
}

export interface DivisionSchedule {
  divisionId: string;  // "A", "B"
  divisionLabel: string; // "Division A"
  batches: BatchSchedule[];
}

export interface BranchData {
  branchId: string;  // "CE", "IT", "ENTC", "ME", "CIVIL", "AIDS"
  branchLabel: string; // "Computer Engineering"
  branchCode: string;  // "CE"
  emoji: string;
  color: string;
  divisions: DivisionSchedule[];
}

export interface StudentScheduleContext {
  prn: string;
  branchId: string;
  branchLabel: string;
  section: string;
  subsection: string;
  divisionId: string;
  batchId: string;
}

const PRN_BRANCH_ALIAS_MAP: Record<string, string> = {
  ENTC: 'ENTC',
  ELECT: 'ENTC',
  'ELECTRICAL': 'ENTC',
  CIVIL: 'CIVIL',
  MECHANICAL: 'ME',
  'A & R': 'AR',
  CSBS: 'CSBS',
  COMP: 'CE',
  COMPUTER: 'CE',
  IT: 'IT',
};

const PRN_BRANCH_LABEL_MAP: Record<string, string> = {
  ENTC: 'Electronics & Telecom',
  CIVIL: 'Civil Engineering',
  ME: 'Mechanical Engineering',
  AR: 'A & R',
  CSBS: 'Computer Science & Business Systems',
  CE: 'Computer Engineering',
  IT: 'Information Technology',
};

const PRN_SECTION_DATA = [
  { start: 'RBT26ET01', end: 'RBT26ET24', branchId: 'ENTC', section: 'A', subsection: 'A1' },
  { start: 'RBT26ET25', end: 'RBT26ET46', branchId: 'ENTC', section: 'A', subsection: 'A2' },
  { start: 'RBT26ET47', end: 'RBT26ET69', branchId: 'ENTC', section: 'A', subsection: 'A3' },
  { start: 'RBT26ET70', end: 'RBT26ET90', branchId: 'ENTC', section: 'B', subsection: 'B1' },
  { start: 'RBT26ET91', end: 'RBT26ET114', branchId: 'ENTC', section: 'B', subsection: 'B2' },
  { start: 'RBT26ET115', end: 'RBT26ET137', branchId: 'ENTC', section: 'B', subsection: 'B3' },
  { start: 'RBT26EL01', end: 'RBT26EL22', branchId: 'ENTC', section: 'C', subsection: 'C1' },
  { start: 'RBT26EL23', end: 'RBT26EL45', branchId: 'ENTC', section: 'C', subsection: 'C2' },
  { start: 'RBT26EL46', end: 'RBT26EL67', branchId: 'ENTC', section: 'C', subsection: 'C3' },
  { start: 'RBT26CE01', end: 'RBT26CE24', branchId: 'CIVIL', section: 'D', subsection: 'D1' },
  { start: 'RBT26CE25', end: 'RBT26CE48', branchId: 'CIVIL', section: 'D', subsection: 'D2' },
  { start: 'RBT26CE49', end: 'RBT26CE74', branchId: 'CIVIL', section: 'D', subsection: 'D3' },
  { start: 'RBT26ME01', end: 'RBT26ME22', branchId: 'ME', section: 'E', subsection: 'E1' },
  { start: 'RBT26ME23', end: 'RBT26ME44', branchId: 'ME', section: 'E', subsection: 'E2' },
  { start: 'RBT26ME45', end: 'RBT26ME65', branchId: 'ME', section: 'E', subsection: 'E3' },
  { start: 'RBT26ME66', end: 'RBT26ME89', branchId: 'ME', section: 'F', subsection: 'F1' },
  { start: 'RBT26ME90', end: 'RBT26ME115', branchId: 'ME', section: 'F', subsection: 'F2' },
  { start: 'RBT26ME116', end: 'RBT26ME135', branchId: 'ME', section: 'F', subsection: 'F3' },
  { start: 'RBT26ME136', end: 'RBT26ME157', branchId: 'ME', section: 'G', subsection: 'G1' },
  { start: 'RBT26ME158', end: 'RBT26ME181', branchId: 'ME', section: 'G', subsection: 'G2' },
  { start: 'RBT26ME182', end: 'RBT26ME204', branchId: 'ME', section: 'G', subsection: 'G3' },
  { start: 'RBT26AR01', end: 'RBT26AR19', branchId: 'AR', section: 'H', subsection: 'H1' },
  { start: 'RBT26AR20', end: 'RBT26AR41', branchId: 'AR', section: 'H', subsection: 'H2' },
  { start: 'RBT26AR42', end: 'RBT26AR63', branchId: 'AR', section: 'H', subsection: 'H3' },
  { start: 'RBT26CB01', end: 'RBT26CB22', branchId: 'CSBS', section: 'I', subsection: 'I1' },
  { start: 'RBT26CB23', end: 'RBT26CB45', branchId: 'CSBS', section: 'I', subsection: 'I2' },
  { start: 'RBT26CB46', end: 'RBT26CB69', branchId: 'CSBS', section: 'I', subsection: 'I3' },
  { start: 'RBT26CS01', end: 'RBT26CS23', branchId: 'CE', section: 'J', subsection: 'J1' },
  { start: 'RBT26CS24', end: 'RBT26CS46', branchId: 'CE', section: 'J', subsection: 'J2' },
  { start: 'RBT26CS47', end: 'RBT26CS67', branchId: 'CE', section: 'J', subsection: 'J3' },
  { start: 'RBT26CS68', end: 'RBT26CS90', branchId: 'CE', section: 'K', subsection: 'K1' },
  { start: 'RBT26CS91', end: 'RBT26CS113', branchId: 'CE', section: 'K', subsection: 'K2' },
  { start: 'RBT26CS114', end: 'RBT26CS137', branchId: 'CE', section: 'K', subsection: 'K3' },
  { start: 'RBT26CS138', end: 'RBT26CS160', branchId: 'CE', section: 'L', subsection: 'L1' },
  { start: 'RBT26CS161', end: 'RBT26CS183', branchId: 'CE', section: 'L', subsection: 'L2' },
  { start: 'RBT26CS184', end: 'RBT26CS206', branchId: 'CE', section: 'L', subsection: 'L3' },
  { start: 'RBT26IT01', end: 'RBT26IT23', branchId: 'IT', section: 'M', subsection: 'M1' },
  { start: 'RBT26IT24', end: 'RBT26IT46', branchId: 'IT', section: 'M', subsection: 'M2' },
  { start: 'RBT26IT47', end: 'RBT26IT68', branchId: 'IT', section: 'M', subsection: 'M3' },
  { start: 'RBT26IT69', end: 'RBT26IT91', branchId: 'IT', section: 'N', subsection: 'N1' },
  { start: 'RBT26IT92', end: 'RBT26IT113', branchId: 'IT', section: 'N', subsection: 'N2' },
  { start: 'RBT26IT114', end: 'RBT26IT137', branchId: 'IT', section: 'N', subsection: 'N3' },
];

export function normalizeStudentPrn(value: string): string {
  return (value || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function resolveStudentScheduleContext(prn: string): StudentScheduleContext | null {
  const normalized = normalizeStudentPrn(prn);
  if (!normalized) return null;

  const match = PRN_SECTION_DATA.find((entry) => {
    const lowerPrn = normalized.toUpperCase();
    return lowerPrn >= entry.start && lowerPrn <= entry.end;
  });

  if (!match) return null;

  const branchId = PRN_BRANCH_ALIAS_MAP[match.branchId] || match.branchId;
  const branchLabel = PRN_BRANCH_LABEL_MAP[branchId] || match.branchId;
  const section = match.section;
  const subsection = match.subsection;
  const subsectionNumber = subsection.replace(/\D/g, '');
  const batchId = `B${subsectionNumber}`;

  const branchData = getBranchData(branchId);
  const safeDivisionId = branchData?.divisions.some((d) => d.divisionId === section)
    ? section
    : branchData?.divisions[0]?.divisionId || 'A';
  const targetDivision = branchData?.divisions.find((d) => d.divisionId === safeDivisionId) || branchData?.divisions[0];
  const safeBatchId = targetDivision?.batches.some((b) => b.batchId === batchId)
    ? batchId
    : targetDivision?.batches[0]?.batchId || 'B1';

  return {
    prn: normalized,
    branchId,
    branchLabel,
    section,
    subsection,
    divisionId: safeDivisionId,
    batchId: safeBatchId,
  };
}

export function resolveStudentSchedulePrefsFromPrn(prn: string) {
  const resolved = resolveStudentScheduleContext(prn);
  if (!resolved) return null;

  const branch = getBranchData(resolved.branchId);
  const division = branch?.divisions.find((d) => d.divisionId === resolved.divisionId) || branch?.divisions[0];
  const batch = division?.batches.find((b) => b.batchId === resolved.batchId) || division?.batches[0];

  return {
    branchId: resolved.branchId,
    divisionId: resolved.divisionId,
    batchId: resolved.batchId,
    branchLabel: resolved.branchLabel,
    divisionLabel: division?.divisionLabel || `Section ${resolved.section}`,
    batchLabel: batch?.batchLabel || `Batch ${resolved.batchId.replace('B', '')}`,
    savedAt: new Date().toISOString(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSlot(
  time: string,
  subject: string,
  room: string,
  teacher: string,
  teacherShort: string,
  type: TimetableEntry['type'] = 'lecture',
  subjectCode?: string
): TimetableEntry {
  const [startRaw, endRaw] = time.split('–').map((s) => s.trim());
  const toAmPm = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
  };
  return {
    time,
    startTime: toAmPm(startRaw),
    endTime: toAmPm(endRaw),
    subject,
    subjectCode,
    type,
    room,
    teacher,
    teacherShort,
  };
}

const BREAK = makeSlot('10:15 – 10:30', 'Break', '-', '-', '-', 'break');
const LUNCH = makeSlot('13:15 – 14:00', 'Lunch Break', '-', '-', '-', 'break');

// ─── CE (Computer Engineering) ────────────────────────────────────────────────

const CE_A_COMMON: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'CR-101', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Engineering Physics', 'CR-101', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
      BREAK,
      makeSlot('10:30 – 11:30', 'Basic Electrical Engineering', 'CR-101', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
      makeSlot('11:30 – 12:30', 'Engineering Mechanics', 'CR-101', 'Dr. Sanjay Pawar', 'Pawar S.', 'lecture', 'FEC104'),
      makeSlot('12:30 – 13:15', 'Professional Communication', 'CR-101', 'Prof. Nita Ghosh', 'Ghosh N.', 'tutorial', 'FEC105'),
      LUNCH,
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mechanics', 'CR-101', 'Dr. Sanjay Pawar', 'Pawar S.', 'lecture', 'FEC104'),
      makeSlot('09:15 – 11:15', 'Physics Lab (Batch A1)', 'PHY-LAB', 'Prof. Anil Shinde', 'Shinde A.', 'lab', 'FEC102L'),
      BREAK,
      makeSlot('11:30 – 12:30', 'Engineering Mathematics-I', 'CR-101', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
      makeSlot('12:30 – 13:15', 'Engineering Mathematics-I Tutorial', 'CR-101', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'tutorial', 'FEC101T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Basic Electrical Engineering', 'CR-101', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Physics', 'CR-101', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
      makeSlot('09:15 – 11:15', 'Computer Workshop (Batch A1)', 'CS-LAB-1', 'Prof. Rohit Kumar', 'Kumar R.', 'lab', 'FEC106L'),
      BREAK,
      makeSlot('11:30 – 12:30', 'Professional Communication', 'CR-101', 'Prof. Nita Ghosh', 'Ghosh N.', 'lecture', 'FEC105'),
      makeSlot('12:30 – 13:15', 'Engineering Mechanics Tutorial', 'CR-101', 'Dr. Sanjay Pawar', 'Pawar S.', 'tutorial', 'FEC104T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'CR-101', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:15 – 09:15', 'Basic Electrical Engineering', 'CR-101', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
      makeSlot('09:15 – 11:15', 'BEE Lab (Batch A1)', 'EE-LAB', 'Prof. Meera Joshi', 'Joshi M.', 'lab', 'FEC103L'),
      BREAK,
      makeSlot('11:30 – 12:30', 'Engineering Mechanics', 'CR-101', 'Dr. Sanjay Pawar', 'Pawar S.', 'lecture', 'FEC104'),
      makeSlot('12:30 – 13:15', 'Professional Communication Tutorial', 'CR-101', 'Prof. Nita Ghosh', 'Ghosh N.', 'tutorial', 'FEC105T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Physics', 'CR-101', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:15 – 09:15', 'Professional Communication', 'CR-101', 'Prof. Nita Ghosh', 'Ghosh N.', 'lecture', 'FEC105'),
      makeSlot('09:15 – 11:15', 'Engineering Mechanics Lab (Batch A1)', 'MECH-LAB', 'Dr. Sanjay Pawar', 'Pawar S.', 'lab', 'FEC104L'),
      BREAK,
      makeSlot('11:30 – 12:30', 'Basic Electrical Engineering', 'CR-101', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'CR-101', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
    ],
  },
];

// Helper to generate division B (shifted rooms / teachers slightly)
function shiftDivision(schedule: DaySchedule[], roomPrefix: string): DaySchedule[] {
  return schedule.map((day) => ({
    ...day,
    slots: day.slots.map((slot) =>
      slot.type === 'break'
        ? slot
        : { ...slot, room: slot.room.replace('CR-101', roomPrefix) }
    ),
  }));
}

// ─── IT (Information Technology) ──────────────────────────────────────────────

const IT_A_B1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'IT-201', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Engineering Physics', 'IT-201', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Computer Workshop Lab (B1)', 'CS-LAB-2', 'Prof. Rohit Kumar', 'Kumar R.', 'lab', 'FEC106L'),
      makeSlot('12:30 – 13:15', 'Engineering Mathematics-I Tutorial', 'IT-201', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'tutorial', 'FEC101T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Basic Electrical Engineering', 'IT-201', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mechanics', 'IT-201', 'Dr. Sanjay Pawar', 'Pawar S.', 'lecture', 'FEC104'),
      makeSlot('09:15 – 10:15', 'Professional Communication', 'IT-201', 'Prof. Nita Ghosh', 'Ghosh N.', 'lecture', 'FEC105'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Physics Lab (B1)', 'PHY-LAB', 'Prof. Anil Shinde', 'Shinde A.', 'lab', 'FEC102L'),
      makeSlot('12:30 – 13:15', 'Engineering Mechanics Tutorial', 'IT-201', 'Dr. Sanjay Pawar', 'Pawar S.', 'tutorial', 'FEC104T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'IT-201', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:15 – 09:15', 'Basic Electrical Engineering', 'IT-201', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
      makeSlot('09:15 – 10:15', 'Engineering Physics', 'IT-201', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
      BREAK,
      makeSlot('10:30 – 12:30', 'BEE Lab (B1)', 'EE-LAB', 'Prof. Meera Joshi', 'Joshi M.', 'lab', 'FEC103L'),
      makeSlot('12:30 – 13:15', 'Professional Communication Tutorial', 'IT-201', 'Prof. Nita Ghosh', 'Ghosh N.', 'tutorial', 'FEC105T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mechanics', 'IT-201', 'Dr. Sanjay Pawar', 'Pawar S.', 'lecture', 'FEC104'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'IT-201', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Professional Communication', 'IT-201', 'Prof. Nita Ghosh', 'Ghosh N.', 'lecture', 'FEC105'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Engineering Mechanics Lab (B1)', 'MECH-LAB', 'Dr. Sanjay Pawar', 'Pawar S.', 'lab', 'FEC104L'),
      makeSlot('12:30 – 13:15', 'Basic Electrical Engineering Tutorial', 'IT-201', 'Prof. Meera Joshi', 'Joshi M.', 'tutorial', 'FEC103T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Physics', 'IT-201', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Physics', 'IT-201', 'Prof. Anil Shinde', 'Shinde A.', 'lecture', 'FEC102'),
      makeSlot('09:15 – 10:15', 'Engineering Mechanics', 'IT-201', 'Dr. Sanjay Pawar', 'Pawar S.', 'lecture', 'FEC104'),
      BREAK,
      makeSlot('10:30 – 11:30', 'Basic Electrical Engineering', 'IT-201', 'Prof. Meera Joshi', 'Joshi M.', 'lecture', 'FEC103'),
      makeSlot('11:30 – 12:30', 'Professional Communication', 'IT-201', 'Prof. Nita Ghosh', 'Ghosh N.', 'lecture', 'FEC105'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'IT-201', 'Dr. Priya Kulkarni', 'Kulkarni P.', 'lecture', 'FEC101'),
    ],
  },
];

// B2 and B3 have rotated labs
const IT_A_B2: DaySchedule[] = IT_A_B1.map((day) => ({
  ...day,
  slots: day.slots.map((slot) => {
    if (slot.type === 'break') return slot;
    if (slot.subject.includes('(B1)')) {
      return { ...slot, subject: slot.subject.replace('(B1)', '(B2)') };
    }
    return slot;
  }),
}));

const IT_A_B3: DaySchedule[] = IT_A_B1.map((day) => ({
  ...day,
  slots: day.slots.map((slot) => {
    if (slot.type === 'break') return slot;
    if (slot.subject.includes('(B1)')) {
      return { ...slot, subject: slot.subject.replace('(B1)', '(B3)') };
    }
    return slot;
  }),
}));

// IT Div B (different room, same pattern rotated)
const IT_B_B1: DaySchedule[] = IT_A_B1.map((day) => ({
  ...day,
  slots: day.slots.map((slot) =>
    slot.type === 'break' ? slot : { ...slot, room: slot.room.replace('IT-201', 'IT-202') }
  ),
}));
const IT_B_B2 = IT_B_B1.map((day) => ({
  ...day,
  slots: day.slots.map((slot) => {
    if (slot.type === 'break') return slot;
    if (slot.subject.includes('(B1)')) return { ...slot, subject: slot.subject.replace('(B1)', '(B2)') };
    return slot;
  }),
}));
const IT_B_B3 = IT_B_B1.map((day) => ({
  ...day,
  slots: day.slots.map((slot) => {
    if (slot.type === 'break') return slot;
    if (slot.subject.includes('(B1)')) return { ...slot, subject: slot.subject.replace('(B1)', '(B3)') };
    return slot;
  }),
}));

// ─── ENTC (Electronics & Telecom) ─────────────────────────────────────────────
const IT_M_M1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const IT_M_M2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

// ─── ENTC (Electronics & Telecom) ─────────────────────────────────────────────

const ENTC_A_B1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    /*
const IT_M_M1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
  */
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CEP', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

const ENTC_A_B2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ENTC_A_B3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CEP', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'EM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'EN-301', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

const ENTC_B_B1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CEP', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

const ENTC_B_B2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'EM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BIO', 'EN-302', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ENTC_B_B3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BIO', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'EM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEE', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'EM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CEP', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'IEE', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'EM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BIO', 'EN-303', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ENTC_C_C1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ENTC_C_C2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

const ENTC_C_C3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

// ─── ME (Mechanical Engineering) ──────────────────────────────────────────────
const ME_A_B1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'ME-401', 'Dr. Rajesh Kadam', 'Kadam R.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Engineering Chemistry', 'ME-401', 'Prof. Ashwini Patel', 'Patel A.', 'lecture', 'FEC107'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Engineering Mechanics Lab (B1)', 'MECH-LAB-2', 'Dr. Vijay Deshpande', 'Deshpande V.', 'lab', 'FEC104L'),
      makeSlot('12:30 – 13:15', 'Engineering Mathematics-I Tutorial', 'ME-401', 'Dr. Rajesh Kadam', 'Kadam R.', 'tutorial', 'FEC101T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Physics', 'ME-401', 'Prof. Rahul Sonawane', 'Sonawane R.', 'lecture', 'FEC102'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mechanics', 'ME-401', 'Dr. Vijay Deshpande', 'Deshpande V.', 'lecture', 'FEC104'),
      makeSlot('09:15 – 10:15', 'Basic Electrical Engineering', 'ME-401', 'Prof. Ashwini Patel', 'Patel A.', 'lecture', 'FEC103'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Physics Lab (B1)', 'PHY-LAB', 'Prof. Rahul Sonawane', 'Sonawane R.', 'lab', 'FEC102L'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'ME-401', 'Dr. Rajesh Kadam', 'Kadam R.', 'lecture', 'FEC101'),
      makeSlot('15:00 – 15:45', 'Engineering Mechanics Tutorial', 'ME-401', 'Dr. Vijay Deshpande', 'Deshpande V.', 'tutorial', 'FEC104T'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Physics', 'ME-401', 'Prof. Rahul Sonawane', 'Sonawane R.', 'lecture', 'FEC102'),
      makeSlot('09:15 – 10:15', 'Engineering Mechanics', 'ME-401', 'Dr. Vijay Deshpande', 'Deshpande V.', 'lecture', 'FEC104'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Chemistry Lab (B1)', 'CHEM-LAB', 'Prof. Ashwini Patel', 'Patel A.', 'lab', 'FEC107L'),
      makeSlot('12:30 – 13:15', 'Engineering Physics Tutorial', 'ME-401', 'Prof. Rahul Sonawane', 'Sonawane R.', 'tutorial', 'FEC102T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Chemistry', 'ME-401', 'Prof. Ashwini Patel', 'Patel A.', 'lecture', 'FEC107'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'ME-401', 'Dr. Rajesh Kadam', 'Kadam R.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Engineering Chemistry', 'ME-401', 'Prof. Ashwini Patel', 'Patel A.', 'lecture', 'FEC107'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Computer Workshop (B1)', 'CS-LAB-1', 'Prof. Rohit Kumar', 'Kumar R.', 'lab', 'FEC106L'),
      makeSlot('12:30 – 13:15', 'Basic Electrical Engineering Tutorial', 'ME-401', 'Prof. Ashwini Patel', 'Patel A.', 'tutorial', 'FEC103T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mechanics', 'ME-401', 'Dr. Vijay Deshpande', 'Deshpande V.', 'lecture', 'FEC104'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:15 – 09:15', 'Basic Electrical Engineering', 'ME-401', 'Prof. Ashwini Patel', 'Patel A.', 'lecture', 'FEC103'),
      makeSlot('09:15 – 10:15', 'Engineering Physics', 'ME-401', 'Prof. Rahul Sonawane', 'Sonawane R.', 'lecture', 'FEC102'),
      BREAK,
      makeSlot('10:30 – 12:30', 'BEE Lab (B1)', 'EE-LAB', 'Prof. Ashwini Patel', 'Patel A.', 'lab', 'FEC103L'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'ME-401', 'Dr. Rajesh Kadam', 'Kadam R.', 'lecture', 'FEC101'),
    ],
  },
];

const ME_A_B2 = ME_A_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B2)') })) }));
const ME_A_B3 = ME_A_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B3)') })) }));

const ME_B_B1 = ME_A_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, room: s.room.replace('ME-401', 'ME-402') })) }));
const ME_B_B2 = ME_B_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B2)') })) }));
const ME_B_B3 = ME_B_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B3)') })) }));
const ME_E_E1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_E_E2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_E_E3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_F_F1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_F_F2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_F_F3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_G_G1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_G_G2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const ME_G_G3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const AR_H_H1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const AR_H_H2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const AR_H_H3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'W/S', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'LANG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CSBS_I_I1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'I1-PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'I1-FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'I1-PYTH', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'I1-FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'I1-PYTH', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'I1-BCVS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CSBS_I_I2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'PYTH', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'I2-PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BCVS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PYTH', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CSBS_I_I3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PYTH', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'BCVS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PYTH', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'FOP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'I3-PEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'FCS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ISPC', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

// ─── CIVIL (Civil Engineering) ─────────────────────────────────────────────────

const CIVIL_A_B1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'CV-101', 'Prof. Pooja Narkar', 'Narkar P.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Engineering Chemistry', 'CV-101', 'Dr. Smita Rane', 'Rane S.', 'lecture', 'FEC107'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Computer Workshop (B1)', 'CS-LAB-1', 'Prof. Sunil Bhosale', 'Bhosale S.', 'lab', 'FEC106L'),
      makeSlot('12:30 – 13:15', 'Engineering Chemistry Tutorial', 'CV-101', 'Dr. Smita Rane', 'Rane S.', 'tutorial', 'FEC107T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mechanics', 'CV-101', 'Prof. Hemant Patil', 'Patil H.', 'lecture', 'FEC104'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Physics', 'CV-101', 'Prof. Reena Deshpande', 'Deshpande R.', 'lecture', 'FEC102'),
      makeSlot('09:15 – 10:15', 'Engineering Mechanics', 'CV-101', 'Prof. Hemant Patil', 'Patil H.', 'lecture', 'FEC104'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Physics Lab (B1)', 'PHY-LAB', 'Prof. Reena Deshpande', 'Deshpande R.', 'lab', 'FEC102L'),
      makeSlot('12:30 – 13:15', 'Engineering Mathematics-I Tutorial', 'CV-101', 'Prof. Pooja Narkar', 'Narkar P.', 'tutorial', 'FEC101T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'CV-101', 'Prof. Pooja Narkar', 'Narkar P.', 'lecture', 'FEC101'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mechanics', 'CV-101', 'Prof. Hemant Patil', 'Patil H.', 'lecture', 'FEC104'),
      makeSlot('09:15 – 10:15', 'Engineering Mathematics-I', 'CV-101', 'Prof. Pooja Narkar', 'Narkar P.', 'lecture', 'FEC101'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Engineering Mechanics Lab (B1)', 'MECH-LAB', 'Prof. Hemant Patil', 'Patil H.', 'lab', 'FEC104L'),
      makeSlot('12:30 – 13:15', 'Engineering Mechanics Tutorial', 'CV-101', 'Prof. Hemant Patil', 'Patil H.', 'tutorial', 'FEC104T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Chemistry', 'CV-101', 'Dr. Smita Rane', 'Rane S.', 'lecture', 'FEC107'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Chemistry', 'CV-101', 'Dr. Smita Rane', 'Rane S.', 'lecture', 'FEC107'),
      makeSlot('09:15 – 10:15', 'Engineering Physics', 'CV-101', 'Prof. Reena Deshpande', 'Deshpande R.', 'lecture', 'FEC102'),
      BREAK,
      makeSlot('10:30 – 12:30', 'Chemistry Lab (B1)', 'CHEM-LAB', 'Dr. Smita Rane', 'Rane S.', 'lab', 'FEC107L'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mathematics-I', 'CV-101', 'Prof. Pooja Narkar', 'Narkar P.', 'lecture', 'FEC101'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:15 – 09:15', 'Engineering Mathematics-I', 'CV-101', 'Prof. Pooja Narkar', 'Narkar P.', 'lecture', 'FEC101'),
      makeSlot('09:15 – 10:15', 'Engineering Chemistry', 'CV-101', 'Dr. Smita Rane', 'Rane S.', 'lecture', 'FEC107'),
      BREAK,
      makeSlot('10:30 – 12:30', 'BEE Lab (B1)', 'EE-LAB', 'Prof. Sunil Bhosale', 'Bhosale S.', 'lab', 'FEC103L'),
      makeSlot('12:30 – 13:15', 'Engineering Physics Tutorial', 'CV-101', 'Prof. Reena Deshpande', 'Deshpande R.', 'tutorial', 'FEC102T'),
      LUNCH,
      makeSlot('14:00 – 15:00', 'Engineering Mechanics', 'CV-101', 'Prof. Hemant Patil', 'Patil H.', 'lecture', 'FEC104'),
    ],
  },
];

const CIVIL_A_B2 = CIVIL_A_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B2)') })) }));
const CIVIL_A_B3 = CIVIL_A_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B3)') })) }));
const CIVIL_B_B1 = CIVIL_A_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, room: s.room.replace('CV-101', 'CV-102') })) }));
const CIVIL_B_B2 = CIVIL_B_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B2)') })) }));
const CIVIL_B_B3 = CIVIL_B_B1.map((d) => ({ ...d, slots: d.slots.map((s) => s.type === 'break' ? s : ({ ...s, subject: s.subject.replace('(B1)', '(B3)') })) }));
const CIVIL_D_D1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CIVIL_D_D2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CIVIL_D_D3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ED', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'EM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

// ─── AIDS (Artificial Intelligence & Data Science) ──────────────────────────
const AIDS_A_B1: DaySchedule[] = IT_A_B1.map((day) => ({
  ...day,
  slots: day.slots.map((slot) =>
    slot.type === 'break' ? slot : { ...slot, room: slot.room.replace('IT-201', 'AI-501') }
  ),
}));
const AIDS_A_B2 = AIDS_A_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B2)') })) }));
const AIDS_A_B3 = AIDS_A_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B3)') })) }));
const AIDS_B_B1 = AIDS_A_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, room: slot.room.replace('AI-501', 'AI-502') })) }));
const AIDS_B_B2 = AIDS_B_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B2)') })) }));
const AIDS_B_B3 = AIDS_B_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B3)') })) }));

const CE_A_B1: DaySchedule[] = CE_A_COMMON.map((day) => ({
  ...day,
  slots: day.slots.map((slot) =>
    slot.type === 'break' ? slot : { ...slot, room: slot.room.replace('CR-101', 'CE-101') }
  ),
}));
const CE_A_B2 = CE_A_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B2)') })) }));
const CE_A_B3 = CE_A_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B3)') })) }));
const CE_B_B1 = CE_A_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, room: slot.room.replace('CE-101', 'CE-102') })) }));
const CE_B_B2 = CE_B_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B2)') })) }));
const CE_B_B3 = CE_B_B1.map((day) => ({ ...day, slots: day.slots.map((slot) => slot.type === 'break' ? slot : ({ ...slot, subject: slot.subject.replace('(B1)', '(B3)') })) }));

const IT_M_M3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

const CE_J_J1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY/DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_J_J2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY/DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_J_J3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY/DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 09:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ENG', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_K_K1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM/PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_K_K2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM/PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_K_K3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM/PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'GER', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_L_L1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL/PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_L_L2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL/PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const CE_L_L3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'JAP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 09:30', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'DM/BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'CAL/PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'GFM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'DM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'PHY', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

// ─── Full Branch Data Export ───────────────────────────────────────────────────
const IT_N_N1: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];
const IT_N_N2: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

const IT_N_N3: DaySchedule[] = [
  {
    day: 'Monday', dayShort: 'Mon', dayNum: 1,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 15:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Tuesday', dayShort: 'Tue', dayNum: 2,
    slots: [
      makeSlot('08:30 – 10:30', 'IEEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL/IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Wednesday', dayShort: 'Wed', dayNum: 3,
    slots: [
      makeSlot('08:30 – 10:30', 'CEP', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'IKS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Thursday', dayShort: 'Thu', dayNum: 4,
    slots: [
      makeSlot('08:30 – 09:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 12:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Friday', dayShort: 'Fri', dayNum: 5,
    slots: [
      makeSlot('08:30 – 10:30', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('12:45 – 13:30', 'Long Recess', '-', '-', '-', 'break'),
      makeSlot('13:30 – 14:30', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('14:30 – 15:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('15:30 – 16:30', 'BIO', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
  {
    day: 'Saturday', dayShort: 'Sat', dayNum: 6,
    slots: [
      makeSlot('08:30 – 09:30', 'CAL', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('09:30 – 10:30', 'CHEM', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('10:30 – 10:45', 'Short Recess', '-', '-', '-', 'break'),
      makeSlot('10:45 – 11:45', 'ICPDS', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
      makeSlot('11:45 – 12:45', 'IEE', 'TBA', 'Department Faculty', 'Faculty', 'lecture'),
    ],
  },
];

export const TIMETABLE_BRANCHES: BranchData[] = [
  {
    branchId: 'CE',
    branchLabel: 'Computer Engineering',
    branchCode: 'CE',
    emoji: '💻',
    color: '#7C3AED',
    divisions: [
      {
        divisionId: 'A', divisionLabel: 'Division A',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CE_A_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CE_A_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CE_A_B3 },
        ],
      },
      {
        divisionId: 'B', divisionLabel: 'Division B',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CE_B_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CE_B_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CE_B_B3 },
        ],
      },
      {
        divisionId: 'J', divisionLabel: 'Section J',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CE_J_J1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CE_J_J2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CE_J_J3 },
        ],
      },
      {
        divisionId: 'K', divisionLabel: 'Section K',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CE_K_K1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CE_K_K2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CE_K_K3 },
        ],
      },
      {
        divisionId: 'L', divisionLabel: 'Section L',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CE_L_L1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CE_L_L2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CE_L_L3 },
        ],
      },
    ],
  },
  {
    branchId: 'IT',
    branchLabel: 'Information Technology',
    branchCode: 'IT',
    emoji: '🖥️',
    color: '#0EA5E9',
    divisions: [
      {
        divisionId: 'A', divisionLabel: 'Division A',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: IT_A_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: IT_A_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: IT_A_B3 },
        ],
      },
      {
        divisionId: 'B', divisionLabel: 'Division B',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: IT_B_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: IT_B_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: IT_B_B3 },
        ],
      },
      {
        divisionId: 'M', divisionLabel: 'Section M',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: IT_M_M1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: IT_M_M2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: IT_M_M3 },
        ],
      },
      {
        divisionId: 'N', divisionLabel: 'Section N',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: IT_N_N1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: IT_N_N2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: IT_N_N3 },
        ],
      },
    ],
  },
  {
    branchId: 'ENTC',
    branchLabel: 'Electronics & Telecom',
    branchCode: 'ENTC',
    emoji: '📡',
    color: '#F59E0B',
    divisions: [
      {
        divisionId: 'A', divisionLabel: 'Division A',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ENTC_A_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ENTC_A_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ENTC_A_B3 },
        ],
      },
      {
        divisionId: 'B', divisionLabel: 'Division B',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ENTC_B_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ENTC_B_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ENTC_B_B3 },
        ],
      },
      {
        divisionId: 'C', divisionLabel: 'Division C',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ENTC_C_C1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ENTC_C_C2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ENTC_C_C3 },
        ],
      },
    ],
  },
  {
    branchId: 'ME',
    branchLabel: 'Mechanical Engineering',
    branchCode: 'ME',
    emoji: '⚙️',
    color: '#10B981',
    divisions: [
      {
        divisionId: 'A', divisionLabel: 'Division A',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ME_A_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ME_A_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ME_A_B3 },
        ],
      },
      {
        divisionId: 'B', divisionLabel: 'Division B',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ME_B_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ME_B_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ME_B_B3 },
        ],
      },
      {
        divisionId: 'E', divisionLabel: 'Section E',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ME_E_E1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ME_E_E2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ME_E_E3 },
        ],
      },
      {
        divisionId: 'F', divisionLabel: 'Section F',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ME_F_F1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ME_F_F2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ME_F_F3 },
        ],
      },
      {
        divisionId: 'G', divisionLabel: 'Section G',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: ME_G_G1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: ME_G_G2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: ME_G_G3 },
        ],
      },
    ],
  },
  {
    branchId: 'CIVIL',
    branchLabel: 'Civil Engineering',
    branchCode: 'CIVIL',
    emoji: '🏗️',
    color: '#EF4444',
    divisions: [
      {
        divisionId: 'A', divisionLabel: 'Division A',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CIVIL_A_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CIVIL_A_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CIVIL_A_B3 },
        ],
      },
      {
        divisionId: 'B', divisionLabel: 'Division B',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CIVIL_B_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CIVIL_B_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CIVIL_B_B3 },
        ],
      },
      {
        divisionId: 'D', divisionLabel: 'Section D',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CIVIL_D_D1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CIVIL_D_D2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CIVIL_D_D3 },
        ],
      },
    ],
  },
  {
    branchId: 'AR',
    branchLabel: 'A & R',
    branchCode: 'AR',
    emoji: '🧭',
    color: '#0D9488',
    divisions: [
      {
        divisionId: 'H', divisionLabel: 'Section H',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: AR_H_H1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: AR_H_H2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: AR_H_H3 },
        ],
      },
    ],
  },
  {
    branchId: 'CSBS',
    branchLabel: 'Computer Science & Business Systems',
    branchCode: 'CSBS',
    emoji: '🧠',
    color: '#3B82F6',
    divisions: [
      {
        divisionId: 'I', divisionLabel: 'Section I',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: CSBS_I_I1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: CSBS_I_I2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: CSBS_I_I3 },
        ],
      },
    ],
  },
  {
    branchId: 'AIDS',
    branchLabel: 'AI & Data Science',
    branchCode: 'AIDS',
    emoji: '🤖',
    color: '#EC4899',
    divisions: [
      {
        divisionId: 'A', divisionLabel: 'Division A',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: AIDS_A_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: AIDS_A_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: AIDS_A_B3 },
        ],
      },
      {
        divisionId: 'B', divisionLabel: 'Division B',
        batches: [
          { batchId: 'B1', batchLabel: 'Batch 1', schedule: AIDS_B_B1 },
          { batchId: 'B2', batchLabel: 'Batch 2', schedule: AIDS_B_B2 },
          { batchId: 'B3', batchLabel: 'Batch 3', schedule: AIDS_B_B3 },
        ],
      },
    ],
  },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getBranchData(branchId: string): BranchData | undefined {
  return TIMETABLE_BRANCHES.find((b) => b.branchId === branchId);
}

export function getDivisionSchedule(
  branchId: string,
  divisionId: string,
  batchId: string
): DaySchedule[] | undefined {
  const branch = getBranchData(branchId);
  if (!branch) return undefined;
  const division = branch.divisions.find((d) => d.divisionId === divisionId);
  if (!division) return undefined;
  const batch = division.batches.find((b) => b.batchId === batchId);
  return batch?.schedule;
}

export function getDaySchedule(
  branchId: string,
  divisionId: string,
  batchId: string,
  dayNum: number
): DaySchedule | undefined {
  const schedule = getDivisionSchedule(branchId, divisionId, batchId);
  return schedule?.find((d) => d.dayNum === dayNum);
}

/** Returns the current class status given current time */
export function getSlotStatus(
  slot: TimetableEntry,
  now: Date
): 'ongoing' | 'upcoming' | 'ended' {
  const parseTime = (timeStr: string): Date => {
    const [time, period] = timeStr.split(' ');
    const [h, m] = time.split(':').map(Number);
    const d = new Date(now);
    let hours = h;
    if (period === 'PM' && h !== 12) hours += 12;
    if (period === 'AM' && h === 12) hours = 0;
    d.setHours(hours, m, 0, 0);
    return d;
  };

  const start = parseTime(slot.startTime);
  const end = parseTime(slot.endTime);

  if (now >= start && now <= end) return 'ongoing';
  if (now < start) return 'upcoming';
  return 'ended';
}

/** Get today's lectures (non-break) with live status */
export function getTodayLiveSchedule(
  branchId: string,
  divisionId: string,
  batchId: string
) {
  const now = new Date();
  const dayNum = now.getDay(); // 0=Sun, 1=Mon .. 6=Sat
  const effectiveDay = dayNum === 0 || dayNum === 6 ? 1 : dayNum;

  const dayData = getDaySchedule(branchId, divisionId, batchId, effectiveDay);
  if (!dayData) return { ongoing: null, upcoming: [], ended: [] };

  const lectures = dayData.slots.filter((s) => s.type !== 'break');

  const ongoing = lectures.find((s) => getSlotStatus(s, now) === 'ongoing') || null;
  const upcoming = lectures.filter((s) => getSlotStatus(s, now) === 'upcoming');
  const ended = lectures.filter((s) => getSlotStatus(s, now) === 'ended');

  return { ongoing, upcoming, ended };
}
