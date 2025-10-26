import { useSettingsStore } from "@/stores/settingsStore";
import { useAuth } from "@/utils/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function SecureScreen() {
  const { checkPassword, authenticate } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { biometricsEnabled } = useSettingsStore();

  const handleUnlock = async () => {
    const success = await checkPassword(password);
    if (!success) {
      setPassword("");
      return;
    }

    router.replace("/dashboard");
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
      <View className="bg-white rounded-3xl p-8 pb-12 w-full shadow-lg items-center">
        {/* Top lock icon */}
        <View className="bg-blue-100 rounded-full p-5 mb-4">
          <Ionicons name="lock-closed-outline" size={48} color="#2563eb" />
        </View>

        <Text className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          Kalihim Secure Access
        </Text>
        <Text className="text-gray-500 text-center mb-6 px-4">
          Enter your password or use biometrics to unlock your dashboard
        </Text>

        {/* Password Input */}
        <View className="relative w-full mb-6">
          <TextInput
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            className="border border-gray-200 rounded-xl p-4 text-center text-lg text-gray-800 w-full"
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
              Unlock
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Biometric Unlock Button */}
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
            <Text className="text-gray-900 font-semibold text-lg">
              Unlock with Biometrics
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
}
