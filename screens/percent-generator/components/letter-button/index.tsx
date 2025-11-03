import { Percent } from "@/types/percent";
import React, { memo, useCallback, useRef } from "react";
import { Animated, Text, TouchableWithoutFeedback, View } from "react-native";

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
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
      bounciness: 15,
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
        className={`w-[17.5%] h-[44px] p-2.5 mb-2.5 items-center justify-center rounded-xl border shadow-sm ${
          isActive ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-gray-50"
        }`}
      >
        <Text
          className={`font-jakarta-semibold text-sm ${
            isActive ? "text-rose-700" : "text-gray-700"
          }`}
        >
          {codeKey.toUpperCase()}
        </Text>
        {value > 0 && (
          <View
            className={`absolute -top-2 -right-2 h-5 min-w-[20px] px-1.5 rounded-full items-center justify-center shadow-md ${
              isActive ? "bg-rose-500" : "bg-gray-500"
            }`}
          >
            <Text className="text-[10px] mb-1 font-jakarta-semibold text-white">
              {value}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

LetterButtonComponent.displayName = "LetterButton";

export const LetterButton = memo(
  LetterButtonComponent,
  (prev, next) => prev.value === next.value && prev.isActive === next.isActive
);
