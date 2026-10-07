// ─── RSCOE Academic Calendar & Holidays Data (A.Y. 2026–2027) ───────────────────
// Source: JSPM's Rajarshi Shahu College of Engineering, Tathawade
// Matches: https://github.com/samarthdahiwal438-source/rscoetimetable

export type EventKind = 'term' | 'assessment' | 'exam' | 'campus' | 'holiday' | 'deadline';
export type EventCategory = 'academic' | 'exam' | 'holiday' | 'event';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // "YYYY-MM-DD"
  end?: string;   // "YYYY-MM-DD"
  kind: EventKind;
  category: EventCategory;
  description?: string;
  badgeLabel?: string;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  dayOfWeek: string;
  type: 'Public Holiday' | 'College Holiday' | 'Gazetted';
  description?: string;
}

export const ACADEMIC_EVENTS: CalendarEvent[] = [
  // Holidays
  { id: 'ev_ganesh', title: 'Ganesh Chaturthi', start: '2026-09-14', kind: 'holiday', category: 'holiday' },
  { id: 'ev_gandhi', title: 'Mahatma Gandhi Jayanti', start: '2026-10-02', kind: 'holiday', category: 'holiday' },
  { id: 'ev_dasara', title: 'Dasara', start: '2026-10-20', kind: 'holiday', category: 'holiday' },
  { id: 'ev_diwali_1', title: 'Diwali Amavasya (Laxmi Pujan)', start: '2026-11-08', kind: 'holiday', category: 'holiday' },
  { id: 'ev_diwali_2', title: 'Diwali (Bali Pratipada)', start: '2026-11-10', kind: 'holiday', category: 'holiday' },
  { id: 'ev_gurunanak', title: 'Guru Nanak Jayanti', start: '2026-11-24', kind: 'holiday', category: 'holiday' },
  { id: 'ev_xmas', title: 'Christmas', start: '2026-12-25', kind: 'holiday', category: 'holiday' },
  { id: 'ev_republic', title: 'Republic Day', start: '2027-01-26', kind: 'holiday', category: 'holiday' },
  { id: 'ev_maha_day', title: 'Maharashtra Day', start: '2027-05-01', kind: 'holiday', category: 'holiday' },

  // Semester I
  {
    id: 'ev_sem1_start',
    title: 'Semester I Commencement & Induction',
    start: '2026-09-08',
    kind: 'term',
    category: 'academic',
    description: 'Orientation and induction program for F.Y. B.Tech students',
  },
  {
    id: 'ev_ta_1',
    title: "Teachers' Assessment I (TA-I)",
    start: '2026-10-21',
    end: '2026-10-27',
    kind: 'assessment',
    category: 'academic',
    description: 'Continuous assessment evaluation 1 across all subjects',
  },
  {
    id: 'ev_mid_sem',
    title: 'Mid-Semester Examinations (In-Sem)',
    start: '2026-11-02',
    end: '2026-11-13',
    kind: 'exam',
    category: 'exam',
    description: 'Compulsory written in-sem exams for FY B.Tech',
  },
  {
    id: 'ev_mid_sem_prac',
    title: 'Practical Mid-Semester Examinations',
    start: '2026-11-16',
    end: '2026-11-20',
    kind: 'exam',
    category: 'exam',
    description: 'Mid-semester lab evaluations and journals review',
  },
  {
    id: 'ev_mid_open_day',
    title: 'Mid-Semester Examination Open Day',
    start: '2026-11-16',
    end: '2026-11-20',
    kind: 'assessment',
    category: 'academic',
    description: 'Paper showing and doubt clearing with faculty',
  },
  {
    id: 'ev_ta_2',
    title: "Teachers' Assessment II (TA-II)",
    start: '2026-12-21',
    end: '2026-12-28',
    kind: 'assessment',
    category: 'academic',
    description: 'Continuous assessment evaluation 2',
  },
  {
    id: 'ev_end_prac',
    title: 'Practical & Oral End-Semester Examinations',
    start: '2026-12-28',
    end: '2027-01-01',
    kind: 'exam',
    category: 'exam',
    description: 'External lab exams, viva voce and project submissions',
  },
  {
    id: 'ev_teach_conclude',
    title: 'Classroom Teaching Concludes (Sem-I)',
    start: '2027-01-01',
    kind: 'term',
    category: 'academic',
    description: 'Last working instructional day of Semester I',
  },
  {
    id: 'ev_end_theory',
    title: 'End-Semester Theory Examinations (Sem-I)',
    start: '2027-01-09',
    end: '2027-01-20',
    kind: 'exam',
    category: 'exam',
    description: 'University end-semester written exams',
  },
  {
    id: 'ev_sem2_start',
    title: 'Semester II Teaching Commences',
    start: '2027-01-27',
    kind: 'term',
    category: 'academic',
    description: 'Opening day of Semester II classes for FY B.Tech',
  },
  {
    id: 'ev_res_dec_1',
    title: 'Result Declaration (Sem-I)',
    start: '2027-02-08',
    kind: 'term',
    category: 'academic',
  },
  {
    id: 'ev_re_exam_1',
    title: 'Re-Examinations (Sem-I)',
    start: '2027-02-22',
    kind: 'exam',
    category: 'exam',
  },

  // Campus Events & Festivals
  {
    id: 'ev_sports',
    title: 'Annual Sports Festival',
    start: '2027-02-11',
    end: '2027-02-14',
    kind: 'campus',
    category: 'event',
    description: 'Inter-department athletic games, cricket, football, basketball & chess',
  },
  {
    id: 'ev_techfest',
    title: 'TechFest Innovision 2026',
    start: '2027-02-15',
    end: '2027-02-16',
    kind: 'campus',
    category: 'event',
    description: 'National level technical symposium, hackathon & robotics contest',
  },
  {
    id: 'ev_gandharva',
    title: 'Cultural Festival "Gandharva 2026"',
    start: '2027-02-18',
    kind: 'campus',
    category: 'event',
    description: 'RSCOE flagship annual cultural celebration, music, drama & dance',
  },

  // Semester II Milestones
  {
    id: 'ev_sem2_ta1',
    title: "Teachers' Assessment I (Sem-II)",
    start: '2027-03-13',
    end: '2027-03-19',
    kind: 'assessment',
    category: 'academic',
  },
  {
    id: 'ev_sem2_mid',
    title: 'Mid-Semester Examinations (Sem-II)',
    start: '2027-03-29',
    end: '2027-04-02',
    kind: 'exam',
    category: 'exam',
  },
  {
    id: 'ev_sem2_teach_end',
    title: 'Classroom Teaching Concludes (Sem-II)',
    start: '2027-05-26',
    kind: 'term',
    category: 'academic',
  },
  {
    id: 'ev_sem2_end_theory',
    title: 'End-Semester Theory Examinations (Sem-II)',
    start: '2027-05-31',
    end: '2027-06-11',
    kind: 'exam',
    category: 'exam',
  },
  {
    id: 'ev_next_year',
    title: 'Commencement of Academic Year 2027–28',
    start: '2027-07-05',
    kind: 'term',
    category: 'academic',
  },
];

