import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import {
  ACADEMIC_EVENTS,
  HOLIDAYS_LIST,
  CalendarEvent,
  HolidayItem,
  EventCategory,
  formatEventDateRange,
  getDaysUntil,
} from '@/services/calendar-data';
import {
  GlassBadge,
  GlassCard,
  GlassDivider,
  GlassPill,
  GlassSectionHeader,
  GlassView,
} from './ui/glass-components';

interface AcademicCalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AcademicCalendarModal({ visible, onClose }: AcademicCalendarModalProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'holidays'>('calendar');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');

  const categories: { key: EventCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'grid-outline' },
    { key: 'exam', label: 'Exams', icon: 'document-text-outline' },
    { key: 'academic', label: 'Academic', icon: 'school-outline' },
    { key: 'event', label: 'Events', icon: 'sparkles-outline' },
    { key: 'holiday', label: 'Holidays', icon: 'calendar-outline' },
  ];

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return ACADEMIC_EVENTS;
    return ACADEMIC_EVENTS.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  const upcomingHolidays = useMemo(() => {
    return [...HOLIDAYS_LIST].sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const nextEvent = useMemo(() => {
    const nowIso = new Date().toISOString().slice(0, 10);
    return ACADEMIC_EVENTS.find((e) => (e.end || e.start) >= nowIso);
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Ionicons name="calendar" size={22} color={Glass.purple} />
                <Text style={styles.titleText}>Academic Almanac</Text>
              </View>
              <Text style={styles.subtitleText}>RSCOE Tathawade · A.Y. 2026–2027</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Glass.text} />
            </Pressable>
          </View>

          {/* Top Switcher: Calendar vs Holidays */}
          <View style={styles.segmentRow}>
            <Pressable
              style={[
                styles.segmentBtn,
                activeTab === 'calendar' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveTab('calendar')}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={activeTab === 'calendar' ? Glass.purpleBright : Glass.textMuted}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  activeTab === 'calendar' && styles.segmentBtnTextActive,
                ]}
              >
                Academic Calendar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segmentBtn,
                activeTab === 'holidays' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveTab('holidays')}
            >
              <Ionicons
                name="airplane-outline"
                size={16}
                color={activeTab === 'holidays' ? Glass.tealBright : Glass.textMuted}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  activeTab === 'holidays' && { color: Glass.tealBright, fontWeight: '700' },
                ]}
              >
                Holidays List
              </Text>
            </Pressable>
          </View>

          {/* Next Milestone Banner */}
          {nextEvent && activeTab === 'calendar' && (
            <View style={styles.nextEventBanner}>
              <View style={styles.nextEventIconBox}>
                <Ionicons name="flag-outline" size={20} color={Glass.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextEventLabel}>UPCOMING MILESTONE</Text>
                <Text style={styles.nextEventTitle} numberOfLines={1}>
                  {nextEvent.title}
                </Text>
                <Text style={styles.nextEventDate}>
                  {formatEventDateRange(nextEvent.start, nextEvent.end)} · in{' '}
                  {Math.max(0, getDaysUntil(nextEvent.start))} days
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'calendar' ? (
            <>
              {/* Category Filter Pills */}
              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.key;
                    return (
                      <Pressable
                        key={c.key}
                        style={[
                          styles.catPill,
                          isSelected && styles.catPillSelected,
                        ]}
                        onPress={() => setSelectedCategory(c.key)}
                      >
                        <Ionicons
                          name={c.icon as any}
                          size={14}
                          color={isSelected ? Glass.purpleBright : Glass.textSub}
                        />
                        <Text
                          style={[
                            styles.catPillText,
                            isSelected && styles.catPillTextSelected,
                          ]}
                        >
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Events List */}
              <ScrollView style={styles.bodyScroll} contentContainerStyle={{ paddingBottom: 40 }}>
                {filteredEvents.map((event) => {
                  const daysLeft = getDaysUntil(event.start);
                  const isPast = daysLeft < 0;
                  const isNear = daysLeft >= 0 && daysLeft <= 14;

                  let badgeColor = Glass.purpleDim;
                  let badgeText = Glass.purple;
                  if (event.category === 'exam') {
                    badgeColor = 'rgba(255, 75, 166, 0.15)';
                    badgeText = Glass.purplePink;
                  } else if (event.category === 'holiday') {
                    badgeColor = Glass.tealDim;
                    badgeText = Glass.teal;
                  } else if (event.category === 'event') {
                    badgeColor = Glass.goldDim;
                    badgeText = Glass.gold;
                  }

                  return (
                    <View
                      key={event.id}
                      style={[
                        styles.eventCard,
                        isNear && styles.eventCardNear,
                        isPast && { opacity: 0.6 },
                      ]}
                    >
                      <View style={styles.eventCardTop}>
                        <View style={[styles.eventCatBadge, { backgroundColor: badgeColor }]}>
                          <Text style={[styles.eventCatText, { color: badgeText }]}>
                            {event.category.toUpperCase()}
                          </Text>
                        </View>
                        {isPast ? (
                          <Text style={styles.passedText}>Concluded</Text>
                        ) : (
                          <Text style={[styles.countdownText, isNear && { color: Glass.gold }]}>
                            {daysLeft === 0 ? 'Today' : `in ${daysLeft}d`}
                          </Text>
                        )}
                      </View>

                      <Text style={styles.eventCardTitle}>{event.title}</Text>
                      {event.description && (
                        <Text style={styles.eventCardDesc}>{event.description}</Text>
                      )}

                      <View style={styles.eventCardFooter}>
                        <Ionicons name="time-outline" size={14} color={Glass.textMuted} />
                        <Text style={styles.eventCardFooterDate}>
                          {formatEventDateRange(event.start, event.end)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          ) : (
            /* Holidays List */
            <ScrollView style={styles.bodyScroll} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.holidaysHeaderBox}>
                <Ionicons name="information-circle-outline" size={18} color={Glass.teal} />
                <Text style={styles.holidaysHeaderNote}>
                  Official Maharashtra Government & RSCOE autonomous declared holidays for 2026–2027.
                </Text>
              </View>

              {upcomingHolidays.map((holiday) => {
                const daysLeft = getDaysUntil(holiday.date);
                const isPast = daysLeft < 0;

                return (
                  <View
                    key={holiday.id}
                    style={[
                      styles.holidayItem,
                      isPast && { opacity: 0.55 },
                    ]}
                  >
                    <View style={styles.holidayDateBox}>
                      <Text style={styles.holidayDateNum}>
                        {new Date(holiday.date + 'T00:00:00').getDate()}
                      </Text>
                      <Text style={styles.holidayDateMonth}>
                        {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-IN', {
                          month: 'short',
                        })}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.holidayName}>{holiday.name}</Text>
                      <Text style={styles.holidaySub}>
                        {holiday.dayOfWeek} · {holiday.type}
                      </Text>
                    </View>

                    <View style={styles.holidayRight}>
                      {isPast ? (
                        <Text style={styles.passedText}>Passed</Text>
                      ) : (
                        <View style={styles.holidayDaysBadge}>
                          <Text style={styles.holidayDaysText}>
                            {daysLeft === 0 ? 'Today' : `${daysLeft}d away`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
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
    maxHeight: '90%',
    minHeight: '75%',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: Glass.text,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  subtitleText: {
    fontSize: 12,
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
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(196, 170, 255, 0.16)',
    borderColor: 'rgba(196, 170, 255, 0.35)',
    borderWidth: 1,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Glass.textMuted,
  },
  segmentBtnTextActive: {
    color: Glass.purpleBright,
    fontWeight: '700',
  },
  nextEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 75, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 75, 0.3)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 12,
  },
  nextEventIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 184, 75, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextEventLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Glass.gold,
    letterSpacing: 0.8,
  },
  nextEventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Glass.text,
    marginTop: 1,
  },
  nextEventDate: {
    fontSize: 12,
    color: Glass.textSub,
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  catPillSelected: {
    backgroundColor: Glass.purpleDim,
    borderColor: Glass.purple,
  },
  catPillText: {
    fontSize: 12,
    color: Glass.textSub,
    fontWeight: '500',
  },
  catPillTextSelected: {
    color: Glass.purpleBright,
    fontWeight: '700',
  },
  bodyScroll: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  eventCardNear: {
    borderColor: 'rgba(196, 170, 255, 0.45)',
    backgroundColor: 'rgba(196, 170, 255, 0.07)',
  },
  eventCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eventCatText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: Glass.textSub,
  },
  passedText: {
    fontSize: 11,
    color: Glass.textDim,
  },
  eventCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Glass.text,
    lineHeight: 20,
  },
  eventCardDesc: {
    fontSize: 12,
    color: Glass.textSub,
    marginTop: 4,
    lineHeight: 16,
  },
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  eventCardFooterDate: {
    fontSize: 12,
    color: Glass.textMuted,
  },
  holidaysHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Glass.tealDim,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  holidaysHeaderNote: {
    fontSize: 12,
    color: Glass.tealBright,
    flex: 1,
    lineHeight: 16,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  holidayDateBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 220, 200, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 220, 200, 0.3)',
  },
  holidayDateNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Glass.tealBright,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  holidayDateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: Glass.teal,
    textTransform: 'uppercase',
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '700',
    color: Glass.text,
  },
  holidaySub: {
    fontSize: 11,
    color: Glass.textMuted,
    marginTop: 2,
  },
  holidayRight: {
    alignItems: 'flex-end',
  },
  holidayDaysBadge: {
    backgroundColor: 'rgba(196, 170, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  holidayDaysText: {
    fontSize: 11,
    fontWeight: '700',
    color: Glass.purple,
  },
});
