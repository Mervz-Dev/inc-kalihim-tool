import { ActionButton } from "@/components/action-button";
import { APP_PASSWORD_KEY } from "@/constants/encryption";
import { generatePasswordFromKey } from "@/utils/generate";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as SecureStore from "expo-secure-store";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const PassGetterButton = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  const [timestamp, setTimestamp] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handlePress = () => bottomSheetRef.current?.present();

  const handleGetPassword = async () => {
    Keyboard.dismiss();
    bottomSheetRef?.current?.snapToIndex(0);
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

  // Reset states when bottom sheet is closed
  const handleSheetDismiss = () => {
    setTimestamp("");
    setPassword(null);
    setShowPassword(false);
  };

  return (
    <>
      <ActionButton
        colors={["#EF4444", "#DC2626"]}
        icon="key-outline"
        iconPosition="left"
        label="File Pass"
        onPress={handlePress}
        textColor="white"
        textStyle={{ fontSize: 14, fontFamily: "Jakarta-SemiBold" }}
        style={{
          flex: 1,
          borderRadius: 9999, // fully rounded
          minHeight: 45, // adjust as needed
        }}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={["75%"]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enablePanDownToClose
        onDismiss={handleSheetDismiss}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40 }}
        >
          <View className="flex-1">
            {/* Title */}
            <View>
              {/* Header row */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-2xl font-jakarta-bold text-gray-900">
                  File Password Getter
                </Text>

                <TouchableOpacity
                  onPress={() => bottomSheetRef?.current?.close()}
                  className="p-2 rounded-full bg-gray-100"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Info box */}
              <View className="flex-row items-start bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2 mt-2">
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#3B82F6"
                  className="mr-3 mt-1"
                />
                <Text className="text-gray-700 font-jakarta-regular  text-sm leading-relaxed flex-1">
                  You can only retrieve the password for files generated within
                  this app.
                </Text>
              </View>
            </View>

            {/* Input Card */}
            <View className="bg-white rounded-2xl shadow-lg p-2 mb-4">
              <Text className="text-gray-700 font-jakarta-semibold mb-3 text-base">
                Enter Timestamp
              </Text>
              <BottomSheetTextInput
                value={timestamp}
                onBlur={() => bottomSheetRef?.current?.snapToIndex(0)}
                onChangeText={setTimestamp}
                placeholder="e.g. 1762046434524"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 bg-gray-50 shadow-sm"
              />

              <ActionButton
                colors={["#EF4444", "#F87171"]}
                label="Get Password"
                onPress={handleGetPassword}
                icon="key-outline"
                iconPosition="left"
                textColor="white"
                textClassName="text-white font-jakarta-semibold text-base"
                className="mt-5 shadow-md"
                style={{
                  borderRadius: 999,
                }}
              />
            </View>

            {/* Password Output */}
            {password && (
              <View className="bg-white rounded-2xl shadow-lg p-2 mb-6">
                <Text className="text-gray-700 font-jakarta-semibold mb-3 text-base">
                  Password
                </Text>
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
                  <TextInput
                    value={password}
                    editable={false}
                    secureTextEntry={!showPassword}
                    className="flex-1 text-gray-900 font-jetbrains-regular text-base"
                    placeholderClassName="font-jetbrains-regular"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-1 ml-3"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCopyPassword}
                    className="p-1 ml-3"
                  >
                    <Ionicons name="copy-outline" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Warning Card */}
            <View className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#B45309"
                />
                <Text className="text-yellow-900 font-jakarta-semibold ml-2 text-base">
                  Warning
                </Text>
              </View>
              <Text className="text-yellow-900 font-jakarta-regular text-sm">
                Do not share this password with anyone. Keep it secure to
                protect your files.
              </Text>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
