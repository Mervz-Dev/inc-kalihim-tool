import { useSettingsStore } from "@/stores/settingsStore";
import { useAuth } from "@/utils/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SecureScreen() {
  const { checkPassword, authenticate } = useAuth();
  const { biometricsEnabled } = useSettingsStore();

  // 🧠 get params (for flexible use)
  const { title, description, type } = useLocalSearchParams<{
    title?: string;
    description?: string;
    type?: string;
  }>();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUnlock = async () => {
    const success = await checkPassword(password);
    if (!success) {
      setPassword("");
      return;
    }

    // ✅ if has callback route, go there
    const pendingAction = globalThis.__authCallback;
    if (pendingAction) {
      const action = pendingAction;
      delete globalThis.__authCallback;
      action(); // call it
      router.back();
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f3f4f6",
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="bg-white rounded-3xl p-8 pb-12 w-full shadow-lg items-center relative">
        {/* Back button if opened for callback */}
        {type && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-5 top-5 bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="arrow-back-outline" size={22} color="#374151" />
          </TouchableOpacity>
        )}

        {/* Lock icon */}
        <View className="bg-blue-100 rounded-full p-5 mb-4">
          <Ionicons name="lock-closed-outline" size={48} color="#2563eb" />
        </View>

        <Text className="text-2xl font-jakarta-extrabold text-gray-900 mb-2 text-center">
          {title || "Kalihim Secure Access"}
        </Text>

        <Text className="text-gray-500 font-jakarta-regular text-center mb-6 px-4">
          {description ||
            "Enter your password or use biometrics to unlock your dashboard."}
        </Text>

        {/* Password Input */}
        <View className="relative w-full mb-6">
          <TextInput
            autoCapitalize="none"
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            className="border border-gray-200 rounded-xl p-4 text-center text-lg font-jakarta-regular text-gray-800 w-full"
            placeholderClassName="font-jakarta-regular"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#9ca3af"
            />
          </TouchableOpacity>
        </View>

        {/* Unlock Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUnlock}
          className="w-full mb-4"
        >
          <LinearGradient
            colors={["#2563eb", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text className="jakarta-semibold text-[18px] text-white">
              {type === "action" ? "Confirm Action" : "Unlock"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Biometric Unlock */}
        {biometricsEnabled && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={authenticate}
            className="flex-row items-center justify-center bg-gray-100 rounded-xl px-6 py-4 w-full"
          >
            <Ionicons
              name="finger-print-outline"
              size={24}
              color="#10b981"
              className="mr-3"
            />
            <Text className="text-gray-900 font-jakarta-semibold text-lg">
              Unlock with Biometrics
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
