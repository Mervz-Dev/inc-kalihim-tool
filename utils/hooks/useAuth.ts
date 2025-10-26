import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import Toast from "react-native-toast-message";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  const checkIfPasswordExists = async () => {
    const stored = await SecureStore.getItemAsync("app_password");
    setHasPassword(!!stored);
    return !!stored;
  };

  // Save a local password securely
  const setPassword = async (password: string) => {
    await SecureStore.setItemAsync("app_password", password, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    setHasPassword(true);
    Toast.show({
      type: "success",
      text1: "Password saved",
      visibilityTime: 1500,
    });
  };

  // Check password from SecureStore
  const checkPassword = async (password: string) => {
    const stored = await SecureStore.getItemAsync("app_password");
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
  };

  // Biometric + fallback authentication
  const authenticate = async () => {
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
        text1: "No biometrics or device password enrolled",
        visibilityTime: 1500,
      });
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock with Face ID / Touch ID",
      fallbackLabel: "Use Device PIN",
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsAuthenticated(true);
      router.replace("/dashboard");
      return true;
    }

    Toast.show({
      type: "error",
      text1: "Authentication failed",
      visibilityTime: 1500,
    });

    return false;
  };

  const logout = () => setIsAuthenticated(false);

  return {
    isAuthenticated,
    hasPassword,
    authenticate,
    setPassword,
    checkPassword,
    logout,
    checkIfPasswordExists,
  };
}
