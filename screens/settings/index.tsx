import { useSettingsStore } from "@/stores/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { distrito, lokal, lokalCode, distritoCode, setField, reset } =
    useSettingsStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5 bg-white shadow-sm">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-bold">Settings</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-500 text-sm mb-4">
            Configure your local and district information below.
          </Text>

          {(
            [
              { label: "Distrito", value: distrito, field: "distrito" },
              { label: "Lokal", value: lokal, field: "lokal" },
              { label: "Local Code", value: lokalCode, field: "lokalCode" },
              {
                label: "District Code",
                value: distritoCode,
                field: "distritoCode",
              },
            ] as const
          ).map(({ label, value, field }, i) => (
            <View key={i} className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">{label}</Text>
              <TextInput
                value={value}
                onChangeText={(text) => setField(field, text)} // ✅ no TS error now
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-gray-50"
              />
            </View>
          ))}
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          onPress={reset}
          className="bg-red-500 py-4 rounded-full mt-8 shadow-md"
          activeOpacity={0.85}
        >
          <Text className="text-white text-center font-semibold text-lg tracking-wide">
            Reset Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
