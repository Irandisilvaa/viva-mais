import React, { useRef } from 'react';
import { Animated, Platform, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ children, style, onPress, disabled, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => Animated.spring(scale, {
    toValue,
    useNativeDriver: Platform.OS !== 'web',
    speed: 28,
    bounciness: 4,
  }).start();

  return (
    <AnimatedPressableBase
      {...props}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animate(0.985)}
      onPressOut={() => animate(1)}
      style={[style as any, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
