import { Redirect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import SplashScreen from '@/app/splash';
import { colors } from '@/theme';

/**
 * Entry gate.
 *
 * Runs the animated intro once per cold start, then hands off to the existing
 * role-based routing. All auth decisions still live here exactly as before —
 * the splash only delays them by a couple of seconds, and never blocks them.
 */

/** Module-scoped so the intro does not replay on every navigation to `/`. */
let hasPlayedIntro = false;

export default function Index() {
  const { profile, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(!hasPlayedIntro);
  const finishing = useRef(false);

  const finishIntro = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    hasPlayedIntro = true;
    setShowIntro(false);
  }, []);

  if (showIntro) {
    return <SplashScreen onFinish={finishIntro} />;
  }

  // Hold on the splash rather than flashing a bare spinner while Firebase
  // resolves the session — same principle: never show a half-built screen.
  if (loading) {
    return <View style={styles.hold} />;
  }

  if (!profile) {
    return <Redirect href={'/login' as any} />;
  }

  switch (profile.role) {
    case 'student':
      return <Redirect href={'/(student)' as any} />;
    case 'college_admin':
      return <Redirect href={'/admin' as any} />;
    case 'food_court_staff':
      return <Redirect href={'/food-court' as any} />;
    case 'teacher_staff':
      return <Redirect href={'/staff' as any} />;
    case 'super_admin':
      return <Redirect href={'/super-admin' as any} />;
    default:
      return <Redirect href={'/login' as any} />;
  }
}

const styles = StyleSheet.create({
  hold: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
