import { AnimatedModal } from "@/components/animated-modal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type HeaderButton = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  onPress: () => void;
};

type HeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  buttons?: HeaderButton[];
  confirmBeforeBack?: boolean;
  confirmMessage?: string;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  buttons = [],
  confirmBeforeBack = false,
  confirmMessage = "Going back will discard the changes you’ve made.",
}) => {
  const titleSize = subtitle ? "text-lg" : "text-2xl";

  const [showConfirm, setShowConfirm] = useState(false);

  // Reanimated values
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: contentOpacity.value,
  }));

  const openModal = useCallback(() => {
    setShowConfirm(true);
    overlayOpacity.value = withTiming(1, { duration: 180 });
    scale.value = withSpring(1, { damping: 12 });
    contentOpacity.value = withTiming(1, { duration: 150 });
  }, []);

  const closeModal = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 100 });
    scale.value = withTiming(0.9, { duration: 100 });
    contentOpacity.value = withTiming(0, { duration: 100 }, (finished) => {
      if (finished) {
        runOnJS(setShowConfirm)(false);
      }
    });
  }, []);

  const handleBackPress = useCallback(() => {
    if (confirmBeforeBack) {
      openModal();
      return true;
    } else {
      router.back();
      return true;
    }
  }, [confirmBeforeBack, openModal]);

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => sub.remove();
  }, [handleBackPress]);

  const handleConfirm = () => {
    closeModal();
    router.back();
  };

  return (
    <>
      <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-sm border border-gray-100">
        {/* Left Section — Back + Title */}
        <View className="flex-row items-center">
          {showBack && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBackPress}
              className="p-2 rounded-full bg-gray-100 mr-3"
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>
          )}

          <View>
            <Text
              className={`text-gray-900 font-semibold leading-tight ${titleSize}`}
            >
              {title}
            </Text>
            {subtitle && (
              <Text className="text-gray-400 text-sm font-medium">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right Section — Dynamic buttons */}
        <View className="flex-row items-center gap-2">
          {buttons.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={btn.onPress}
              className={`p-2.5 rounded-full border ${
                btn.bgColor || "bg-gray-50"
              } ${btn.borderColor || "border-gray-200"}`}
            >
              <Ionicons
                name={btn.icon}
                size={20}
                color={btn.color || "#374151"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Confirmation Modal */}
      <AnimatedModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
      >
        {/* Header Icon */}
        <View className="items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-yellow-100 items-center justify-center mb-2">
            <Ionicons name="alert-circle-outline" size={26} color="#ca8a04" />
          </View>
          <Text className="text-lg font-semibold text-gray-900">
            Are you sure?
          </Text>
        </View>

        {/* Message */}
        <Text className="text-gray-600 text-sm text-center leading-relaxed mb-6">
          {confirmMessage}
        </Text>

        {/* Buttons */}
        <View className="flex-row justify-end gap-3">
          <TouchableOpacity
            onPress={closeModal}
            activeOpacity={0.8}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white"
          >
            <Text className="text-gray-700 font-medium text-center">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 shadow-sm"
          >
            <Text className="text-white font-medium text-center">Leave</Text>
          </TouchableOpacity>
        </View>
      </AnimatedModal>
    </>
  );
};
