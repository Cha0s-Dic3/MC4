import React, { useEffect, useRef, useState } from "react";
import { Text, TextStyle, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

type Props = {
  words: string[];
  style?: TextStyle;
  cursorColor?: string;
};

export function Typewriter({ words, style, cursorColor }: Props) {
  const colors = useColors();
  const [text, setText] = useState("");
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: 500, easing: Easing.linear }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = words[indexRef.current % words.length] ?? "";
      if (!deletingRef.current) {
        charRef.current += 1;
        setText(current.slice(0, charRef.current));
        if (charRef.current >= current.length) {
          deletingRef.current = true;
          timeout = setTimeout(tick, 1400);
          return;
        }
        timeout = setTimeout(tick, 80);
      } else {
        charRef.current -= 1;
        setText(current.slice(0, Math.max(charRef.current, 0)));
        if (charRef.current <= 0) {
          deletingRef.current = false;
          indexRef.current += 1;
          timeout = setTimeout(tick, 250);
          return;
        }
        timeout = setTimeout(tick, 40);
      }
    };

    timeout = setTimeout(tick, 400);
    return () => clearTimeout(timeout);
  }, [words]);

  const cursorStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={style}>{text}</Text>
      <Animated.View
        style={[
          {
            width: 10,
            height: (style?.fontSize ?? 18) * 1.05,
            marginLeft: 4,
            backgroundColor: cursorColor ?? colors.pink,
          },
          cursorStyle,
        ]}
      />
    </View>
  );
}
