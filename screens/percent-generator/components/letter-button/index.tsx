import { Percent } from "@/types/percent";
import { Audio } from "expo-av";
import React, { memo, useCallback, useRef } from "react";
import { Animated, Text, TouchableWithoutFeedback } from "react-native";

interface LetterButtonProps {
  codeKey: keyof Percent.Codes;
  value: number;
  isActive: boolean;
  onPress: (key: keyof Percent.Codes) => void;
}

const LetterButtonComponent = ({
  codeKey,
  value,
  isActive,
  onPress,
}: LetterButtonProps) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const popSound = useCallback(async () => {
    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/pop.mp3"),
        { volume: 0.5 }
      );
      soundRef.current = sound;
    }
  }, []);

  const playSound = useCallback(async () => {
    await popSound();
    await soundRef.current?.replayAsync();
  }, [popSound]);

  const handlePressIn = () => {
    playSound();
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      speed: 25,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 20,
      bounciness: 15, // more bounce when releasing
      useNativeDriver: true,
    }).start();
  };

  const handlePress = useCallback(() => {
    onPress(codeKey);
  }, [onPress, codeKey]);

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim.interpolate({
            inputRange: [0.9, 1],
            outputRange: [0.8, 1],
          }),
        }}
        className={`w-[18%] p-2.5 mb-2 items-center rounded-xl border shadow-sm ${
          isActive ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-gray-50"
        }`}
      >
        <Text
          className={`font-semibold text-sm ${
            isActive ? "text-rose-700" : "text-gray-700"
          }`}
        >
          {codeKey.toUpperCase()}
        </Text>
        <Text
          className={`text-xs ${isActive ? "text-rose-600" : "text-gray-500"}`}
        >
          {value}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

LetterButtonComponent.displayName = "LetterButton";

export const LetterButton = memo(
  LetterButtonComponent,
  (prev, next) => prev.value === next.value && prev.isActive === next.isActive
);
