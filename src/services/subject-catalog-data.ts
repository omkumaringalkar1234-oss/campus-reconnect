// ─── RSCOE FY B.Tech Course Catalog & Syllabus Database ───────────────────────
// Source: JSPM RSCOE Department of Engineering Sciences and Humanities
// A.Y. 2026-2027 Pattern 2025
// Matches: https://github.com/samarthdahiwal438-source/rscoetimetable

export type SubjectDeliveryType = 'Theory' | 'Practical' | 'Tutorial';

export interface SubjectCatalogItem {
  code: string;
  name: string;
  shortAbbr?: string;
  type: SubjectDeliveryType;
  credits: number;
  maxMarks: number;
  branches: string[];
  description?: string;
}

export const RSCOE_FY_COURSES: SubjectCatalogItem[] = [
  {
    code: 'ES1301T',
    name: 'Calculus',
    shortAbbr: 'CAL',
    type: 'Theory',
    credits: 4,
    maxMarks: 100,
    branches: ['ENTC', 'Electrical', 'Civil', 'Mechanical', 'Automation & Robotics', 'IT', 'Computer'],
    description: 'Differential calculus, multivariable calculus, vector differential operators, double & triple integrals.',
  },
  {
    code: 'ES1309T',
    name: 'Chemistry for Engineers',
    shortAbbr: 'CHEM',
    type: 'Theory',
    credits: 3,
    maxMarks: 100,
    branches: ['ENTC', 'Electrical', 'Civil', 'Automation & Robotics', 'IT', 'Computer'],
    description: 'Structure and bonding, thermodynamics, electrochemistry, water technology, polymers, and advanced engineering materials.',
  },
  {
    code: 'ES1309L',
    name: 'Chemistry for Engineers Laboratory',
    shortAbbr: 'CHEM LAB',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['ENTC', 'Electrical', 'Civil', 'Automation & Robotics', 'IT', 'Computer'],
    description: 'Volumetric estimation, pH metry, conductivity measurements, spectrophotometry, and water hardness determination.',
  },
  {
    code: 'CE1301T',
    name: 'Engineering Mechanics',
    shortAbbr: 'EM',
    type: 'Theory',
    credits: 3,
    maxMarks: 100,
    branches: ['ENTC', 'Electrical', 'Civil', 'Mechanical', 'Computer'],
    description: 'Statics of particles and rigid bodies, equilibrium, friction, centroids, moments of inertia, kinematics and kinetics.',
  },
  {
    code: 'CE1301L',
    name: 'Engineering Mechanics Laboratory',
    shortAbbr: 'EM LAB',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['ENTC', 'Electrical', 'Civil', 'Mechanical', 'Computer'],
    description: 'Experimental verification of laws of mechanics, polygon law of forces, coefficient of friction, moment of inertia apparatus.',
  },
  {
    code: 'EE1301T',
    name: 'Introduction to Electrical Engineering',
    shortAbbr: 'IEE',
    type: 'Theory',
    credits: 3,
    maxMarks: 100,
    branches: ['ENTC', 'Electrical', 'Civil', 'IT', 'Computer'],
    description: 'DC circuits, network theorems, single phase AC circuits, three phase circuits, magnetic circuits and single phase transformers.',
  },
  {
    code: 'EE1301L',
    name: 'Introduction to Electrical Engineering Laboratory',
    shortAbbr: 'IEE LAB',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['ENTC', 'Electrical', 'Civil', 'IT', 'Computer'],
    description: 'KVL/KCL validation, Thevenin theorem, R-L-C series resonance verification, load test on transformer.',
  },
  {
    code: 'ME1302L',
    name: 'Engineering Drawing Laboratory',
    shortAbbr: 'ED LAB',
    type: 'Practical',
    credits: 2,
    maxMarks: 100,
    branches: ['ENTC', 'Electrical', 'Civil', 'Mechanical', 'Computer'],
    description: 'Orthographic projections, isometric views, section of solids, development of surfaces using CAD software.',
  },
  {
    code: 'ES1310T',
    name: 'Biology for Engineers',
    shortAbbr: 'BIO',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['ENTC', 'Electrical', 'Civil', 'IT', 'Computer'],
    description: 'Biomolecules, cellular mechanics, bioinformatics basics, bio-inspired engineering designs.',
  },
  {
    code: 'ES1311L',
    name: 'Community Engagement Project',
    shortAbbr: 'CEP',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['ENTC', 'Electrical', 'Civil', 'IT', 'Computer'],
    description: 'Community service field work, societal impact assessment, sustainability practices.',
  },
  {
    code: 'ES1312L',
    name: 'Introduction to Engineering and Engineering Products',
    shortAbbr: 'IEEP',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['ENTC', 'Electrical', 'Civil', 'IT', 'Computer'],
    description: 'Hands-on product teardown, reverse engineering basics, sensor exploration.',
  },
  {
    code: 'ES1307T',
    name: 'Physics for Engineers',
    shortAbbr: 'PHY',
    type: 'Theory',
    credits: 3,
    maxMarks: 100,
    branches: ['Mechanical', 'Automation & Robotics'],
    description: 'Optics, interference, diffraction, lasers, fiber optics, quantum physics and semiconductor fundamentals.',
  },
  {
    code: 'ES1307L',
    name: 'Physics for Engineers Laboratory',
    shortAbbr: 'PHY LAB',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['Mechanical', 'Automation & Robotics'],
    description: 'Newton rings, diffraction grating, laser beam divergence, semiconductor band gap experiments.',
  },
  {
    code: 'CS1301T',
    name: 'Introduction to Computer Programming & Data Structures',
    shortAbbr: 'ICPDS',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['Mechanical', 'Automation & Robotics', 'IT', 'Computer'],
    description: 'C programming, control flow, functions, pointers, arrays, basic data structures (stacks, queues, linked lists).',
  },
  {
    code: 'CS1301L',
    name: 'Introduction to Computer Programming Laboratory',
    shortAbbr: 'ICPDS LAB',
    type: 'Practical',
    credits: 2,
    maxMarks: 50,
    branches: ['Mechanical', 'Automation & Robotics', 'IT', 'Computer'],
    description: 'Practical programming implementations in C/C++, algorithmic problem-solving.',
  },
  {
    code: 'EC1301T',
    name: 'Basic Electronics Engineering',
    shortAbbr: 'BEE',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['Mechanical', 'Automation & Robotics', 'Computer'],
    description: 'Semiconductor diodes, bipolar junction transistors, operational amplifiers, and digital logic circuits.',
  },
  {
    code: 'EC1301L',
    name: 'Basic Electronics Engineering Laboratory',
    shortAbbr: 'BEE LAB',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['Mechanical', 'Automation & Robotics', 'Computer'],
    description: 'Diode characteristic verification, BJT CE amplifier, Op-Amp inverting/non-inverting circuits.',
  },
  {
    code: 'ME1301L',
    name: 'Workshop Practice',
    shortAbbr: 'W/S',
    type: 'Practical',
    credits: 2,
    maxMarks: 100,
    branches: ['Mechanical', 'Automation & Robotics', 'Civil', 'Computer'],
    description: 'Carpentry, fitting, sheet metal, welding and safety procedures in central manufacturing workshop.',
  },
  {
    code: 'HS1307T',
    name: 'Indian Knowledge Systems',
    shortAbbr: 'IKS',
    type: 'Theory',
    credits: 2,
    maxMarks: 50,
    branches: ['Mechanical', 'Automation & Robotics', 'IT', 'CSBS', 'Computer'],
    description: 'Traditional Indian scientific discoveries, astronomy, architecture, metallurgy, and ancient engineering feats.',
  },
  {
    code: 'HS1303T',
    name: 'English Language Skills',
    shortAbbr: 'ENG',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['Mechanical', 'Automation & Robotics'],
    description: 'Grammar, technical writing, reading comprehension, vocabulary expansion.',
  },
  {
    code: 'HS1303L',
    name: 'English Language Skills Laboratory',
    shortAbbr: 'ENG LAB',
    type: 'Practical',
    credits: 1,
    maxMarks: 50,
    branches: ['Mechanical', 'Automation & Robotics'],
    description: 'Phonetics, oral presentation skills, group discussion, language lab exercises.',
  },
  {
    code: 'HS1302T',
    name: 'Professional English Communication',
    shortAbbr: 'PROF ENG',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['Computer'],
    description: 'Corporate communication, technical report writing, email etiquette, oral presentations.',
  },
  {
    code: 'HS1304T',
    name: 'German Language Skills',
    shortAbbr: 'GER',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['Computer'],
    description: 'Introductory German A1 level grammar, daily conversation and technical vocabulary.',
  },
  {
    code: 'HS1305T',
    name: 'Japanese Language Skills',
    shortAbbr: 'JAP',
    type: 'Theory',
    credits: 2,
    maxMarks: 100,
    branches: ['Computer'],
    description: 'Hiragana, Katakana, basic Kanji, greetings and basic conversational Japanese.',
  },
  {
    code: 'ES1304T',
    name: 'Discrete Mathematics',
    shortAbbr: 'DM',
    type: 'Theory',
    credits: 4,
    maxMarks: 100,
    branches: ['CSBS', 'Computer'],
    description: 'Set theory, relations and functions, propositional logic, graph theory, algebraic structures.',
  },
  {
    code: 'CB1302L',
    name: 'Python Scripting',
    shortAbbr: 'PYTH',
    type: 'Practical',
    credits: 2,
    maxMarks: 100,
    branches: ['CSBS'],
    description: 'Python syntax, data types, object-oriented concepts, NumPy, Pandas, scripting automation.',
  },
];

/** Lookup course info by code or subject name/abbreviation */
export function findCourseByQuery(query: string): SubjectCatalogItem | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;

  return (
    RSCOE_FY_COURSES.find(
      (c) =>
        c.code.toUpperCase() === q ||
        (c.shortAbbr && c.shortAbbr.toUpperCase() === q) ||
        c.name.toUpperCase().includes(q)
    ) || null
  );
}
