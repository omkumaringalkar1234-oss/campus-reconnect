import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { DEMO_PROFILES, SEED_COLLEGES } from '@/services/seed-data';
import {
  GlassCard,
  GlassView,
  GlassBadge,
  GlassAvatar,
  GlassButton,
  GlassSectionHeader,
} from '@/components/ui/glass-components';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, college, logout } = useAuth();
  const { glass, isDark, toggleTheme } = useAppTheme();

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
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
            initials={profile?.name?.charAt(0).toUpperCase() || 'A'}
            size="xl"
            ringColor={glass.purple}
          />

          <Text style={styles.studentName}>
            {profile?.name || 'Aarav Kulkarni'}
          </Text>
          <Text style={styles.studentEmail}>
            {profile?.email || 'student@jspm.edu'}
          </Text>

          <GlassBadge variant="purple" size="md">
            {profile?.role === 'student' ? 'Student' : profile?.role?.toUpperCase()}
          </GlassBadge>
        </GlassCard>

        {/* SETTINGS SECTIONS */}
        <GlassSectionHeader title="Settings" />

        <GlassCard variant="default" style={styles.settingsGroup}>
          {/* Campus */}
          <Pressable style={styles.settingItem}>
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

          <GlassView variant="subtle" style={styles.divider} />

          {/* Access / Academics */}
          <Pressable style={styles.settingItem}>
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

          <GlassView variant="subtle" style={styles.divider} />

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
          <Pressable style={styles.settingItem} onPress={() => {}}>
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
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Glass.space.md,
    gap: Glass.space.md,
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
    backgroundColor: Glass.borderSubtle,
    marginVertical: Glass.space.xs,
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
});