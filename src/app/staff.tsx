import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { DataService } from '@/services/data-service';
import { TimetableSlot, Notice } from '@/types';
import { GlassCard, GlassView, GlassBadge, GlassButton } from '@/components/ui/glass-components';

export default function TeacherStaffScreen() {
  const router = useRouter();
  const { college, profile, logout } = useAuth();

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const loadStaffData = async () => {
      if (!college) return;
      try {
        const slots = await DataService.getTimetable(
          college.id,
          profile?.department || 'Information Technology',
          '3rd Year',
          'Div A'
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
      } catch (e) {
        console.error(e);
      }
    };
    loadStaffData();
  }, [college, profile]);

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

        {/* Delegated Field Admin Powers Banner */}
        {profile?.permissions && profile.permissions.length > 0 && (
          <GlassCard variant="hero" style={styles.delegatedPowersCard}>
            <View style={styles.delegatedTopRow}>
              <GlassView variant="default" style={styles.delegatedBadge}>
                <Ionicons name="shield-checkmark" size={18} color={Glass.bg} />
              </GlassView>
              <View style={{ flex: 1 }}>
                <Text style={styles.delegatedTitle}>Delegated Administrative Powers</Text>
                <Text style={styles.delegatedSub}>
                  You have special field-level privileges granted by College Dean:
                </Text>
              </View>
            </View>

            <View style={styles.delegatedButtonsRow}>
              {profile.permissions.includes('canteen_manager') && (
                <GlassButton
                  variant="primary"
                  size="md"
                  leftIcon={<Ionicons name="fast-food" size={14} color={Glass.bg} />}
                  onPress={() => router.push('/food-court')}
                  style={styles.delegatedActionBtn}
                >
                  Manage Canteen & Menu
                </GlassButton>
              )}

              {profile.permissions.includes('tour_360_curator') && (
                <GlassButton
                  variant="primary"
                  size="md"
                  leftIcon={<Ionicons name="scan" size={14} color={Glass.bg} />}
                  onPress={() => router.push('/admin')}
                  style={styles.delegatedActionBtn}
                >
                  Upload & Curate 360° Tours
                </GlassButton>
              )}

              {profile.permissions.includes('notices_publisher') && (
                <GlassButton
                  variant="primary"
                  size="md"
                  leftIcon={<Ionicons name="megaphone" size={14} color={Glass.bg} />}
                  onPress={() => router.push('/admin')}
                  style={styles.delegatedActionBtn}
                >
                  Publish Institutional Notice
                </GlassButton>
              )}
            </View>
          </GlassCard>
        )}

        {/* MY TIMETABLE */}
        <Text style={styles.sectionTitle}>My Teaching Timetable</Text>
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
    gap: Glass.space.md,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: Glass.radius.md,
    backgroundColor: Glass.purpleBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: Glass.fontSize.md,
    color: Glass.textSub,
    marginTop: 1,
    fontWeight: Glass.fontWeight.medium,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
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
    padding: Glass.space.md,
    marginBottom: Glass.space.lg,
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
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
  },
  delegatedPowersCard: {
    padding: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  delegatedTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Glass.space.md,
    marginBottom: Glass.space.md,
  },
  delegatedBadge: {
    width: 40,
    height: 40,
    borderRadius: Glass.radius.md,
    backgroundColor: Glass.purpleBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delegatedTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  delegatedSub: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
  },
  delegatedButtonsRow: {
    gap: Glass.space.sm,
  },
  delegatedActionBtn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  sectionSub: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.md,
  },
  slotsList: {
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
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
});