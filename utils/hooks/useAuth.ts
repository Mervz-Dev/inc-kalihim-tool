import { APP_PASSWORD_KEY } from "@/constants/encryption";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import Toast from "react-native-toast-message";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  /** 🔍 Check if password exists in SecureStore */
  const checkIfPasswordExists = async () => {
    try {
      const stored = await SecureStore.getItemAsync(APP_PASSWORD_KEY);
      const exists = !!stored;
      setHasPassword(exists);
      return exists;
    } catch (err) {
      console.warn("SecureStore check failed:", err);
      Toast.show({
        type: "error",
        text1: "Unable to check password",
        visibilityTime: 1500,
      });
      return false;
    }
  };

  /** 💾 Save a password securely */
  const setPassword = async (password: string) => {
    try {
      await SecureStore.setItemAsync(APP_PASSWORD_KEY, password, {
        // ✅ safest + most compatible option on iOS and Android
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      setHasPassword(true);
      Toast.show({
        type: "success",
        text1: "Password saved",
        visibilityTime: 1500,
      });
    } catch (err) {
      console.error("SecureStore error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to save password",
        visibilityTime: 1500,
      });
    }
  };

  /** 🔑 Check stored password */
  const checkPassword = async (password: string) => {
    try {
      const stored = await SecureStore.getItemAsync(APP_PASSWORD_KEY);
      if (stored === password) {
        setIsAuthenticated(true);
        return true;
      } else {
        Toast.show({
          type: "error",
          text1: "Incorrect password",
          visibilityTime: 1500,
        });
        return false;
      }
    } catch (err) {
      console.error("SecureStore read error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to check password",
        visibilityTime: 1500,
      });
      return false;
    }
  };

  /** 🧠 Biometric + device authentication */
  const authenticate = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Toast.show({
          type: "error",
          text1: "Device does not support biometrics",
          visibilityTime: 1500,
        });
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Toast.show({
          type: "error",
          text1: "No biometrics or passcode enrolled",
          visibilityTime: 1500,
        });
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock with Face ID / Touch ID",
        fallbackLabel: "Enter Passcode",
        disableDeviceFallback: false,
      }).catch((err) => {
        console.warn("Biometric error:", err);
        return { success: false };
      });

      if (result.success) {
        setIsAuthenticated(true);

        // ✅ Protect router navigation (avoid crash if context not ready)
        try {
          router.replace("/dashboard");
        } catch (err) {
          console.warn("Router navigation failed:", err);
        }

        return true;
      }

      Toast.show({
        type: "error",
        text1: "Authentication failed",
        visibilityTime: 1500,
      });
      return false;
    } catch (err) {
      console.error("Authentication error:", err);
      Toast.show({
        type: "error",
        text1: "Something went wrong during authentication",
        visibilityTime: 1500,
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    hasPassword,
    checkIfPasswordExists,
    setPassword,
    checkPassword,
    authenticate,
    logout,
  };
}
