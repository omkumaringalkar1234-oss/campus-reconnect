import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAppTheme } from '@/context/theme-context';

export default function StudentTabLayout() {
  const { glass } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: glass.bgElevated,
            borderTopColor: glass.border,
            borderTopWidth: 1,
          },
        ],
        tabBarShowLabel: true,
        tabBarActiveTintColor: glass.purple,
        tabBarInactiveTintColor: glass.textDim,
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: { backgroundColor: glass.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: glass.purpleDim },
              ]}
            >
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? glass.purple : glass.textDim}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="campus"
        options={{
          title: 'Campus',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: glass.purpleDim },
              ]}
            >
              <Ionicons
                name={focused ? 'compass' : 'compass-outline'}
                size={22}
                color={focused ? glass.purple : glass.textDim}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="canteen"
        options={{
          title: 'Canteen',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: glass.purpleDim },
              ]}
            >
              <Ionicons
                name={focused ? 'restaurant' : 'restaurant-outline'}
                size={22}
                color={focused ? glass.purple : glass.textDim}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: glass.purpleDim },
              ]}
            >
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                size={22}
                color={focused ? glass.purple : glass.textDim}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: glass.purpleDim },
              ]}
            >
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={22}
                color={focused ? glass.purple : glass.textDim}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Glass.bgElevated,
    borderTopWidth: 1,
    borderTopColor: Glass.border,
    height: Platform.OS === 'ios' ? 92 : 76,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    ...Platform.select({
      web: {
        backdropFilter: Glass.blur.heavy,
        WebkitBackdropFilter: Glass.blur.heavy,
      },
    }),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  iconWrapper: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});