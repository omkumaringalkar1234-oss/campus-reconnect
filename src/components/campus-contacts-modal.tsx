import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
  CAMPUS_CONTACTS,
  CampusContactItem,
  handleContactAction,
} from '@/services/contacts-data';

interface CampusContactsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CampusContactsModal({ visible, onClose }: CampusContactsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CAMPUS_CONTACTS.map((cat) => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase();
    const items = cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.designationOrNote.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q)
    );
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Ionicons name="call" size={22} color={Glass.purple} />
                <Text style={styles.titleText}>Important Campus Contacts</Text>
              </View>
              <Text style={styles.subtitleText}>Emergency Helplines, Admission & TPO Directory</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Glass.text} />
            </Pressable>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={Glass.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts, faculty or helplines..."
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

          {/* Contact Lists by Category */}
          <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredCategories.map((cat) => (
              <View key={cat.category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Ionicons name={cat.iconName as any} size={16} color={Glass.purpleBright} />
                  <Text style={styles.categoryTitle}>{cat.category}</Text>
                </View>

                {cat.items.map((item) => {
                  let actionIcon = 'call-outline';
                  let actionBg = 'rgba(74, 222, 128, 0.15)';
                  let actionColor = '#4ADE80';
                  let actionText = 'Call';

                  if (item.actionType === 'email') {
                    actionIcon = 'mail-outline';
                    actionBg = 'rgba(196, 170, 255, 0.15)';
                    actionColor = Glass.purpleBright;
                    actionText = 'Email';
                  } else if (item.actionType === 'whatsapp') {
                    actionIcon = 'logo-whatsapp';
                    actionBg = 'rgba(37, 211, 102, 0.18)';
                    actionColor = '#25D366';
                    actionText = 'Chat';
                  } else if (item.actionType === 'map') {
                    actionIcon = 'map-outline';
                    actionBg = 'rgba(255, 184, 75, 0.15)';
                    actionColor = Glass.gold;
                    actionText = 'Maps';
                  }

                  return (
                    <View key={item.id} style={styles.contactCard}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactNote}>{item.designationOrNote}</Text>
                        <Text style={styles.contactValue}>{item.value}</Text>
                      </View>

                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: actionBg, borderColor: `${actionColor}40` }]}
                        onPress={() => handleContactAction(item)}
                      >
                        <Ionicons name={actionIcon as any} size={15} color={actionColor} />
                        <Text style={[styles.actionBtnText, { color: actionColor }]}>
                          {actionText}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
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
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: Glass.text,
    fontSize: 13,
  },
  listScroll: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Glass.purple,
    letterSpacing: 0.5,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: Glass.text,
  },
  contactNote: {
    fontSize: 11,
    color: Glass.textMuted,
    marginTop: 1,
  },
  contactValue: {
    fontSize: 12,
    color: Glass.purple,
    fontWeight: '600',
    marginTop: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
