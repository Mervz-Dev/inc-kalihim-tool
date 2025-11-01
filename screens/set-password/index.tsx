import { useAuth } from "@/utils/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

  useEffect(() => {
    const checkStoredPassword = async () => {
      const stored = await checkIfPasswordExists();
      setHasPassword(stored);
    };
    checkStoredPassword();
  }, []);

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all required fields",
        visibilityTime: 2000,
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
        visibilityTime: 2000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "New passwords do not match",
        visibilityTime: 2000,
      });
      return;
    }

    if (hasPassword) {
      if (!oldPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter your current password",
          visibilityTime: 2000,
        });
        return;
      }

      const isOldCorrect = await checkPassword(oldPassword);
      if (!isOldCorrect) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Current password is incorrect",
          visibilityTime: 2000,
        });
        return;
      }
    }

    try {
      await setPassword(newPassword);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: hasPassword ? "Password updated" : "Password set",
        visibilityTime: 2000,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasPassword(true);

      router.replace("/auth-screen");
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save password",
        visibilityTime: 2000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 50,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Ionicons name="lock-closed-outline" size={40} color="#2563eb" />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#111827",
              marginTop: 20,
            }}
          >
            {hasPassword ? "Update Password" : "Set App Password"}
          </Text>
          <Text
            style={{
              color: "#6b7280",
              textAlign: "center",
              marginTop: 8,
              paddingHorizontal: 10,
            }}
          >
            {hasPassword
              ? "Enter your current password and choose a new one."
              : "Secure your data locally with a password."}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {/* Current password */}
          {hasPassword && (
            <View style={{ position: "relative", marginBottom: 16 }}>
              <TextInput
                autoCapitalize="none"
                placeholder="Current password"
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 16,
                  padding: 16,
                  color: "#111827",
                }}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowOld((prev) => !prev)}
                style={{ position: "absolute", right: 16, top: "35%" }}
              >
                <Ionicons
                  name={showOld ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* New password */}
          <View style={{ position: "relative", marginBottom: 16 }}>
            <TextInput
              autoCapitalize="none"
              placeholder="New password"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 16,
                padding: 16,
                color: "#111827",
              }}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => setShowNew((prev) => !prev)}
              style={{ position: "absolute", right: 16, top: "35%" }}
            >
              <Ionicons
                name={showNew ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm password */}
          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              autoCapitalize="none"
              placeholder="Confirm new password"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 16,
                padding: 16,
                color: "#111827",
              }}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((prev) => !prev)}
              style={{ position: "absolute", right: 16, top: "35%" }}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={handleSave}>
            <LinearGradient
              colors={["#2563eb", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
                {hasPassword ? "Update Password" : "Set Password"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 12,
            marginTop: 20,
          }}
        >
          Your password is stored securely on this device and never shared
          online.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
