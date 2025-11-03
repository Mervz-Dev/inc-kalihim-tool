import { AnimatedModal } from "@/components/animated-modal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ExportPromptModalProps = {
  visible: boolean;
  onClose: () => void;
  onExport: () => void;
};

export function ExportPromptModal({
  visible,
  onClose,
  onExport,
}: ExportPromptModalProps) {
  return (
    <AnimatedModal visible={visible} onClose={onClose}>
      <View className="bg-white rounded-3xl w-full max-w-md p-6 shadow-lg">
        {/* Header */}
        <View className="items-center mb-4">
          <View className="bg-green-100 rounded-full p-4 mb-2">
            <Ionicons name="cloud-download-outline" size={36} color="#16a34a" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">Export Data</Text>
        </View>

        {/* Description */}
        <Text className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
          Export all user records (including purok, grupo, and gender) into a
          Zipped Excel (.zip) file.
        </Text>

        {/* Export Button */}
        <TouchableOpacity
          onPress={onExport}
          activeOpacity={0.85}
          className="mb-3"
        >
          <LinearGradient
            colors={["#22c55e", "#16a34a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text className="text-white font-semibold text-base">
              Generate Export File
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.85}
          className="mb-1"
        >
          <View className="bg-gray-100 py-3 rounded-2xl items-center shadow-sm">
            <Text className="text-gray-700 font-medium text-base">Cancel</Text>
          </View>
        </TouchableOpacity>
      </View>
    </AnimatedModal>
  );
}
