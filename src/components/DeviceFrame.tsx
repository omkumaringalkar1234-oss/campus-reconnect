/**
 * DeviceFrame — native passthrough.
 *
 * On iOS/Android the app is a real app: full-bleed, edge to edge, no chrome.
 * The photorealistic device mockup only exists on web (see DeviceFrame.web).
 */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export type DeviceFrameProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function DeviceFrame({ children, style }: DeviceFrameProps) {
  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default DeviceFrame;
