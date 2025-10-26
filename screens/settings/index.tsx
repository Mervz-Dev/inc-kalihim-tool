import { useSettingsStore } from "@/stores/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const {
    distrito,
    lokal,
    lokalCode,
    distritoCode,
    setField,
    reset,
    setBiometrics,
    biometricsEnabled,
  } = useSettingsStore();

  const toggleBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setBiometrics(false);
      Toast.show({
        type: "error",
        text1: "Unavailable",
        text2: "Biometric authentication not available on this device",
        visibilityTime: 2000,
      });
      return;
    }

    setBiometrics(!biometricsEnabled);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: `Biometrics ${!biometricsEnabled ? "enabled" : "disabled"}`,
      visibilityTime: 1500,
    });
  };

  const handleReset = () => {
    reset();
    Toast.show({
      type: "success",
      text1: "Settings Reset",
      text2: "All settings have been cleared",
      visibilityTime: 1500,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5 bg-white shadow-md">
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

      <ScrollView
        className="flex-1 p-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Local Information */}
        <Text className="text-gray-500 font-semibold text-sm mb-3 mt-2">
          Local Information
        </Text>
        <View className="bg-white rounded-2xl p-4 shadow-md space-y-4">
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
            <View key={i} className="mb-2">
              <Text className="text-gray-700 font-medium mb-1">{label}</Text>
              <TextInput
                value={value}
                onChangeText={(text) => setField(field, text)}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 shadow-sm"
              />
            </View>
          ))}
        </View>

        {/* Section: Account */}
        <Text className="text-gray-500 font-semibold text-sm mb-3 mt-4">
          Security
        </Text>
        <View className="bg-white rounded-2xl py-4 px-2 shadow-md space-y-4">
          {/* Update Password Row */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/set-password")}
            className="flex-row items-center justify-between bg-white rounded-3xl p-4 shadow-sm"
          >
            <View className="flex-row items-center space-x-4 gap-2">
              <View className="bg-blue-100 p-2 rounded-full">
                <Ionicons name="key-outline" size={20} color="#2563eb" />
              </View>
              <Text className="text-gray-900 font-semibold text-lg">
                Update Password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {/* Biometrics Toggle */}
          <View className="flex-row items-center justify-between bg-white rounded-3xl p-4 shadow-sm">
            <View className="flex-row items-center space-x-4 gap-2">
              <View className="bg-green-100 p-2 rounded-full">
                <Ionicons
                  name="finger-print-outline"
                  size={20}
                  color="#10b981"
                />
              </View>
              <Text className="text-gray-900 font-semibold text-lg">
                Enable Biometrics / Face ID
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={biometricsEnabled ? "#2563eb" : "#f3f4f6"}
            />
          </View>
        </View>

        {/* Section: Reset */}
        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.85}
          className="pt-4"
        >
          <View className="bg-red-500 py-4 rounded-2xl shadow-lg items-center">
            <Text className="text-white font-semibold text-lg tracking-wide">
              Reset Settings
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast */}
      <Toast />
    </SafeAreaView>
  );
}
