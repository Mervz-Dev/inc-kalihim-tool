import { ActionButton } from "@/components/action-button";
import { delay } from "@/utils/delay";
import { useAuth } from "@/utils/hooks/useAuth";
import { useLoading } from "@/utils/hooks/useLoading";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

export default function PasswordScreen() {
  const { setPassword, checkPassword, checkIfPasswordExists } = useAuth();
  const [hasPassword, setHasPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loader = useLoading();

  useEffect(() => {
    const checkStoredPassword = async () => {
      const stored = await checkIfPasswordExists();
      setHasPassword(stored);
    };
    checkStoredPassword();
  }, []);

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all required fields",
      });
    }

    if (newPassword.length < 6) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "New passwords do not match",
      });
    }

    if (hasPassword) {
      if (!oldPassword) {
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter your current password",
        });
      }

      const isOldCorrect = await checkPassword(oldPassword);
      if (!isOldCorrect) {
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: "Current password is incorrect",
        });
      }
    }

    try {
      Keyboard.dismiss();
      loader.show("Please wait...");

      await setPassword(newPassword);
      await delay(1000);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: hasPassword ? "Password updated" : "Password set",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.replace("/auth-screen");
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save password",
      });
    } finally {
      loader.hide();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 20 : 60}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <View className="bg-white p-4 rounded-full shadow-md shadow-black/10 elevation-5">
            <Ionicons name="lock-closed-outline" size={40} color="#2563eb" />
          </View>
          <Text className="jakarta-extrabold text-[22px] text-neutral-900 mt-5">
            {hasPassword ? "Update Password" : "Set App Password"}
          </Text>
          <Text className="text-gray-500 text-center mt-2 px-3 jakarta-regular">
            {hasPassword
              ? "Enter your current password and choose a new one."
              : "Secure your data locally with a password."}
          </Text>
        </View>

        {/* Password Inputs */}
        <View className="bg-white rounded-3xl p-5 shadow-md shadow-black/5 elevation-5">
          {hasPassword && (
            <View className="relative mb-4">
              <TextInput
                autoCapitalize="none"
                placeholder="Current password"
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                className="border border-gray-200 rounded-2xl p-4 text-neutral-900 font-jakarta-regular"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowOld((prev) => !prev)}
                className="absolute right-4 top-[35%]"
              >
                <Ionicons
                  name={showOld ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          )}

          <View className="relative mb-4">
            <TextInput
              autoCapitalize="none"
              placeholder="New password"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              className="border border-gray-200 rounded-2xl p-4 text-neutral-900 font-jakarta-regular"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => setShowNew((prev) => !prev)}
              className="absolute right-4 top-[35%]"
            >
              <Ionicons
                name={showNew ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          <View className="relative mb-6">
            <TextInput
              autoCapitalize="none"
              placeholder="Confirm new password"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="border border-gray-200 rounded-2xl p-4 text-neutral-900 font-jakarta-regular"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((prev) => !prev)}
              className="absolute right-4 top-[35%]"
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <ActionButton
          colors={["#2563eb", "#3b82f6"]}
          label={hasPassword ? "Update Password" : "Set Password"}
          onPress={handleSave}
          textClassName="text-white text-[18px] font-jakarta-semibold"
          style={{
            borderRadius: 999,
            minHeight: 54,
            flex: undefined,
          }}
          className="mt-6"
        />

        {/* Footer */}
        <Text className="text-center text-gray-400 text-[12px] mt-5 jakarta-regular">
          Your password is stored securely on this device and never shared
          online.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}
