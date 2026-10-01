/**
 * DeviceFrame (web) fills the browser viewport, matching the native passthrough.
 */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export function DeviceFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.stage, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  stage: { flex: 1, width: '100%' },
});

export default DeviceFrame;
