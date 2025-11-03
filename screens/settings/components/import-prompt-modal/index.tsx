// components/settings/ImportPromptModal.tsx
import { AnimatedModal } from "@/components/animated-modal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ImportPromptModalProps = {
  visible: boolean;
  onClose: () => void;
  onImport: () => void;
};

export function ImportPromptModal({
  visible,
  onClose,
  onImport,
}: ImportPromptModalProps) {
  return (
    <AnimatedModal visible={visible} onClose={onClose}>
      <View className="bg-white rounded-3xl w-full max-w-md p-4 shadow-lg">
        {/* Header */}
        <View className="items-center mb-4">
          <View className="bg-blue-100 rounded-full p-4 mb-2">
            <Ionicons name="cloud-upload-outline" size={36} color="#2563eb" />
          </View>
          <Text className="text-2xl font-jakarta-bold text-gray-900">
            Import Purok Names
          </Text>
        </View>

        {/* Description */}
        <Text className="text-gray-600 text-sm text-center mb-6">
          Select an Excel or CSV file from your device to import Purok names
          into the app.
        </Text>

        {/* Expected Columns */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
          <Text className="text-gray-700 font-jakarta-semibold mb-3 text-center">
            Expected Excel Columns
          </Text>

          <View className="flex-row justify-between border-b border-gray-300 pb-2 mb-2">
            {["fullname", "purok", "grupo", "gender"].map((col) => (
              <Text
                key={col}
                className="text-gray-500 font-jakarta-medium w-1/4 text-center"
              >
                {col}
              </Text>
            ))}
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-sm w-1/4 text-center italic">
              Juan
            </Text>
            <Text className="text-gray-400 text-sm w-1/4 text-center italic">
              4
            </Text>
            <Text className="text-gray-400 text-sm w-1/4 text-center italic">
              1
            </Text>
            <Text className="text-gray-400 text-sm w-1/4 text-center italic">
              Male
            </Text>
          </View>

          <Text className="text-gray-400 text-xs mt-3 text-center italic">
            Columns must match exactly for import to work correctly.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={onImport}
          activeOpacity={0.85}
          className="mb-3"
        >
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text className="text-white font-jakarta-semibold text-base">
              Select File
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.85}
          className="mb-1"
        >
          <View className="bg-gray-100 py-3 rounded-2xl items-center shadow-sm">
            <Text className="text-gray-700 font-jakarta-medium text-base">
              Cancel
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </AnimatedModal>
  );
}
