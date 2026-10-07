// ─── Campus Lost & Found Service ─────────────────────────────────────────────
// Ported from: https://github.com/samarthdahiwal438-source/rscoetimetable

import AsyncStorage from '@react-native-async-storage/async-storage';

export type LostFoundItemType = 'lost' | 'found';
export type LostFoundItemStatus = 'active' | 'resolved';

export interface LostFoundItem {
  id: string;
  type: LostFoundItemType;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  eventTime?: string;
  description: string;
  imageUrl?: string;
  status: LostFoundItemStatus;
  userDisplayName?: string;
  contactHint?: string;
  createdAt: string;
}

export const LOST_FOUND_CATEGORIES = [
  'All',
  'ID Cards',
  'Wallets',
  'Electronics',
  'Keys',
  'Bags',
  'Books & Notes',
  'Clothing',
  'Accessories',
  'Other',
];

const STORAGE_KEY = '@campus_connect_lost_found_v1';

export const INITIAL_LOST_FOUND_ITEMS: LostFoundItem[] = [
  {
    id: 'lf-1',
    type: 'found',
    title: 'Black Leather Wallet',
    category: 'Wallets',
    location: 'Central Library, 2nd Floor',
    eventDate: '2026-10-04',
    eventTime: '11:30 AM',
    description: 'Found near reading table 14. Handed over to library circulation counter.',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    userDisplayName: 'Library Staff',
    createdAt: '2026-10-04T11:30:00Z',
  },
  {
    id: 'lf-2',
    type: 'lost',
    title: 'Student ID Card (B.Tech IT)',
    category: 'ID Cards',
    location: 'Block A, Room 204 or Canteen',
    eventDate: '2026-10-03',
    eventTime: '2:00 PM',
    description: 'Lost blue lanyard holder with RSCOE ID card. Please return to IT Dept or security desk.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    userDisplayName: 'FY IT Student',
    createdAt: '2026-10-03T14:00:00Z',
  },
  {
    id: 'lf-3',
    type: 'found',
    title: 'Scientific Calculator (Casio fx-991EX)',
    category: 'Electronics',
    location: 'Drawing Hall / Lab 204',
    eventDate: '2026-10-02',
    eventTime: '4:15 PM',
    description: 'Found after Engineering Mechanics lecture. Has a small sticker on the back.',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    userDisplayName: 'Class Representative',
    createdAt: '2026-10-02T16:15:00Z',
  },
  {
    id: 'lf-4',
    type: 'lost',
    title: 'Bike Key with RSCOE Keychain',
    category: 'Keys',
    location: 'Main Gate Two-Wheeler Parking',
    eventDate: '2026-10-01',
    eventTime: '5:30 PM',
    description: 'Lost Honda bike key with black leather strap and college emblem.',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    userDisplayName: 'Student',
    createdAt: '2026-10-01T17:30:00Z',
  },
  {
    id: 'lf-5',
    type: 'found',
    title: 'Navy Blue College Backpack',
    category: 'Bags',
    location: 'Campus Canteen Outdoor Seating',
    eventDate: '2026-09-30',
    eventTime: '1:00 PM',
    description: 'Contains Calculus notebook and engineering drawing folder. Kept with canteen manager.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    userDisplayName: 'Canteen Desk',
    createdAt: '2026-09-30T13:00:00Z',
  },
];

export const LostFoundService = {
  async getItems(): Promise<LostFoundItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOST_FOUND_ITEMS));
        return INITIAL_LOST_FOUND_ITEMS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOST_FOUND_ITEMS;
    }
  },

  async reportItem(item: Omit<LostFoundItem, 'id' | 'createdAt' | 'status'>): Promise<LostFoundItem[]> {
    try {
      const current = await this.getItems();
      const newItem: LostFoundItem = {
        ...item,
        id: `lf-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...current];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to save lost & found item:', e);
      return [];
    }
  },

  async resolveItem(id: string): Promise<LostFoundItem[]> {
    try {
      const current = await this.getItems();
      const updated = current.map((i) => (i.id === id ? { ...i, status: 'resolved' as const } : i));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },
};
