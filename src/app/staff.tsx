import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { DataService } from '@/services/data-service';
import { TimetableSlot, Notice, UserProfile } from '@/types';
import {
  GlassCard,
  GlassView,
  GlassBadge,
  GlassButton,
} from '@/components/ui/glass-components';

export default function TeacherStaffScreen() {
  const router = useRouter();
  const { college, profile, logout } = useAuth();

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Student Provisioning Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentDiv, setStudentDiv] = useState(profile?.assignedDivision || 'Div A');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentPass, setStudentPass] = useState('Student@2026');
  const [studentEmail, setStudentEmail] = useState('');
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    studentId: string;
    email: string;
    password: string;
    department: string;
    division: string;
  } | null>(null);

  const loadStaffData = async () => {
    if (!college) return;
    try {
      const slots = await DataService.getTimetable(
        college.id,
        profile?.department || 'Information Technology',
        '3rd Year',
        profile?.assignedDivision || 'Div A'
      );
      // Filter slots where faculty matches this instructor
      const mySlots = slots.filter(
        (s) =>
          s.facultyName.includes('Sneha') ||
          s.facultyName === profile?.name ||
          s.facultyId === 'fac_sneha'
      );
      setTimetable(mySlots.length > 0 ? mySlots : slots);

      const nots = await DataService.getNotices(college.id);
      setNotices(nots);

      const stds = await DataService.getStudents(
        college.id,
        profile?.department || 'Information Technology'
      );
      setStudents(stds);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (profile && profile.role !== 'teacher_staff' && profile.role !== 'college_admin' && profile.role !== 'super_admin') {
      router.replace('/(student)' as any);
      return;
    }
    loadStaffData();
  }, [college, profile]);

  const handleOpenAddStudent = () => {
    setStudentName('');
    const randomNum = Math.floor(10 + Math.random() * 90);
    setStudentId(`RBT26IT${randomNum}`);
    setStudentDiv(profile?.assignedDivision || 'Div A');
    setStudentRoll(`${randomNum}`);
    setStudentPass(`Jspm@${Math.floor(1000 + Math.random() * 9000)}`);
    setStudentEmail('');
    setShowStudentModal(true);
  };

  const handleSaveStudent = async () => {
    if (!studentName.trim() || !studentId.trim() || !studentPass.trim() || !college) {
      alert('Please provide Student Name, Student ID / PRN, and Password.');
      return;
    }

    try {
      const created = await DataService.addStudent(
        {
          name: studentName.trim(),
          studentId: studentId.trim().toUpperCase(),
          department: profile?.department || 'Information Technology',
          year: '3rd Year',
          division: studentDiv,
          rollNumber: studentRoll.trim() || undefined,
          email: studentEmail.trim() || undefined,
          password: studentPass.trim(),
          collegeId: college.id,
        },
        'teacher_staff'
      );

      setShowStudentModal(false);
      setCreatedCredentials({
        name: created.name,
        studentId: created.registrationId || created.studentId || studentId.trim().toUpperCase(),
        email: created.email,
        password: studentPass.trim(),
        department: created.department || profile?.department || 'Information Technology',
        division: created.division || studentDiv,
      });
      setShowCreatedModal(true);
      await loadStaffData();
    } catch (err: any) {
      alert(err.message || 'Error provisioning student account');
    }
  };

  const handleDeleteStudent = (uid: string) => {
    const doDelete = async () => {
      try {
        await DataService.deleteStudent(uid, 'teacher_staff');
        await loadStaffData();
      } catch (err: any) {
        alert(err.message || 'Error deleting student');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this Student account?')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this Student account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  return (
    <View style={styles.safeContainer}>
      {/* HEADER */}
      <GlassView variant="default" style={styles.header}>
        <View style={styles.headerLeft}>
          <GlassView variant="default" style={styles.badge}>
            <Ionicons name="school" size={18} color={Glass.text} />
          </GlassView>
          <View>
            <Text style={styles.headerTitle}>FACULTY PORTAL</Text>
            <Text style={styles.headerSub}>
              {profile?.name || 'Prof. Sneha Deshmukh'} • {profile?.department}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <GlassButton
            variant="ghost"
            size="sm"
            leftIcon={<Ionicons name="swap-horizontal" size={15} color={Glass.purple} />}
            onPress={() => router.replace('/login')}
          >
            Switch
          </GlassButton>
          <GlassButton
            variant="danger"
            size="sm"
            leftIcon={<Ionicons name="log-out-outline" size={18} color={Glass.text} />}
            onPress={logout}
          >
            Sign Out
          </GlassButton>
        </View>
      </GlassView>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Class Teacher Announcement Box */}
        {profile?.isClassTeacher && (
          <GlassCard variant="hero" style={styles.classTeacherCard}>
            <Ionicons name="ribbon" size={24} color={Glass.purple} />
            <View style={styles.classTeacherInfo}>
              <Text style={styles.classTeacherTitle}>Class Teacher Assignment</Text>
              <Text style={styles.classTeacherSub}>
                3rd Year · Division A ({profile?.department})
              </Text>
            </View>
          </GlassCard>
        )}

        {/* STUDENT CREDENTIAL MANAGEMENT SECTION FOR CLASS TEACHER */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Division Student Provisioning</Text>
            <Text style={styles.sectionSub}>
              Issue student IDs and secure passwords for your class. Self-registration is restricted.
            </Text>
          </View>
          <GlassButton
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="person-add" size={14} color="#fff" />}
            onPress={handleOpenAddStudent}
          >
            + Issue Student ID
          </GlassButton>
        </View>

        <View style={styles.studentsList}>
          {students.map((std) => {
            const showPass = !!showPasswordMap[std.uid];
            const prn = std.registrationId || std.studentId || std.username || 'N/A';
            return (
              <GlassCard key={std.uid} variant="default" style={styles.studentCard}>
                <View style={styles.studentTopRow}>
                  <View style={styles.studentIconBox}>
                    <Ionicons name="school" size={20} color={Glass.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.studentName}>{std.name}</Text>
                      <GlassBadge variant="purple" size="sm">PRN: {prn}</GlassBadge>
                    </View>
                    <Text style={styles.studentMeta}>
                      {std.department || 'Information Technology'} · {std.division || 'Div A'}
                    </Text>
                  </View>
                </View>

                {/* Credentials */}
                <View style={styles.credBox}>
                  <View style={styles.credRow}>
                    <Text style={styles.credLabel}>Login Email:</Text>
                    <Text style={styles.credValue}>{std.email || `${prn}@jspm.edu`}</Text>
                  </View>
                  <View style={styles.credRow}>
                    <Text style={styles.credLabel}>Password:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.credValue}>
                        {showPass ? std.passwordHash || 'Student@2026' : '••••••••'}
                      </Text>
                      <Pressable
                        onPress={() =>
                          setShowPasswordMap((prev) => ({
                            ...prev,
                            [std.uid]: !prev[std.uid],
                          }))
                        }
                      >
                        <Ionicons
                          name={showPass ? 'eye-off' : 'eye'}
                          size={15}
                          color={Glass.purple}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={styles.studentActionRow}>
                  <Pressable
                    style={styles.copyBtn}
                    onPress={() => {
                      const text = `Student ID: ${prn}\nEmail: ${std.email}\nPassword: ${std.passwordHash || 'Student@2026'}`;
                      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                        alert(`Credentials copied for ${std.name}!`);
                      } else {
                        alert(text);
                      }
                    }}
                  >
                    <Ionicons name="copy-outline" size={13} color={Glass.purple} />
                    <Text style={styles.copyBtnText}>Copy Credentials</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteStudent(std.uid)}
                  >
                    <Ionicons name="trash-outline" size={13} color={Glass.danger} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </GlassCard>
            );
          })}

          {students.length === 0 && (
            <GlassCard variant="subtle" style={styles.emptyCard}>
              <Ionicons name="school-outline" size={28} color={Glass.textMuted} />
              <Text style={styles.emptyText}>No students provisioned yet for this division.</Text>
            </GlassCard>
          )}
        </View>

        {/* MY TIMETABLE */}
        <Text style={[styles.sectionTitle, { marginTop: Glass.space.xl }]}>My Teaching Timetable</Text>
        <Text style={styles.sectionSub}>Scheduled classes and practical lab sessions</Text>

        <View style={styles.slotsList}>
          {timetable.map((slot) => (
            <GlassCard key={slot.id} variant="interactive" style={styles.slotCard}>
              <View style={styles.slotTop}>
                <GlassView variant="subtle" style={styles.timeBadge}>
                  <Ionicons name="time" size={12} color={Glass.purple} />
                  <Text style={styles.timeBadgeText}>
                    {slot.startTime} – {slot.endTime}
                  </Text>
                </GlassView>
                <GlassBadge variant="purple" size="sm">{slot.dayName}</GlassBadge>
              </View>

              <Text style={styles.subjectText}>{slot.subject}</Text>

              <View style={styles.slotBottom}>
                <View style={styles.metaRow}>
                  <Ionicons name="location" size={14} color={Glass.purple} />
                  <Text style={styles.metaText}>Room {slot.room}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="people" size={14} color={Glass.purple} />
                  <Text style={styles.metaText}>
                    {slot.year} · {slot.division}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* FACULTY NOTICES */}
        <Text style={[styles.sectionTitle, { marginTop: Glass.space.xl }]}>Departmental Notices</Text>
        <View style={styles.noticesList}>
          {notices.map((n) => (
            <GlassCard key={n.id} variant="default" style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>{n.title}</Text>
              <Text style={styles.noticeMeta}>
                {n.category} • {n.timeAgo}
              </Text>
              <Text style={styles.noticeSummary}>{n.summary}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      {/* ─── ADD STUDENT MODAL (FACULTY) ────────────────────────────────────────── */}
      {showStudentModal && (
        <Modal
          visible={showStudentModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStudentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <GlassCard variant="elevated" style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconBox, { backgroundColor: Glass.purpleDim }]}>
                  <Ionicons name="school" size={22} color={Glass.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Issue Student ID & Password</Text>
                  <Text style={styles.modalSub}>{profile?.department} • Division A</Text>
                </View>
                <Pressable onPress={() => setShowStudentModal(false)}>
                  <Ionicons name="close" size={22} color={Glass.textMuted} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Student Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rohan Sharma"
                  placeholderTextColor={Glass.textDim}
                  value={studentName}
                  onChangeText={setStudentName}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Student ID / PRN *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. RBT26IT45"
                      placeholderTextColor={Glass.textDim}
                      autoCapitalize="characters"
                      value={studentId}
                      onChangeText={setStudentId}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Roll / Batch</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. A1 / 45"
                      placeholderTextColor={Glass.textDim}
                      value={studentRoll}
                      onChangeText={setStudentRoll}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Division</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginVertical: 6 }}>
                  {['Div A', 'Div B', 'Div C'].map((d) => (
                    <Pressable
                      key={d}
                      style={[
                        styles.divisionPill,
                        studentDiv === d && styles.divisionPillActive,
                      ]}
                      onPress={() => setStudentDiv(d)}
                    >
                      <Text
                        style={[
                          styles.divisionPillText,
                          studentDiv === d && styles.divisionPillTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Student Email (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={`${studentId ? studentId.toLowerCase() : 'prn'}@jspm.edu`}
                  placeholderTextColor={Glass.textDim}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={studentEmail}
                  onChangeText={setStudentEmail}
                />

                <Text style={styles.inputLabel}>Assigned Password *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter initial password"
                  placeholderTextColor={Glass.textDim}
                  value={studentPass}
                  onChangeText={setStudentPass}
                />
              </ScrollView>

              <GlassButton
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="shield-checkmark" size={16} color="#fff" />}
                onPress={handleSaveStudent}
                style={{ marginTop: 14 }}
              >
                Issue Student Credentials
              </GlassButton>
            </GlassCard>
          </View>
        </Modal>
      )}

      {/* ─── CREDENTIALS CONFIRMATION MODAL ────────────────────────────────────── */}
      {showCreatedModal && createdCredentials && (
        <Modal
          visible={showCreatedModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreatedModal(false)}
        >
          <View style={styles.modalOverlay}>
            <GlassCard variant="elevated" style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="checkmark-circle" size={26} color={Glass.teal} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Student Account Provisioned!</Text>
                  <Text style={styles.modalSub}>Ready to share with student</Text>
                </View>
                <Pressable onPress={() => setShowCreatedModal(false)}>
                  <Ionicons name="close" size={22} color={Glass.textMuted} />
                </Pressable>
              </View>

              <View style={styles.credCardBox}>
                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>Name:</Text>
                  <Text style={[styles.credValue, { fontWeight: '800' }]}>{createdCredentials.name}</Text>
                </View>
                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>Student ID / PRN:</Text>
                  <Text style={[styles.credValue, { color: Glass.purple, fontWeight: '800' }]}>
                    {createdCredentials.studentId}
                  </Text>
                </View>
                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>Login Email:</Text>
                  <Text style={styles.credValue}>{createdCredentials.email}</Text>
                </View>
                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>Password:</Text>
                  <Text style={[styles.credValue, { color: Glass.teal, fontWeight: '800' }]}>
                    {createdCredentials.password}
                  </Text>
                </View>
                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>Division:</Text>
                  <Text style={styles.credValue}>{createdCredentials.division}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <GlassButton
                  variant="primary"
                  size="md"
                  leftIcon={<Ionicons name="copy-outline" size={16} color="#fff" />}
                  onPress={() => {
                    const text = `Campus Connect Credentials:\nName: ${createdCredentials.name}\nStudent ID: ${createdCredentials.studentId}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nDivision: ${createdCredentials.division}`;
                    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(text);
                      alert('Credentials copied to clipboard!');
                    } else {
                      alert(text);
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Copy Credentials
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="md"
                  onPress={() => setShowCreatedModal(false)}
                  style={{ flex: 1 }}
                >
                  Done
                </GlassButton>
              </View>
            </GlassCard>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Glass.space.md,
    paddingTop: 50,
    paddingBottom: Glass.space.md,
    marginBottom: Glass.space.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: Glass.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Glass.space.xs,
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Glass.space.md,
    paddingBottom: Glass.space.xl,
    maxWidth: Glass.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  classTeacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.md,
    padding: Glass.space.lg,
    marginBottom: Glass.space.md,
  },
  classTeacherInfo: {
    flex: 1,
  },
  classTeacherTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  classTeacherSub: {
    fontSize: Glass.fontSize.sm,
    color: Glass.purple,
    marginTop: Glass.space.xs,
    fontWeight: Glass.fontWeight.bold,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Glass.space.lg,
    marginBottom: Glass.space.md,
    gap: 12,
  },
  sectionTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  sectionSub: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textMuted,
    marginTop: 2,
  },
  studentsList: {
    gap: Glass.space.sm,
  },
  studentCard: {
    padding: Glass.space.md,
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  studentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Glass.purpleDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: Glass.text,
  },
  studentMeta: {
    fontSize: 12,
    color: Glass.textMuted,
    marginTop: 2,
  },
  credBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credLabel: {
    fontSize: 12,
    color: Glass.textMuted,
  },
  credValue: {
    fontSize: 12,
    color: Glass.text,
    fontWeight: '600',
  },
  studentActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(196,170,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196,170,255,0.25)',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Glass.purple,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Glass.danger,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: Glass.textMuted,
  },
  slotsList: {
    gap: Glass.space.sm,
    marginTop: Glass.space.sm,
  },
  slotCard: {
    padding: Glass.space.md,
  },
  slotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.sm,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    paddingHorizontal: Glass.space.sm,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.sm,
  },
  timeBadgeText: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.purple,
  },
  subjectText: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.md,
  },
  slotBottom: {
    flexDirection: 'row',
    gap: Glass.space.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
  },
  metaText: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    fontWeight: Glass.fontWeight.medium,
  },
  noticesList: {
    gap: Glass.space.md,
    marginTop: Glass.space.sm,
  },
  noticeCard: {
    padding: Glass.space.md,
  },
  noticeTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  noticeMeta: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.xs,
  },
  noticeSummary: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textSub,
    lineHeight: Glass.lineHeight.normal * Glass.fontSize.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    padding: 22,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Glass.text,
  },
  modalSub: {
    fontSize: 12,
    color: Glass.textMuted,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    color: Glass.textMuted,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Glass.text,
    fontSize: 13,
  },
  divisionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  divisionPillActive: {
    backgroundColor: Glass.purple,
    borderColor: Glass.purple,
  },
  divisionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Glass.textMuted,
  },
  divisionPillTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  credCardBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
});