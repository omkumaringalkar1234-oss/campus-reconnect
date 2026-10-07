// ─── Verified RSCOE Campus & Emergency Contacts Directory ──────────────────────
// Source: https://jspmrscoe.edu.in & rscoetimetable reference
// Matches: https://github.com/samarthdahiwal438-source/rscoetimetable

import { Linking, Alert } from 'react-native';

export type ContactActionType = 'call' | 'email' | 'whatsapp' | 'map';

export interface CampusContactItem {
  id: string;
  name: string;
  designationOrNote: string;
  value: string;
  actionType: ContactActionType;
  actionUrl: string;
}

export interface CampusContactCategory {
  category: string;
  iconName: string;
  items: CampusContactItem[];
}

export const CAMPUS_CONTACTS: CampusContactCategory[] = [
  {
    category: 'Emergency & Helplines',
    iconName: 'warning-outline',
    items: [
      {
        id: 'c_em_112',
        name: 'National Emergency Helpline',
        designationOrNote: 'Police, Fire, Ambulance (All-in-one)',
        value: '112',
        actionType: 'call',
        actionUrl: 'tel:112',
      },
      {
        id: 'c_em_women',
        name: 'Women Helpline',
        designationOrNote: '24x7 Safety & Assistance',
        value: '1091',
        actionType: 'call',
        actionUrl: 'tel:1091',
      },
      {
        id: 'c_em_cyber',
        name: 'National Cyber Crime Helpline',
        designationOrNote: 'Financial & online fraud reporting',
        value: '1930',
        actionType: 'call',
        actionUrl: 'tel:1930',
      },
      {
        id: 'c_em_antiragging',
        name: 'National Anti-Ragging Helpline',
        designationOrNote: 'Toll-free 24x7 helpline',
        value: '1800-180-5522',
        actionType: 'call',
        actionUrl: 'tel:18001805522',
      },
      {
        id: 'c_em_ambulance',
        name: 'Medical Ambulance',
        designationOrNote: 'Emergency health response',
        value: '108',
        actionType: 'call',
        actionUrl: 'tel:108',
      },
    ],
  },
  {
    category: 'College Administration & Office',
    iconName: 'business-outline',
    items: [
      {
        id: 'c_adm_principal',
        name: 'Director / Principal Office',
        designationOrNote: 'RSCOE Tathawade main administration',
        value: 'principal@jspmrscoe.edu.in',
        actionType: 'email',
        actionUrl: 'mailto:principal@jspmrscoe.edu.in',
      },
      {
        id: 'c_adm_verify',
        name: 'Student Verification Desk',
        designationOrNote: 'Official document & enrollment verification',
        value: 'student.verification@jspmrscoe.edu.in',
        actionType: 'email',
        actionUrl: 'mailto:student.verification@jspmrscoe.edu.in',
      },
      {
        id: 'c_adm_whatsapp',
        name: 'RSCOE WhatsApp Enquiry',
        designationOrNote: '+91 70836 36969 · Fast chat assistance',
        value: '+91 70836 36969',
        actionType: 'whatsapp',
        actionUrl: 'https://wa.me/917083636969',
      },
      {
        id: 'c_adm_corp',
        name: 'JSPM Corporate Office (Katraj)',
        designationOrNote: 'Head Office EPABX: 020-24317380',
        value: '020-24317380',
        actionType: 'call',
        actionUrl: 'tel:02024317380',
      },
      {
        id: 'c_adm_address',
        name: 'Campus Address',
        designationOrNote: 'Ashok Nagar, Tathawade, Pune 411033',
        value: 'Tathawade, Pune',
        actionType: 'map',
        actionUrl: 'https://www.google.com/maps/search/?api=1&query=JSPM+Rajarshi+Shahu+College+of+Engineering+Tathawade',
      },
    ],
  },
  {
    category: 'First Year (FY B.Tech) & Admission Cell',
    iconName: 'school-outline',
    items: [
      {
        id: 'c_fy_ghotkar',
        name: 'Prof. M. V. Ghotkar',
        designationOrNote: 'Head, Central Admission Cell',
        value: '+91 98507 62340',
        actionType: 'call',
        actionUrl: 'tel:9850762340',
      },
      {
        id: 'c_fy_patil',
        name: 'Dr. Amol Patil',
        designationOrNote: 'First Year B.Tech Coordinator',
        value: '+91 91723 90964',
        actionType: 'call',
        actionUrl: 'tel:9172390964',
      },
      {
        id: 'c_fy_kasar',
        name: 'Dr. Satyajit Kasar',
        designationOrNote: 'First Year B.Tech Coordinator',
        value: '+91 94239 29816',
        actionType: 'call',
        actionUrl: 'tel:9423929816',
      },
      {
        id: 'c_fy_gawade',
        name: 'Prof. Sadhana Gawade',
        designationOrNote: 'First Year B.Tech Academic Cell',
        value: '+91 99758 61025',
        actionType: 'call',
        actionUrl: 'tel:9975861025',
      },
      {
        id: 'c_fy_yadav',
        name: 'Dr. Sunita Yadav',
        designationOrNote: 'First Year Engineering Faculty In-charge',
        value: '+91 99707 24004',
        actionType: 'call',
        actionUrl: 'tel:9970724004',
      },
    ],
  },
  {
    category: 'Training & Placements (SPIR / T&P)',
    iconName: 'briefcase-outline',
    items: [
      {
        id: 'c_tpo_tayde',
        name: 'Dr. Saurabh Tayde',
        designationOrNote: 'Dean SPIR (Training & Placement)',
        value: '+91 95520 46715',
        actionType: 'call',
        actionUrl: 'tel:9552046715',
      },
      {
        id: 'c_tpo_patil',
        name: 'Dhanashri Patil',
        designationOrNote: 'Training & Placement Officer (TPO)',
        value: '+91 77578 16255',
        actionType: 'call',
        actionUrl: 'tel:7757816255',
      },
      {
        id: 'c_tpo_comp',
        name: 'Prof. Yashodhan Mane',
        designationOrNote: 'Computer Engineering Placement Coordinator',
        value: '+91 86002 34030',
        actionType: 'call',
        actionUrl: 'tel:8600234030',
      },
      {
        id: 'c_tpo_it',
        name: 'IT Placement Cell',
        designationOrNote: 'Information Technology Coordinator',
        value: '+91 95520 19544',
        actionType: 'call',
        actionUrl: 'tel:9552019544',
      },
      {
        id: 'c_tpo_entc',
        name: 'E&TC Placement Cell',
        designationOrNote: 'Electronics & Telecom Coordinator',
        value: '+91 77091 83497',
        actionType: 'call',
        actionUrl: 'tel:7709183497',
      },
      {
        id: 'c_tpo_mech',
        name: 'Mechanical Placement Cell',
        designationOrNote: 'Mechanical Engineering Coordinator',
        value: '+91 83299 76614',
        actionType: 'call',
        actionUrl: 'tel:8329976614',
      },
    ],
  },
  {
    category: 'Department Heads (HODs)',
    iconName: 'people-outline',
    items: [
      {
        id: 'c_hod_comp',
        name: 'Dr. Seema V. Kedar',
        designationOrNote: 'HOD, Computer Engineering',
        value: 'hod_comp@jspmrscoe.edu.in',
        actionType: 'email',
        actionUrl: 'mailto:hod_comp@jspmrscoe.edu.in',
      },
      {
        id: 'c_hod_web',
        name: 'Prof. Pallavi Tekade',
        designationOrNote: 'Website & Digital Campus Coordinator',
        value: 'webcoordinator@jspmrscoe.edu.in',
        actionType: 'email',
        actionUrl: 'mailto:webcoordinator@jspmrscoe.edu.in',
      },
    ],
  },
];

export async function handleContactAction(contact: CampusContactItem) {
  try {
    const supported = await Linking.canOpenURL(contact.actionUrl);
    if (supported) {
      await Linking.openURL(contact.actionUrl);
    } else {
      Alert.alert('Cannot open link', `Unable to launch action for ${contact.value}`);
    }
  } catch {
    Alert.alert('Error', `Could not connect to ${contact.value}`);
  }
}
