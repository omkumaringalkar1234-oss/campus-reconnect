import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import {
  LostFoundService,
  LostFoundItem,
  LostFoundItemType,
  LOST_FOUND_CATEGORIES,
} from '@/services/lost-found-service';

interface LostFoundModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LostFoundModal({ visible, onClose }: LostFoundModalProps) {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'report'>('browse');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Report form state
  const [reportType, setReportType] = useState<LostFoundItemType>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wallets');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactHint, setContactHint] = useState('');

  const loadData = async () => {
    const list = await LostFoundService.getItems();
    setItems(list);
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [items, typeFilter, categoryFilter, searchQuery]);

  const handleSubmitReport = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in the title, location, and description.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const updated = await LostFoundService.reportItem({
      type: reportType,
      title: title.trim(),
      category,
      location: location.trim(),
      eventDate: todayStr,
      description: description.trim(),
      contactHint: contactHint.trim() || undefined,
      userDisplayName: 'Verified Student',
    });

    setItems(updated);
    Alert.alert('Report Submitted', 'Your item notice has been posted to the campus community.');
    setTitle('');
    setLocation('');
    setDescription('');
    setContactHint('');
    setActiveTab('browse');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Ionicons name="search" size={22} color={Glass.purple} />
                <Text style={styles.titleText}>Campus Lost & Found</Text>
              </View>
              <Text style={styles.subtitleText}>RSCOE Tathawade Student Belongings Board</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Glass.text} />
            </Pressable>
          </View>

          {/* Top Switcher: Browse vs Report */}
          <View style={styles.segmentRow}>
            <Pressable
              style={[
                styles.segmentBtn,
                activeTab === 'browse' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveTab('browse')}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={activeTab === 'browse' ? Glass.purpleBright : Glass.textMuted}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  activeTab === 'browse' && styles.segmentBtnTextActive,
                ]}
              >
                Browse Items
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segmentBtn,
                activeTab === 'report' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveTab('report')}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={activeTab === 'report' ? Glass.tealBright : Glass.textMuted}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  activeTab === 'report' && { color: Glass.tealBright, fontWeight: '700' },
                ]}
              >
                Report Item
              </Text>
            </Pressable>
          </View>

          {activeTab === 'browse' ? (
            <>
              {/* Type toggle: All | Lost | Found */}
              <View style={styles.typeToggleRow}>
                {(['all', 'lost', 'found'] as const).map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeFilterBtn,
                      typeFilter === t && styles.typeFilterBtnActive,
                    ]}
                    onPress={() => setTypeFilter(t)}
                  >
                    <Text
                      style={[
                        styles.typeFilterText,
                        typeFilter === t && styles.typeFilterTextActive,
                      ]}
                    >
                      {t.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Categories Scroll */}
              <View style={{ marginBottom: 10 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {LOST_FOUND_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.catPill,
                        categoryFilter === cat && styles.catPillActive,
                      ]}
                      onPress={() => setCategoryFilter(cat)}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          categoryFilter === cat && styles.catPillTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Items List */}
              <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 40 }}>
                {filteredItems.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="file-tray-outline" size={32} color={Glass.textDim} />
                    <Text style={styles.emptyText}>No items found matching the selected filters.</Text>
                  </View>
                ) : (
                  filteredItems.map((item) => {
                    const isFound = item.type === 'found';
                    return (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <View
                            style={[
                              styles.typeBadge,
                              {
                                backgroundColor: isFound
                                  ? 'rgba(74, 222, 128, 0.15)'
                                  : 'rgba(248, 113, 113, 0.15)',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.typeBadgeText,
                                { color: isFound ? '#4ADE80' : '#F87171' },
                              ]}
                            >
                              {item.type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.itemCatBadge}>{item.category}</Text>
                        </View>

                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemDesc}>{item.description}</Text>

                        <View style={styles.itemFooter}>
                          <View style={styles.itemFooterItem}>
                            <Ionicons name="location-outline" size={13} color={Glass.textMuted} />
                            <Text style={styles.itemFooterText}>{item.location}</Text>
                          </View>
                          <View style={styles.itemFooterItem}>
                            <Ionicons name="calendar-outline" size={13} color={Glass.textMuted} />
                            <Text style={styles.itemFooterText}>{item.eventDate}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </>
          ) : (
            /* Report Form */
            <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>Item Type</Text>
                <View style={styles.formTypeRow}>
                  <Pressable
                    style={[
                      styles.formTypeBtn,
                      reportType === 'lost' && styles.formTypeBtnLostActive,
                    ]}
                    onPress={() => setReportType('lost')}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={reportType === 'lost' ? '#FFF' : '#F87171'}
                    />
                    <Text
                      style={[
                        styles.formTypeBtnText,
                        reportType === 'lost' && { color: '#FFF' },
                      ]}
                    >
                      I Lost Something
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.formTypeBtn,
                      reportType === 'found' && styles.formTypeBtnFoundActive,
                    ]}
                    onPress={() => setReportType('found')}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color={reportType === 'found' ? '#FFF' : '#4ADE80'}
                    />
                    <Text
                      style={[
                        styles.formTypeBtnText,
                        reportType === 'found' && { color: '#FFF' },
                      ]}
                    >
                      I Found Something
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.formLabel}>Item Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Blue Titan Watch, ID card holder"
                  placeholderTextColor={Glass.textDim}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryPickerRow}>
                  {LOST_FOUND_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <Pressable
                      key={c}
                      style={[
                        styles.catOption,
                        category === c && styles.catOptionActive,
                      ]}
                      onPress={() => setCategory(c)}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          category === c && styles.catOptionTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>Campus Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Canteen 1st floor, Library table 5"
                  placeholderTextColor={Glass.textDim}
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, { height: 75, textAlignVertical: 'top' }]}
                  placeholder="Describe color, brand, condition, or identifying marks..."
                  placeholderTextColor={Glass.textDim}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.formLabel}>Contact / Handover Instructions</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Submitted at Security Gate 1, or WhatsApp: 98..."
                  placeholderTextColor={Glass.textDim}
                  value={contactHint}
                  onChangeText={setContactHint}
                />

                <Pressable style={styles.submitBtn} onPress={handleSubmitReport}>
                  <Ionicons name="send" size={16} color="#FFF" />
                  <Text style={styles.submitBtnText}>Post Notice</Text>
                </Pressable>
              </View>
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
  typeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  typeFilterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  typeFilterBtnActive: {
    backgroundColor: Glass.purpleDim,
    borderColor: Glass.purple,
  },
  typeFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: Glass.textMuted,
  },
  typeFilterTextActive: {
    color: Glass.purpleBright,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  catPillActive: {
    backgroundColor: Glass.purpleDim,
    borderColor: Glass.purple,
  },
  catPillText: {
    fontSize: 11,
    color: Glass.textSub,
    fontWeight: '500',
  },
  catPillTextActive: {
    color: Glass.purpleBright,
    fontWeight: '700',
  },
  listScroll: {
    flex: 1,
  },
  emptyBox: {
    alignItems: 'center',
    padding: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: Glass.textMuted,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemCatBadge: {
    fontSize: 11,
    color: Glass.textMuted,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Glass.text,
  },
  itemDesc: {
    fontSize: 12,
    color: Glass.textSub,
    marginTop: 4,
    lineHeight: 16,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemFooterText: {
    fontSize: 11,
    color: Glass.textMuted,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 16,
    padding: 16,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Glass.purple,
    marginBottom: 6,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  formTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  formTypeBtnLostActive: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  formTypeBtnFoundActive: {
    backgroundColor: '#16A34A',
    borderColor: '#22C55E',
  },
  formTypeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Glass.textSub,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Glass.text,
    fontSize: 13,
    marginBottom: 6,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  catOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  catOptionActive: {
    backgroundColor: Glass.purpleDim,
    borderColor: Glass.purple,
  },
  catOptionText: {
    fontSize: 11,
    color: Glass.textMuted,
  },
  catOptionTextActive: {
    color: Glass.purpleBright,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Glass.purpleBright,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
