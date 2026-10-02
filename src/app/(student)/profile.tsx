import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  GlassAvatar,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassSectionHeader,
  GlassView,
} from '@/components/ui/glass-components';
import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, college, logout, switchDemoRole } = useAuth();
  const { glass, isDark, toggleTheme } = useAppTheme();

  // Modals state
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  const handleRoleSelection = async (roleKey: string, route: string) => {
    try {
      setShowRoleModal(false);
      await switchDemoRole(roleKey);
      router.replace(route as any);
    } catch (e) {
      console.error('Role switch failed:', e);
    }
  };

  return (
    <View style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* TOP PROFILE CARD */}
        <GlassCard variant="hero" style={styles.profileCard}>
          <GlassAvatar
            initials={profile?.name?.charAt(0).toUpperCase() || 'S'}
            size="xl"
            ringColor={glass.purple}
          />

          <Text style={styles.studentName}>
            {profile?.name || 'Student'}
          </Text>
          <Text style={styles.studentEmail}>
            {profile?.email || ''}
          </Text>

          <GlassBadge variant="purple" size="md">
            {profile?.role === 'student' ? 'Student' : profile?.role?.toUpperCase()}
          </GlassBadge>
        </GlassCard>

        {/* SETTINGS SECTIONS */}
        <GlassSectionHeader title="Settings" />

        <GlassCard variant="default" style={styles.settingsGroup}>
          {/* Campus */}
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={() => setShowCampusModal(true)}
          >
            <View style={[styles.settingIconBox, { backgroundColor: glass.purpleDim }]}>
              <Ionicons name="business" size={20} color={glass.purple} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Campus</Text>
              <Text style={styles.settingValue}>
                {college?.shortName || 'JSPM Tathawade'} • {college?.city || 'Pune'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
          </Pressable>

          <View style={styles.divider} />

          {/* Access / Academics */}
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={() => setShowAccessModal(true)}
          >
            <View style={[styles.settingIconBox, { backgroundColor: glass.tealDim }]}>
              <Ionicons name="school" size={20} color={glass.teal} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Access</Text>
              <Text style={styles.settingValue}>
                {profile?.department || 'Information Technology'} · {profile?.division || 'Div A'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
          </Pressable>

          <View style={styles.divider} />

          {/* Appearance / Light Mode Toggle */}
          <View style={styles.settingItem}>
            <View style={[styles.settingIconBox, { backgroundColor: glass.goldDim }]}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={glass.gold}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Appearance</Text>
              <Text style={styles.settingValue}>
                {isDark ? 'Dark mode (active)' : 'Light mode (active)'}
              </Text>
            </View>
            <Switch
              value={!isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: Glass.border, true: glass.purple }}
              thumbColor={glass.text}
            />
          </View>
        </GlassCard>

        {/* DEMO ROLE SWITCHER */}
        <GlassSectionHeader title="Demo Mode" />
        <GlassCard variant="default" style={styles.settingsGroup}>
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={() => setShowRoleModal(true)}
          >
            <View style={[styles.settingIconBox, { backgroundColor: glass.infoDim }]}>
              <Ionicons name="flask" size={20} color={glass.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Switch Demo Role</Text>
              <Text style={styles.settingValue}>
                Current: {profile?.role === 'student' ? 'Student' : profile?.role?.toUpperCase()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
          </Pressable>
        </GlassCard>

        {/* SIGN OUT BUTTON */}
        <GlassButton
          variant="danger"
          size="lg"
          leftIcon={<Ionicons name="log-out-outline" size={20} color={glass.text} />}
          onPress={handleSignOut}
          style={styles.signOutBtn}
        >
          Sign out of Campus Connect
        </GlassButton>

        {/* FOOTER */}
        <Text style={styles.footerText}>
          Campus Connect • multi-college ready
        </Text>
      </ScrollView>

      {/* ─── CAMPUS MODAL ──────────────────────────────────────────────────────── */}
      <Modal
        visible={showCampusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCampusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard variant="elevated" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconRing, { backgroundColor: glass.purpleDim }]}>
                <Ionicons name="business" size={24} color={glass.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{college?.name || "JSPM's Tathawade Campus"}</Text>
                <Text style={styles.modalSub}>{college?.tagline || 'Excellence in Engineering and Technology'}</Text>
              </View>
              <Pressable onPress={() => setShowCampusModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={glass.textMuted} />
              </Pressable>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>Tathawade, Pune, Maharashtra 411033</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Campus Code</Text>
              <Text style={styles.infoValue}>{college?.code || 'JSPM'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <GlassBadge variant="teal" size="sm">Active Campus</GlassBadge>
            </View>

            <View style={{ marginTop: 20, gap: 10 }}>
              <GlassButton
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="navigate-circle-outline" size={18} color="#fff" />}
                onPress={() => {
                  setShowCampusModal(false);
                  router.push('/(student)' as any);
                }}
              >
                Go to Campus Home
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="md"
                onPress={() => setShowCampusModal(false)}
              >
                Close
              </GlassButton>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* ─── ACCESS / ACADEMIC MODAL ───────────────────────────────────────────── */}
      <Modal
        visible={showAccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard variant="elevated" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconRing, { backgroundColor: glass.tealDim }]}>
                <Ionicons name="school" size={24} color={glass.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Academic Access</Text>
                <Text style={styles.modalSub}>Verified Student Credentials</Text>
              </View>
              <Pressable onPress={() => setShowAccessModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={glass.textMuted} />
              </Pressable>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student Name</Text>
              <Text style={styles.infoValue}>{profile?.name || 'Student'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PRN / Student ID</Text>
              <Text style={styles.infoValue}>{profile?.registrationId || profile?.studentId || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{profile?.department || 'Information Technology'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Division & Year</Text>
              <Text style={styles.infoValue}>{profile?.division || 'Div A'} • {profile?.year || '3rd Year'}</Text>
            </View>

            <View style={{ marginTop: 20, gap: 10 }}>
              <GlassButton
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="calendar-outline" size={18} color="#fff" />}
                onPress={() => {
                  setShowAccessModal(false);
                  router.push('/(student)/schedule' as any);
                }}
              >
                View Live Timetable & Schedule
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="md"
                onPress={() => setShowAccessModal(false)}
              >
                Done
              </GlassButton>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* ─── SWITCH DEMO ROLE MODAL ────────────────────────────────────────────── */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard variant="elevated" style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconRing, { backgroundColor: glass.infoDim }]}>
                <Ionicons name="swap-horizontal" size={24} color={glass.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Switch Demo Role</Text>
                <Text style={styles.modalSub}>Test Campus Connect as different users</Text>
              </View>
              <Pressable onPress={() => setShowRoleModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={glass.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {/* Student */}
              <Pressable
                style={({ pressed }) => [styles.roleOptionCard, pressed && styles.settingItemPressed]}
                onPress={() => handleRoleSelection('student', '/(student)')}
              >
                <View style={[styles.roleOptionIcon, { backgroundColor: 'rgba(196,170,255,0.15)' }]}>
                  <Ionicons name="school" size={22} color="#C4AAFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleOptionTitle}>Student (Aarav Kulkarni)</Text>
                  <Text style={styles.roleOptionSub}>IT Div A • Schedule, Canteen, 360 Spaces</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
              </Pressable>

              {/* College Admin */}
              <Pressable
                style={({ pressed }) => [styles.roleOptionCard, pressed && styles.settingItemPressed]}
                onPress={() => handleRoleSelection('college_admin', '/admin')}
              >
                <View style={[styles.roleOptionIcon, { backgroundColor: 'rgba(255,107,107,0.15)' }]}>
                  <Ionicons name="business" size={22} color="#FF6B6B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleOptionTitle}>College Admin (Sunita Yadav)</Text>
                  <Text style={styles.roleOptionSub}>Campus Operations & Student ID Management</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
              </Pressable>

              {/* Faculty Admin */}
              <Pressable
                style={({ pressed }) => [styles.roleOptionCard, pressed && styles.settingItemPressed]}
                onPress={() => handleRoleSelection('faculty', '/staff')}
              >
                <View style={[styles.roleOptionIcon, { backgroundColor: 'rgba(78,205,196,0.15)' }]}>
                  <Ionicons name="people" size={22} color="#4ECDC4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleOptionTitle}>Faculty (Prof. Sneha Deshmukh)</Text>
                  <Text style={styles.roleOptionSub}>Class Teacher • Issue Student IDs, Schedule</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
              </Pressable>

              {/* Food Court Owner */}
              <Pressable
                style={({ pressed }) => [styles.roleOptionCard, pressed && styles.settingItemPressed]}
                onPress={() => handleRoleSelection('canteen', '/canteen-dashboard')}
              >
                <View style={[styles.roleOptionIcon, { backgroundColor: 'rgba(255,209,102,0.15)' }]}>
                  <Ionicons name="fast-food" size={22} color="#FFD166" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleOptionTitle}>Canteen Owner (Suresh Patil)</Text>
                  <Text style={styles.roleOptionSub}>Kitchen Orders, Live OTP, Menu Management</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
              </Pressable>

              {/* Super Admin */}
              <Pressable
                style={({ pressed }) => [styles.roleOptionCard, pressed && styles.settingItemPressed]}
                onPress={() => handleRoleSelection('super_admin', '/admin')}
              >
                <View style={[styles.roleOptionIcon, { backgroundColor: 'rgba(255,75,166,0.15)' }]}>
                  <Ionicons name="shield-checkmark" size={22} color="#FF4BA6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleOptionTitle}>Super Admin (Omkumar Ingalkar)</Text>
                  <Text style={styles.roleOptionSub}>Full Multi-College System Access</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={glass.textDim} />
              </Pressable>
            </ScrollView>

            <GlassButton
              variant="ghost"
              size="md"
              onPress={() => setShowRoleModal(false)}
              style={{ marginTop: 8 }}
            >
              Cancel
            </GlassButton>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Glass.space.md,
    paddingTop: 54,
    paddingBottom: Glass.space.xl,
    maxWidth: Glass.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Glass.space.xl,
    paddingHorizontal: Glass.space.xl,
    marginBottom: Glass.space.xl,
  },
  studentName: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginTop: Glass.space.md,
    marginBottom: Glass.space.xs,
  },
  studentEmail: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    marginBottom: Glass.space.lg,
  },
  settingsGroup: {
    marginBottom: Glass.space.xl,
    paddingHorizontal: Glass.space.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Glass.space.md,
    gap: Glass.space.md,
    borderRadius: Glass.radius.md,
  },
  settingItemPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  settingIconBox: {
    width: 44,
    height: 44,
    borderRadius: Glass.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  settingValue: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
    fontWeight: Glass.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 2,
  },
  signOutBtn: {
    marginBottom: Glass.space.lg,
  },
  footerText: {
    textAlign: 'center',
    color: Glass.textDim,
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    padding: 24,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  modalIconRing: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  modalSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  // Role switcher options
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  roleOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  roleOptionSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
});