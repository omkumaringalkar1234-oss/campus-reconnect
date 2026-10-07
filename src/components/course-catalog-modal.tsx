import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import {
  RSCOE_FY_COURSES,
  SubjectCatalogItem,
} from '@/services/subject-catalog-data';

interface CourseCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function CourseCatalogModal({
  visible,
  onClose,
  initialQuery = '',
}: CourseCatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Theory' | 'Practical'>('All');
  const [selectedCourse, setSelectedCourse] = useState<SubjectCatalogItem | null>(null);

  const filteredCourses = useMemo(() => {
    return RSCOE_FY_COURSES.filter((course) => {
      if (typeFilter !== 'All' && course.type !== typeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        course.code.toLowerCase().includes(q) ||
        course.name.toLowerCase().includes(q) ||
        (course.shortAbbr && course.shortAbbr.toLowerCase().includes(q)) ||
        course.branches.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, typeFilter]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Ionicons name="book" size={22} color={Glass.purple} />
                <Text style={styles.titleText}>Subject & Syllabus Catalog</Text>
              </View>
              <Text style={styles.subtitleText}>F.Y. B.Tech · Pattern 2025 Autonomous Curriculum</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Glass.text} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={Glass.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by code (e.g. ES1301T) or name..."
              placeholderTextColor={Glass.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={Glass.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Type Filters */}
          <View style={styles.typeFilterRow}>
            {(['All', 'Theory', 'Practical'] as const).map((t) => (
              <Pressable
                key={t}
                style={[styles.typeBtn, typeFilter === t && styles.typeBtnActive]}
                onPress={() => setTypeFilter(t)}
              >
                <Text style={[styles.typeBtnText, typeFilter === t && styles.typeBtnTextActive]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Course List */}
          <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredCourses.map((c) => (
              <Pressable
                key={c.code}
                style={[
                  styles.courseCard,
                  selectedCourse?.code === c.code && styles.courseCardActive,
                ]}
                onPress={() => setSelectedCourse(selectedCourse?.code === c.code ? null : c)}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{c.code}</Text>
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          c.type === 'Theory'
                            ? 'rgba(196, 170, 255, 0.12)'
                            : 'rgba(100, 220, 200, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        { color: c.type === 'Theory' ? Glass.purple : Glass.tealBright },
                      ]}
                    >
                      {c.type}
                    </Text>
                  </View>
                </View>

                <Text style={styles.courseName}>{c.name}</Text>
                {c.shortAbbr && (
                  <Text style={styles.shortAbbr}>Abbreviation: {c.shortAbbr}</Text>
                )}

                <View style={styles.cardMetricsRow}>
                  <View style={styles.metricItem}>
                    <Ionicons name="star-outline" size={13} color={Glass.gold} />
                    <Text style={styles.metricText}>{c.credits} Credits</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="pie-chart-outline" size={13} color={Glass.purple} />
                    <Text style={styles.metricText}>Max {c.maxMarks} Marks</Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {selectedCourse?.code === c.code && (
                  <View style={styles.expandedBox}>
                    {c.description && (
                      <View style={styles.descWrap}>
                        <Text style={styles.descLabel}>Syllabus Overview:</Text>
                        <Text style={styles.descBody}>{c.description}</Text>
                      </View>
                    )}
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.descLabel}>Applicable Branches:</Text>
                      <View style={styles.branchesRow}>
                        {c.branches.map((b) => (
                          <View key={b} style={styles.branchTag}>
                            <Text style={styles.branchTagText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F0318',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(196,170,255,0.25)',
    maxHeight: '92%',
    minHeight: '75%',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: Glass.text,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  subtitleText: {
    fontSize: 11,
    color: Glass.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: Glass.text,
    fontSize: 13,
  },
  typeFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  typeBtnActive: {
    backgroundColor: Glass.purpleDim,
    borderColor: Glass.purple,
  },
  typeBtnText: {
    fontSize: 12,
    color: Glass.textSub,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: Glass.purpleBright,
    fontWeight: '700',
  },
  listScroll: {
    flex: 1,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  courseCardActive: {
    borderColor: 'rgba(196, 170, 255, 0.45)',
    backgroundColor: 'rgba(196, 170, 255, 0.06)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: 'rgba(196, 170, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Glass.purple,
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    color: Glass.text,
  },
  shortAbbr: {
    fontSize: 11,
    color: Glass.textMuted,
    marginTop: 2,
  },
  cardMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontSize: 12,
    color: Glass.textSub,
    fontWeight: '600',
  },
  expandedBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 170, 255, 0.15)',
  },
  descWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Glass.purple,
    marginBottom: 3,
  },
  descBody: {
    fontSize: 12,
    color: Glass.textSub,
    lineHeight: 17,
  },
  branchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  branchTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  branchTagText: {
    fontSize: 10,
    color: Glass.textSub,
  },
});
