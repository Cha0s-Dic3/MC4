import React, { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const GRID_SIZE = 40;

function Orb({
  color,
  size,
  top,
  left,
  delay = 0,
  duration = 6000,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  delay?: number;
  duration?: number;
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0.75, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          // soft glow via large shadow on iOS, fall back to opacity blur on Android
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: size / 2,
          shadowOffset: { width: 0, height: 0 },
          opacity: 0.5,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.55,
        }}
      />
    </Animated.View>
  );
}

export function PortfolioBackground() {
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(GRID_SIZE, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gridStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }, { translateY: drift.value }],
  }));

  // Render an oversized SVG so drifting doesn't reveal edges.
  const w = width + GRID_SIZE * 2;
  const h = height + GRID_SIZE * 2;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
    >
      <Animated.View
        style={[
          { position: "absolute", top: -GRID_SIZE, left: -GRID_SIZE },
          gridStyle,
        ]}
      >
        <Svg width={w} height={h}>
          <Defs>
            <Pattern
              id="grid"
              width={GRID_SIZE}
              height={GRID_SIZE}
              patternUnits="userSpaceOnUse"
            >
              <Line
                x1="0"
                y1="0"
                x2={GRID_SIZE}
                y2="0"
                stroke={colors.grid}
                strokeWidth="1"
              />
              <Line
                x1="0"
                y1="0"
                x2="0"
                y2={GRID_SIZE}
                stroke={colors.grid}
                strokeWidth="1"
              />
            </Pattern>
          </Defs>
          <Rect width={w} height={h} fill="url(#grid)" />
        </Svg>
      </Animated.View>

      <Orb
        color={colors.pink}
        size={320}
        top={-80}
        left={-100}
        duration={6500}
      />
      <Orb
        color={colors.purpleDeep}
        size={260}
        top={height * 0.35}
        left={width - 140}
        duration={7800}
      />
      <Orb
        color={colors.pinkBright}
        size={300}
        top={height * 0.7}
        left={-90}
        duration={9000}
      />
    </View>
  );
}
