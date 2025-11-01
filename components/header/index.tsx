import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  buttons = [],
}) => {
  const titleSize = subtitle ? "text-lg" : "text-2xl";

  return (
    <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-sm border border-gray-100">
      {/* Left Section — Back + Title */}
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
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
  );
};
