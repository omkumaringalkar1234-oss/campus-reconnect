import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { DataService } from '@/services/data-service';
import { College, UserProfile } from '@/types';
import {
  GlassCard,
  GlassView,
  GlassBadge,
  GlassButton,
  GlassSectionHeader,
  GlassModal,
  GlassInput,
} from '@/components/ui/glass-components';

export default function SuperAdminScreen() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeAdmins, setCollegeAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Selection State
  const [filterCollegeId, setFilterCollegeId] = useState<string>('all');
  const [selectedCollegeForManage, setSelectedCollegeForManage] = useState<College | null>(null);

  // Add College Admin Modal
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminDesignation, setNewAdminDesignation] = useState('');
  const [newAdminCollegeId, setNewAdminCollegeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cols, admins] = await Promise.all([
        DataService.getColleges(),
        DataService.getCollegeAdmins(),
      ]);
      setColleges(cols);
      setCollegeAdmins(admins);
      if (cols.length > 0 && !newAdminCollegeId) {
        setNewAdminCollegeId(cols[0].id);
      }
      // Ensure all college admins are provisioned to cloud auth for multi-device access
      DataService.syncAllCollegeAdminsToCloud().catch(() => {});
    } catch (e) {
      console.error('Error loading super admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = (defaultCollegeId?: string) => {
    if (defaultCollegeId) {
      setNewAdminCollegeId(defaultCollegeId);
    } else if (colleges.length > 0 && !newAdminCollegeId) {
      setNewAdminCollegeId(colleges[0].id);
    }
    setShowAddAdminModal(true);
  };

  const handleCreateAdmin = async () => {
    const cleanName = newAdminName.trim();
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    const cleanPassword = newAdminPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword || !newAdminCollegeId) {
      Alert.alert('Missing Details', 'Please fill in Name, Campus Email, Password, and select a College.');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await DataService.addCollegeAdmin(
        {
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          collegeId: newAdminCollegeId,
          designation: newAdminDesignation.trim() || 'Campus Administrator & Dean',
        },
        'super_admin'
      );

      const targetCol = colleges.find((c) => c.id === newAdminCollegeId);
      Alert.alert(
        'College Admin ID Created',
        `Successfully issued College Admin credentials for ${cleanName} (${cleanEmail}) at ${targetCol?.shortName || 'the institution'}.\n\nThey can now sign in via the Staff & Admin portal.`
      );

      setShowAddAdminModal(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminDesignation('');
      await loadData();
    } catch (err: any) {
      Alert.alert('Creation Failed', err?.message || 'Could not create College Admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = (admin: UserProfile) => {
    const targetCol = colleges.find((c) => c.id === admin.collegeId);
    Alert.alert(
      'Revoke College Admin ID',
      `Are you sure you want to delete the College Admin ID for ${admin.name} (${admin.email})?\n\nThis user will immediately lose administrative access to ${targetCol?.name || 'this campus'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Admin ID',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataService.deleteCollegeAdmin(admin.uid, 'super_admin');
              await loadData();
              Alert.alert('ID Revoked', `College Admin ID for ${admin.email} has been permanently deleted.`);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete College Admin account.');
            }
          },
        },
      ]
    );
  };

  const filteredAdmins =
    filterCollegeId === 'all'
      ? collegeAdmins
      : collegeAdmins.filter((a) => a.collegeId === filterCollegeId);

  const getCollegeForAdmin = (collegeId: string) => {
    return colleges.find((c) => c.id === collegeId);
  };

  return (
    <View style={styles.safeContainer}>
      {/* SUPER ADMIN HEADER */}
      <GlassView variant="default" style={styles.header}>
        <View style={styles.headerLeft}>
          <GlassView variant="default" style={styles.badge}>
            <Ionicons name="planet" size={18} color={Glass.bg} />
          </GlassView>
          <View>
            <View style={styles.adminNameRow}>
              <Text style={styles.headerTitle}>SUPER ADMIN PLATFORM</Text>
              <GlassBadge variant="purple" size="sm">OMKUMAR G. INGALKAR</GlassBadge>
            </View>
            <Text style={styles.headerSub}>Platform Architect • @omkumar_01</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <GlassButton
            variant="ghost"
            size="sm"
            leftIcon={<Ionicons name="swap-horizontal" size={15} color={Glass.purple} />}
            onPress={() => router.replace('/login')}
          >
            Portals
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
        {/* STATS OVERVIEW */}
        <View style={styles.statsRow}>
          <GlassCard variant="default" style={styles.statBox}>
            <Text style={styles.statValue}>{colleges.length}</Text>
            <Text style={styles.statLabel}>Active Campuses</Text>
          </GlassCard>
          <GlassCard variant="default" style={styles.statBox}>
            <Text style={[styles.statValue, { color: Glass.purple }]}>{collegeAdmins.length}</Text>
            <Text style={styles.statLabel}>College Admin IDs</Text>
          </GlassCard>
          <GlassCard variant="default" style={styles.statBox}>
            <Text style={[styles.statValue, { color: Glass.teal }]}>
              {colleges.reduce((sum, c) => sum + (c.studentCount || 0), 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </GlassCard>
        </View>

        {/* CAMPUS GRID */}
        <GlassSectionHeader
          title="Campus Management"
          action={
            <GlassButton variant="primary" size="sm" leftIcon={<Ionicons name="add" size={16} color={Glass.bg} />} onPress={handleOpenAddModal}>
              Add Admin
            </GlassButton>
          }
        />

        <View style={styles.campusGrid}>
          {colleges.map((college) => (
            <GlassCard key={college.id} variant="interactive" style={styles.campusCard}>
              <View style={styles.campusCardTop}>
                <Text style={styles.campusName}>{college.name}</Text>
                <GlassBadge variant="purple" size="sm">{college.shortName}</GlassBadge>
              </View>
              <Text style={styles.campusLocation}>
                <Ionicons name="location-outline" size={12} color={Glass.purple} style={{ marginRight: 4 }} />
                {college.city}, {college.state}
              </Text>
              <Text style={styles.campusDomain}>{college.domain}</Text>

              <View style={styles.campusStats}>
                <View style={styles.campusStat}>
                  <Text style={styles.campusStatValue}>
                    {collegeAdmins.filter((a) => a.collegeId === college.id).length}
                  </Text>
                  <Text style={styles.campusStatLabel}>Admins</Text>
                </View>
                <View style={styles.campusStat}>
                  <Text style={styles.campusStatValue}>
                    {(college.studentCount || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.campusStatLabel}>Students</Text>
                </View>
              </View>

              <View style={styles.campusActions}>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onPress={handleOpenAddModal.bind(null, college.id)}
                  style={{ flex: 1 }}
                >
                  Add Admin
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setSelectedCollegeForManage(college);
                    setFilterCollegeId(college.id);
                  }}
                  style={{ flex: 1 }}
                >
                  Manage
                </GlassButton>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* COLLEGE ADMIN LIST */}
        <GlassSectionHeader
          title={`College Admin IDs ${filterCollegeId !== 'all' ? `· ${getCollegeForAdmin(filterCollegeId)?.shortName}` : ''}`}
          count={filteredAdmins.length}
        />

        {loading ? (
          <GlassCard variant="default" style={styles.loadingCard}>
            <ActivityIndicator color={Glass.purple} size="large" />
          </GlassCard>
        ) : filteredAdmins.length === 0 ? (
          <GlassCard variant="default" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No College Admins found.</Text>
            <GlassButton variant="primary" size="md" onPress={handleOpenAddModal} style={{ marginTop: Glass.space.md }}>
              Create First Admin
            </GlassButton>
          </GlassCard>
        ) : (
          <View style={styles.adminList}>
            {filteredAdmins.map((admin) => (
              <GlassCard key={admin.uid} variant="default" style={styles.adminCard}>
                <View style={styles.adminInfo}>
                  <GlassView variant="default" style={styles.adminAvatar}>
                    <Text style={styles.adminAvatarText}>{admin.name.charAt(0).toUpperCase()}</Text>
                  </GlassView>
                  <View>
                    <Text style={styles.adminName}>{admin.name}</Text>
                    <Text style={styles.adminEmail}>{admin.email}</Text>
                    <Text style={styles.adminDesignation}>{admin.designation}</Text>
                    <View style={styles.adminMetaRow}>
                      <GlassBadge variant="purple" size="xs">
                        {getCollegeForAdmin(admin.collegeId)?.shortName || admin.collegeId}
                      </GlassBadge>
                      <GlassBadge variant="teal" size="xs">
                        {admin.permissions?.length || 0} permissions
                      </GlassBadge>
                    </View>
                  </View>
                </View>
                <Pressable
                  style={styles.adminDeleteBtn}
                  onPress={() => handleDeleteAdmin(admin)}
                >
                  <Ionicons name="trash-outline" size={20} color={Glass.danger} />
                </Pressable>
              </GlassCard>
            ))}
          </View>
        )}

        {/* FOOTER */}
        <Text style={styles.footerText}>
          Campus Connect Super Admin Platform • Built by OMKUMAR G. INGALKAR
        </Text>
      </ScrollView>

      {/* ADD ADMIN MODAL */}
      <GlassModal visible={showAddAdminModal} onClose={() => setShowAddAdminModal(false)} size="md">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create College Admin ID</Text>
          <Text style={styles.modalSub}>Issue administrative credentials for a campus</Text>

          <GlassInput
            label="Full Name"
            placeholder="Prof. Sneha Deshmukh"
            value={newAdminName}
            onChangeText={setNewAdminName}
            icon="person-outline"
          />

          <GlassInput
            label="Campus Email"
            placeholder="admin@college.edu"
            value={newAdminEmail}
            onChangeText={setNewAdminEmail}
            icon="mail-outline"
            keyboardType="email-address"
          />

          <GlassInput
            label="Password"
            placeholder="••••••••"
            value={newAdminPassword}
            onChangeText={setNewAdminPassword}
            icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            secureTextEntry={!showPassword}
            rightElement={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Glass.textMuted} />
              </Pressable>
            }
          />

          <GlassInput
            label="Designation (Optional)"
            placeholder="Campus Administrator & Dean"
            value={newAdminDesignation}
            onChangeText={setNewAdminDesignation}
            icon="briefcase-outline"
          />

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Assign to College</Text>
            <View style={styles.modalSelect}>
              <TextInput
                style={styles.modalSelectText}
                value={colleges.find((c) => c.id === newAdminCollegeId)?.name || 'Select College'}
                editable={false}
              />
              <Ionicons name="chevron-down" size={18} color={Glass.textMuted} />
            </View>
          </View>

          <View style={styles.modalActions}>
            <GlassButton variant="secondary" size="md" onPress={() => setShowAddAdminModal(false)} style={{ flex: 1 }}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" size="md" onPress={handleCreateAdmin} disabled={submitting} style={{ flex: 1 }}>
              {submitting ? <ActivityIndicator color={Glass.bg} size="small" /> : 'Create Admin ID'}
            </GlassButton>
          </View>
        </View>
      </GlassModal>
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
  adminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
    flexWrap: 'wrap',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  statBox: {
    flex: 1,
    padding: Glass.space.md,
    alignItems: 'center',
    borderRadius: Glass.radius.lg,
  },
  statValue: {
    fontSize: Glass.fontSize.xxl,
    fontWeight: Glass.fontWeight.black,
    color: Glass.text,
  },
  statLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.semibold,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  campusGrid: {
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  campusCard: {
    padding: Glass.space.md,
  },
  campusCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.xs,
  },
  campusName: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  campusLocation: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  campusDomain: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textDim,
    marginBottom: Glass.space.md,
    fontFamily: 'monospace',
  },
  campusStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Glass.space.md,
    paddingVertical: Glass.space.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Glass.border,
  },
  campusStat: {
    alignItems: 'center',
  },
  campusStatValue: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.black,
    color: Glass.text,
  },
  campusStatLabel: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textMuted,
    fontWeight: Glass.fontWeight.semibold,
    marginTop: Glass.space.xs,
  },
  campusActions: {
    flexDirection: 'row',
    gap: Glass.space.sm,
  },
  adminList: {
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  adminCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Glass.space.md,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.md,
    flex: 1,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: Glass.radius.circle,
    backgroundColor: Glass.purpleDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.black,
    color: Glass.purple,
  },
  adminName: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  adminEmail: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
  },
  adminDesignation: {
    fontSize: Glass.fontSize.xs,
    color: Glass.purple,
    fontWeight: Glass.fontWeight.semibold,
    marginTop: Glass.space.xs,
  },
  adminMetaRow: {
    flexDirection: 'row',
    gap: Glass.space.xs,
    marginTop: Glass.space.sm,
  },
  adminDeleteBtn: {
    padding: Glass.space.xs,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: Glass.space.xl,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Glass.space.xl,
  },
  emptyText: {
    color: Glass.textMuted,
    marginBottom: Glass.space.md,
  },
  modalContent: {
    padding: Glass.space.md,
    gap: Glass.space.md,
  },
  modalTitle: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    textAlign: 'center',
    marginBottom: Glass.space.md,
  },
  modalField: {
    marginBottom: Glass.space.sm,
  },
  modalLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Glass.space.xs,
  },
  modalSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Glass.bgInput,
    borderRadius: Glass.radius.md,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.sm,
  },
  modalSelectText: {
    color: Glass.text,
    fontSize: Glass.fontSize.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Glass.space.md,
    marginTop: Glass.space.md,
  },
  footerText: {
    textAlign: 'center',
    color: Glass.textDim,
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.medium,
    marginTop: Glass.space.xl,
  },
});