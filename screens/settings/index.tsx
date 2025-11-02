import { Header } from "@/components/header";
import { clearDatabase } from "@/services/sql-lite/db";
import { useSettingsStore } from "@/stores/settingsStore";
import { delay } from "@/utils/delay";
import { useLoading } from "@/utils/hooks/useLoading";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import {
  Alert,
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

  const db = useSQLiteContext();
  const loader = useLoading();

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

  const handleClearAllData = () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to clear all data (database, cache, and local files)? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, clear all",
          style: "destructive",
          onPress: async () => {
            try {
              loader.show("Clearing...");
              await clearDatabase(db);
              await AsyncStorage.clear();

              const files = await FileSystem.readDirectoryAsync(
                FileSystem.documentDirectory || ""
              );
              for (const file of files) {
                await FileSystem.deleteAsync(
                  FileSystem.documentDirectory + file,
                  { idempotent: true }
                );
              }

              await delay(600);

              Toast.show({
                type: "success",
                text1: "All Data Cleared",
                text2: "Database, cache, and files removed successfully.",
                visibilityTime: 2000,
              });
            } catch (err) {
              console.error("Full clear error:", err);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to clear all data.",
                visibilityTime: 2000,
              });
            } finally {
              loader.hide();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      {/* Header */}
      {/* <View className="flex-row items-center justify-between p-5 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">Settings</Text>
        </View>
      </View> */}

      <Header title={`Settings`} showBack />

      <ScrollView
        className="flex-1 pt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Local Info */}
        <Text className="text-gray-500 font-semibold text-sm mb-2">
          Local Information
        </Text>
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
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
            <View key={i}>
              <Text className="text-gray-700 font-medium mb-1">{label}</Text>
              <TextInput
                value={value}
                onChangeText={(text) => setField(field, text)}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 bg-gray-50 mb-2"
              />
            </View>
          ))}
        </View>

        {/* Section: Security */}
        <Text className="text-gray-500 font-semibold text-sm mb-2 mt-6">
          Security
        </Text>
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/set-password")}
            className="flex-row items-center justify-between py-4 px-3 border-b border-gray-100"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="key-outline" size={20} color="#2563eb" />
              <Text className="text-gray-900 font-medium text-base">
                Update Password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between py-4 px-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="finger-print-outline" size={20} color="#10b981" />
              <Text className="text-gray-900 font-medium text-base">
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
        <Text className="text-gray-500 font-semibold text-sm mb-2 mt-6">
          Maintenance
        </Text>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleReset}
            className="rounded-xl overflow-hidden mb-3 shadow-md"
          >
            <LinearGradient
              colors={["#F87171", "#DC2626"]} // red gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3 px-4 flex-row items-center justify-center"
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color="white"
                className="mr-2"
              />
              <Text className="text-white font-semibold text-base">
                Reset Settings
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleClearAllData}
            className="rounded-xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#FBBF24", "#D97706"]} // amber/orange gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3 px-4 flex-row items-center justify-center"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="white"
                className="mr-2"
              />
              <Text className="text-white font-semibold text-base">
                Clear All Data
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
