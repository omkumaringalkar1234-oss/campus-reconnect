import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { DataService } from '@/services/data-service';
import { SEED_360_LOCATIONS, SEED_ROOMS, SEED_FACULTY } from '@/services/seed-data';
import { Room, Faculty, Campus360Location } from '@/types';
import { Spatial360Viewer } from '@/components/spatial-360-viewer';
import { CampusContactsModal } from '@/components/campus-contacts-modal';
import { LostFoundModal } from '@/components/lost-found-modal';
import {
  GlassCard,
  GlassView,
  GlassBadge,
  GlassPill,
  GlassButton,
  GlassSearchBar,
  GlassSectionHeader,
  GlassDivider,
  GlassModal,
} from '@/components/ui/glass-components';

export default function CampusScreen() {
  const { college } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [faculty, setFaculty] = useState<Faculty[]>(SEED_FACULTY);
  const [locations360, setLocations360] = useState<Campus360Location[]>(SEED_360_LOCATIONS);
  const [selected360Spot, setSelected360Spot] = useState<Campus360Location | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showLostFoundModal, setShowLostFoundModal] = useState(false);

  const filters = ['All', 'Rooms', 'Labs', 'Faculty', 'Departments'];

  const loadData = async () => {
    if (!college) return;
    try {
      const r = await DataService.getRooms(college.id, searchQuery, activeFilter);
      setRooms(r.length > 0 ? r : SEED_ROOMS);

      const f = await DataService.getFaculty(college.id, searchQuery);
      setFaculty(f.length > 0 ? f : SEED_FACULTY);

      const locs = await DataService.get360Locations(college.id);
      setLocations360(locs.length > 0 ? locs : SEED_360_LOCATIONS);
    } catch (e) {
      console.error('Error loading campus places:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [college, searchQuery, activeFilter]);

  const handleOpen360 = (spotId?: string) => {
    const defaultSpot: Campus360Location = {
      id: 'loc_360_jspm_main',
      collegeId: college?.id || 'col_jspm_tathawade',
      name: 'Explore JSPM in 360°',
      description: 'Immersive 360° Clear Pano spatial tour of JSPM Tathawade Campus',
      category: 'Campus Tour',
      thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80',
      embedUrl: 'https://tours.clearpano.com/I4EFHxcx',
      externalUrl: 'https://tours.clearpano.com/I4EFHxcx',
      active: true,
      displayOrder: 0,
    };
    const target =
      locations360.find((l) => l.id === spotId) ||
      SEED_360_LOCATIONS.find((l) => l.id === spotId) ||
      locations360[0] ||
      SEED_360_LOCATIONS[0] ||
      defaultSpot;

    setSelected360Spot(target);
  };

  const filteredRooms = rooms.filter((room) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Rooms') return room.type === 'Classroom';
    if (activeFilter === 'Labs') return room.type === 'Lab';
    if (activeFilter === 'Faculty') return false;
    if (activeFilter === 'Departments') return room.department === searchQuery;
    return true;
  });

  return (
    <View style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <GlassSectionHeader
          title="Find your place"
          subtitle="Search rooms, people, and campus corners."
          style={{ marginBottom: Glass.space.lg }}
        />

        {/* SEARCH BAR */}
        <GlassSearchBar
          placeholder='Try "IT-204" or "library"'
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          showFilter
          onFilter={() => {}}
        />

        {/* FILTER PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterScrollView}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <GlassPill
                key={filter}
                selected={isActive}
                variant="purple"
                onPress={() => setActiveFilter(filter)}
              >
                {filter}
              </GlassPill>
            );
          })}
        </ScrollView>

        {/* HERO 360 CARD */}
        <GlassCard variant="hero" style={styles.hero360Card} onPress={() => handleOpen360('loc_360_jspm_main')}>
          <View style={styles.hero360LeftIcon}>
            <Ionicons name="image" size={28} color={Glass.text} />
          </View>

          <View style={styles.hero360Content}>
            <Text style={styles.hero360Title}>Explore JSPM in 360°</Text>
            <Text style={styles.hero360Subtitle}>Look around before you even reach the room.</Text>
          </View>

          <View style={styles.hero360ArrowCircle}>
            <Ionicons
              name="arrow-up-outline"
              size={18}
              color={Glass.purple}
              style={{ transform: [{ rotate: '45deg' }] }}
            />
          </View>
        </GlassCard>

        {/* ── RSCOE DIRECTORY & STUDENT SERVICES ── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: Glass.space.lg }}>
          <GlassCard
            variant="interactive"
            style={{ flex: 1, padding: 14 }}
            onPress={() => setShowContactsModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(74, 222, 128, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="call" size={16} color="#4ADE80" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Glass.text }}>Helplines</Text>
            </View>
            <Text style={{ fontSize: 11, color: Glass.textMuted }}>Emergency & TPO contacts</Text>
          </GlassCard>

          <GlassCard
            variant="interactive"
            style={{ flex: 1, padding: 14 }}
            onPress={() => setShowLostFoundModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 75, 166, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="search" size={16} color={Glass.purplePink} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Glass.text }}>Lost & Found</Text>
            </View>
            <Text style={{ fontSize: 11, color: Glass.textMuted }}>Belongings & notices</Text>
          </GlassCard>
        </View>

        {/* POPULAR PLACES SECTION */}

        <GlassSectionHeader
          title="Popular places"
          subtitle={`${filteredRooms.length} venues`}
          action={
            <Text style={styles.sectionLink}>View all</Text>
          }
        />

        {/* PLACES LIST */}
        <View style={styles.placesList}>
          {filteredRooms.map((room) => (
            <GlassCard
              key={room.id}
              variant="interactive"
              style={styles.roomCard}
              onPress={() => setSelectedRoom(room)}
            >
              <View style={[styles.roomIconWrapper, { backgroundColor: Glass.purpleDim }]}>
                <Ionicons name="location" size={22} color={Glass.purple} />
              </View>

              <View style={styles.roomMainInfo}>
                <View style={styles.roomHeaderRow}>
                  <Text style={styles.roomNumberTitle}>{room.name}</Text>
                  <GlassBadge variant="purple" size="sm">{room.type}</GlassBadge>
                </View>

                <Text style={styles.roomBreadcrumb}>
                  {room.department} · {room.buildingName} · {room.floor}
                </Text>

                <Text style={styles.roomDescription} numberOfLines={2}>
                  {room.description}
                </Text>

                {room.location360Id && (
                  <Pressable
                    style={styles.room360InlineBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOpen360(room.location360Id!);
                    }}
                  >
                    <Ionicons name="scan" size={14} color={Glass.purple} />
                    <Text style={styles.room360InlineText}>Open in 360°</Text>
                  </Pressable>
                )}
              </View>
            </GlassCard>
          ))}
        </View>

        {/* FACULTY DIRECTORY */}
        {(activeFilter === 'Faculty' || activeFilter === 'All') && faculty.length > 0 && (
          <>
            <GlassSectionHeader
              title="Faculty directory"
              subtitle={`${faculty.length} professors`}
            />

            <View style={styles.facultyList}>
              {faculty.map((fac) => (
                <GlassCard key={fac.id} variant="default" style={styles.facultyCard}>
                  <View style={[styles.facultyAvatarBox, { backgroundColor: Glass.purpleDim }]}>
                    <Ionicons name="person" size={22} color={Glass.purple} />
                  </View>
                  <View style={styles.facultyInfo}>
                    <Text style={styles.facultyName}>{fac.name}</Text>
                    <Text style={styles.facultyRole}>
                      {fac.designation} · {fac.department}
                    </Text>
                    <Text style={styles.facultySubjects}>
                      Teaches: {fac.subjects.join(', ')}
                    </Text>
                    <Text style={styles.facultyOffice}>Office: {fac.officeRoom}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* 360 MODAL (Spatial Panorama Viewer) */}
      <Spatial360Viewer
        visible={!!selected360Spot}
        location={selected360Spot}
        allLocations={locations360}
        onClose={() => setSelected360Spot(null)}
      />

      {/* ROOM DETAIL MODAL */}
      <GlassModal
        visible={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        size="md"
      >
        {selectedRoom && (
          <View style={styles.roomModalCard}>
            <View style={styles.roomModalTop}>
              <GlassBadge variant="purple" size="sm">{selectedRoom.type}</GlassBadge>
              <Pressable onPress={() => setSelectedRoom(null)}>
                <Ionicons name="close-circle" size={24} color={Glass.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.roomModalTitle}>{selectedRoom.name}</Text>
            <Text style={styles.roomModalBreadcrumb}>
              {selectedRoom.department} · {selectedRoom.buildingName} · {selectedRoom.floor}
            </Text>

            {selectedRoom.departmentTeacher ? (
              <GlassView variant="subtle" style={styles.roomModalTeacher}>
                <Text style={{ fontSize: Glass.fontSize.sm, fontWeight: Glass.fontWeight.extrabold, color: Glass.purple }}>
                  In-Charge: {selectedRoom.departmentTeacher}
                </Text>
                {selectedRoom.teacherPhone ? (
                  <Text style={{ fontSize: Glass.fontSize.xs, color: Glass.purple, marginTop: Glass.space.xs }}>
                    Mobile: {selectedRoom.teacherPhone}
                  </Text>
                ) : null}
                {selectedRoom.teacherEmail ? (
                  <Text style={{ fontSize: Glass.fontSize.xs, color: Glass.textMuted, marginTop: 1 }}>
                    Email: {selectedRoom.teacherEmail}
                  </Text>
                ) : null}
              </GlassView>
            ) : null}

            <Text style={styles.roomModalDesc}>{selectedRoom.description}</Text>

            {selectedRoom.capacity && (
              <Text style={styles.roomModalCapacity}>
                Seating Capacity: {selectedRoom.capacity} students
              </Text>
            )}

            <View style={styles.roomModalActions}>
              {selectedRoom.location360Id && (
                <GlassButton
                  variant="primary"
                  size="md"
                  leftIcon={<Ionicons name="scan" size={16} color={Glass.text} />}
                  onPress={() => {
                    const spotId = selectedRoom.location360Id!;
                    setSelectedRoom(null);
                    handleOpen360(spotId);
                  }}
                  style={styles.roomModal360Btn}
                >
                  Open in 360°
                </GlassButton>
              )}

              <GlassButton
                variant="ghost"
                size="md"
                onPress={() => setSelectedRoom(null)}
                style={styles.roomModalDismiss}
              >
                Close
              </GlassButton>
            </View>
          </View>
        )}
      </GlassModal>

      {/* CAMPUS CONTACTS & HELPLINES MODAL */}
      <CampusContactsModal
        visible={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />

      {/* CAMPUS LOST & FOUND MODAL */}
      <LostFoundModal
        visible={showLostFoundModal}
        onClose={() => setShowLostFoundModal(false)}
      />
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
  filterScrollView: {
    marginBottom: Glass.space.lg,
  },
  filterScroll: {
    gap: Glass.space.sm,
    paddingRight: Glass.space.md,
  },
  hero360Card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Glass.radius.xl,
    padding: Glass.space.md,
    marginBottom: Glass.space.xl,
    gap: Glass.space.md,
  },
  hero360LeftIcon: {
    width: 56,
    height: 56,
    borderRadius: Glass.radius.lg,
    backgroundColor: Glass.purpleBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero360Content: {
    flex: 1,
  },
  hero360Title: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  hero360Subtitle: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textSub,
    fontWeight: Glass.fontWeight.medium,
    lineHeight: Glass.lineHeight.normal * Glass.fontSize.sm,
  },
  hero360ArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: Glass.radius.circle,
    backgroundColor: Glass.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placesList: {
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  roomCard: {
    flexDirection: 'row',
    padding: Glass.space.md,
    gap: Glass.space.md,
  },
  roomIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Glass.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomMainInfo: {
    flex: 1,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.xs,
  },
  roomNumberTitle: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  roomBreadcrumb: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.sm,
    fontWeight: Glass.fontWeight.medium,
  },
  roomDescription: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    lineHeight: Glass.lineHeight.normal * Glass.fontSize.md,
  },
  room360InlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    marginTop: Glass.space.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Glass.space.sm,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.sm,
  },
  room360InlineText: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
  },
  facultyList: {
    gap: Glass.space.md,
  },
  facultyCard: {
    flexDirection: 'row',
    padding: Glass.space.md,
    gap: Glass.space.md,
  },
  facultyAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: Glass.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  facultyRole: {
    fontSize: Glass.fontSize.sm,
    color: Glass.purple,
    marginTop: Glass.space.xs,
    fontWeight: Glass.fontWeight.semibold,
  },
  facultySubjects: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
  },
  facultyOffice: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textDim,
    marginTop: Glass.space.xs,
  },
  roomModalCard: {
    padding: Glass.space.lg,
  },
  roomModalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.md,
  },
  roomModalTitle: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.sm,
  },
  roomModalBreadcrumb: {
    fontSize: Glass.fontSize.md,
    color: Glass.purple,
    marginBottom: Glass.space.md,
    fontWeight: Glass.fontWeight.semibold,
  },
  roomModalTeacher: {
    marginVertical: Glass.space.md,
  },
  roomModalDesc: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    lineHeight: Glass.lineHeight.relaxed * Glass.fontSize.md,
    marginBottom: Glass.space.md,
  },
  roomModalCapacity: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textDim,
    marginBottom: Glass.space.xl,
  },
  roomModalActions: {
    gap: Glass.space.sm,
  },
  roomModal360Btn: {
    width: '100%',
  },
  roomModalDismiss: {
    width: '100%',
  },
});