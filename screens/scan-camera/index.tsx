import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { completeCapture } from "./capture-bridge";

/**
 * One-tap camera for attendance sheets.
 *
 * Apple's camera and scanner both ask "Retake / Use photo" after every
 * capture. This screen does not: the shutter (or the countdown, when Auto is
 * on) takes the photo and hands it straight to the scan. A frame shows where
 * the sheet should sit so it fills the picture.
 */

/**
 * Auto mode's count: "Ready", then 3, 2, 1, then the picture. Step 0 is the
 * "Ready" beat; step n shows AUTO_STEPS - n + 1.
 */
const AUTO_STEPS = 3;

export default function ScanCameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [auto, setAuto] = useState(true);
  const [torch, setTorch] = useState(false);
  /** Current beat of the auto count (0 = "Ready"), or null when not counting. */
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);
  const doneRef = useRef(false);

  /** Reports the outcome exactly once. */
  const settle = useCallback((uri: string | null) => {
    if (doneRef.current) return false;
    doneRef.current = true;
    completeCapture(uri);
    return true;
  }, []);

  const finish = useCallback(
    (uri: string | null) => {
      if (settle(uri)) router.back();
    },
    [settle]
  );

  // Closed some other way (hardware back, navigation reset): the scan still
  // gets its answer, without popping a second screen.
  useEffect(() => () => void settle(null), [settle]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const capture = useCallback(async () => {
    if (capturing || !ready || doneRef.current) return;
    setCapturing(true);
    setCountdown(null);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 1,
        exif: false,
      });
      finish(photo?.uri ?? null);
    } catch (error) {
      console.log("scan camera capture error:", error);
      setCapturing(false);
    }
  }, [capturing, finish, ready]);

  // Auto mode: once the camera is up, count "Ready, 1, 2, 3" and shoot.
  // Turning Auto off stops the count.
  useEffect(() => {
    if (!auto || !ready || capturing) {
      setCountdown(null);
      return;
    }
    setCountdown(0);
  }, [auto, ready, capturing]);

  useEffect(() => {
    if (countdown === null || capturing) return;
    if (countdown > AUTO_STEPS) {
      void capture();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown + 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturing, capture]);

  // Manual: the shutter takes the picture at once. In Auto it just skips
  // the rest of the count.
  const onShutter = useCallback(() => {
    if (!ready || capturing) return;
    void capture();
  }, [capture, capturing, ready]);

  const countLabel =
    countdown === null
      ? null
      : countdown === 0
      ? "Ready"
      : String(AUTO_STEPS - countdown + 1);

  if (permission && !permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-8">
        <Ionicons name="camera-outline" size={48} color="#9ca3af" />
        <Text className="text-white font-jakarta-semibold text-lg mt-4 text-center">
          Camera access is needed to scan a sheet
        </Text>
        <Text className="text-gray-400 font-jakarta-regular text-sm mt-2 text-center">
          Allow the camera for this app in Settings, then try again.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          activeOpacity={0.8}
          className="mt-6 px-5 py-3 rounded-full bg-blue-600"
        >
          <Text className="text-white font-jakarta-semibold">Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => finish(null)}
          activeOpacity={0.8}
          className="mt-3 px-5 py-3"
        >
          <Text className="text-gray-300 font-jakarta-medium">Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {permission?.granted && (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
          // expo-camera's "on" means focus once and lock; the default keeps
          // refocusing as the phone moves over the sheet, which is what we
          // want for handwriting.
          autofocus="off"
          // Full-resolution stills on iOS; other sizes are ratio presets.
          pictureSize={Platform.OS === "ios" ? "Photo" : undefined}
          enableTorch={torch}
          onCameraReady={() => setReady(true)}
        />
      )}

      {/* Overlay: top bar, frame guide filling the middle, hint, shutter */}
      <View
        pointerEvents="box-none"
        className="absolute inset-0"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center justify-between px-4">
          <TouchableOpacity
            onPress={() => finish(null)}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setTorch((value) => !value)}
              activeOpacity={0.8}
              accessibilityLabel={torch ? "Turn torch off" : "Turn torch on"}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                torch ? "bg-amber-400" : "bg-black/50"
              }`}
            >
              <Ionicons
                name={torch ? "flashlight" : "flashlight-outline"}
                size={20}
                color={torch ? "#1f2937" : "white"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAuto((value) => !value)}
              activeOpacity={0.8}
              className={`flex-row items-center px-4 h-11 rounded-full ${
                auto ? "bg-amber-400" : "bg-black/50"
              }`}
            >
              <Ionicons
                name="timer-outline"
                size={18}
                color={auto ? "#1f2937" : "white"}
              />
              <Text
                className={`ml-1.5 font-jakarta-semibold ${
                  auto ? "text-gray-900" : "text-white"
                }`}
              >
                Auto {auto ? "on" : "off"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* The frame takes most of the room between the bar and the shutter. */}
        <View
          pointerEvents="none"
          className="flex-1 mx-7 my-12 rounded-2xl border-2 border-white/80 items-center justify-center"
        >
          {countLabel !== null && (
            <View
              className={`rounded-full bg-black/50 items-center justify-center ${
                countdown === 0 ? "px-6 h-24" : "w-24 h-24"
              }`}
            >
              <Text
                className={`text-white font-jakarta-bold ${
                  countdown === 0 ? "text-3xl" : "text-5xl"
                }`}
              >
                {countLabel}
              </Text>
            </View>
          )}
        </View>

        <View pointerEvents="none" className="items-center px-6">
          <Text className="text-white font-jakarta-semibold text-base text-center">
            {countLabel !== null
              ? "Hold steady…"
              : !ready
              ? "Starting camera…"
              : auto
              ? "Fill the frame with the sheet"
              : "Fill the frame, then tap to scan"}
          </Text>
          <Text className="text-gray-300 font-jakarta-regular text-xs mt-0.5 text-center">
            {countLabel !== null
              ? "Tap the shutter to take it now"
              : "Flat, well lit, no shadows"}
          </Text>
        </View>

        <View className="items-center mt-3">
          <TouchableOpacity
            onPress={onShutter}
            disabled={!ready || capturing}
            activeOpacity={0.7}
            className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
          >
            <View
              className={`w-16 h-16 rounded-full ${
                capturing ? "bg-gray-400" : "bg-white"
              }`}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