export const HOLIDAYS_LIST: HolidayItem[] = [
  { id: 'hol_1', name: 'Ganesh Chaturthi', date: '2026-09-14', dayOfWeek: 'Monday', type: 'Public Holiday' },
  { id: 'hol_2', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', dayOfWeek: 'Friday', type: 'Gazetted' },
  { id: 'hol_3', name: 'Dasara (Vijayadashami)', date: '2026-10-20', dayOfWeek: 'Tuesday', type: 'Public Holiday' },
  { id: 'hol_4', name: 'Diwali (Laxmi Pujan)', date: '2026-11-08', dayOfWeek: 'Sunday', type: 'Public Holiday' },
  { id: 'hol_5', name: 'Diwali (Bali Pratipada)', date: '2026-11-10', dayOfWeek: 'Tuesday', type: 'Public Holiday' },
  { id: 'hol_6', name: 'Guru Nanak Jayanti', date: '2026-11-24', dayOfWeek: 'Tuesday', type: 'Public Holiday' },
  { id: 'hol_7', name: 'Christmas', date: '2026-12-25', dayOfWeek: 'Friday', type: 'Public Holiday' },
  { id: 'hol_8', name: 'Republic Day', date: '2027-01-26', dayOfWeek: 'Tuesday', type: 'Gazetted' },
  { id: 'hol_9', name: 'Chhatrapati Shivaji Maharaj Jayanti', date: '2027-02-19', dayOfWeek: 'Friday', type: 'Public Holiday' },
  { id: 'hol_10', name: 'Mahashivratri', date: '2027-03-07', dayOfWeek: 'Sunday', type: 'Public Holiday' },
  { id: 'hol_11', name: 'Holi (Dhulivandan)', date: '2027-03-24', dayOfWeek: 'Wednesday', type: 'Public Holiday' },
  { id: 'hol_12', name: 'Gudhi Padwa', date: '2027-04-08', dayOfWeek: 'Thursday', type: 'Public Holiday' },
  { id: 'hol_13', name: 'Dr. Babasaheb Ambedkar Jayanti', date: '2027-04-14', dayOfWeek: 'Wednesday', type: 'Public Holiday' },
  { id: 'hol_14', name: 'Maharashtra Day', date: '2027-05-01', dayOfWeek: 'Saturday', type: 'Gazetted' },
];

export function getDaysUntil(dateIso: string): number {
  const target = new Date(dateIso + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatEventDateRange(startIso: string, endIso?: string): string {
  const s = new Date(startIso + 'T00:00:00');
  const sStr = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  if (!endIso || endIso === startIso) {
    return `${sStr}, ${s.getFullYear()}`;
  }
  const e = new Date(endIso + 'T00:00:00');
  const eStr = e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${sStr} – ${eStr}`;
}

export function getUpcomingAcademicEvents(limit = 10): CalendarEvent[] {
  const nowIso = new Date().toISOString().slice(0, 10);
  return ACADEMIC_EVENTS
    .filter((e) => (e.end || e.start) >= nowIso)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, limit);
}

export function getUpcomingHolidays(limit = 6): HolidayItem[] {
  const nowIso = new Date().toISOString().slice(0, 10);
  return HOLIDAYS_LIST
    .filter((h) => h.date >= nowIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
