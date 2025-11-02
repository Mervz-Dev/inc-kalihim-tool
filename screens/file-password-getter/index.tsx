import { generatePasswordFromKey } from "@/utils/generate";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const APP_PASSWORD_KEY = "app_password";

export default function FilePasswordGetter() {
  const [timestamp, setTimestamp] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleGetPassword = async () => {
    Keyboard.dismiss();
    if (!timestamp) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a timestamp.",
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync(APP_PASSWORD_KEY);
      const key = `${stored || "inc"}${timestamp}`;
      const generated = generatePasswordFromKey(key);
      setPassword(generated);

      Toast.show({
        type: "success",
        text1: "Password Ready",
        text2: "Your password has been generated.",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Password generation failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to get password.",
        visibilityTime: 2000,
      });
    }
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    Toast.show({
      type: "success",
      text1: "Copied",
      text2: "Password copied to clipboard.",
      visibilityTime: 2000,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-5">
      <View className="mt-10">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          File Password Getter
        </Text>

        <View className="bg-white rounded-xl shadow-md p-4 mb-4">
          <Text className="text-gray-700 font-medium mb-2">
            Enter Timestamp
          </Text>
          <TextInput
            value={timestamp}
            onChangeText={setTimestamp}
            placeholder="e.g. 1762046434524"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 shadow-sm"
          />

          <TouchableOpacity
            onPress={handleGetPassword}
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 bg-blue-500 rounded-xl py-3 mt-4 shadow-md"
          >
            <Ionicons name="key-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-base">
              Get Password
            </Text>
          </TouchableOpacity>
        </View>

        {password && (
          <View className="bg-white rounded-xl shadow-md p-4">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <TextInput
                value={password}
                editable={false}
                secureTextEntry={!showPassword}
                className="flex-1 text-gray-900 font-semibold text-base"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1 ml-2"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#2563EB"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCopyPassword}
                className="p-1 ml-2"
              >
                <Ionicons name="copy-outline" size={22} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Toast />
    </SafeAreaView>
  );
}
