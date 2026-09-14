import { SCAN_CAPTURE_OPTIONS } from "@/constants/scan-capture";
import { useSettingsStore } from "@/stores/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { RefObject, useMemo } from "react";
import { Platform, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScanSettingsSheetProps {
  sheetRef: RefObject<BottomSheetModal | null>;
}

/**
 * Quick access to the scan options from the R1-04 header, so the Kalihim can
 * switch capture source or turn the review off without leaving the card. The
 * same values live under Settings → Scan Capture.
 */
export const ScanSettingsSheet = ({ sheetRef }: ScanSettingsSheetProps) => {
  const { bottom } = useSafeAreaInsets();
  const scanCapture = useSettingsStore((s) => s.scanCapture);
  const setScanCapture = useSettingsStore((s) => s.setScanCapture);
  const scanAutoApply = useSettingsStore((s) => s.scanAutoApply);
  const setScanAutoApply = useSettingsStore((s) => s.setScanAutoApply);
  const snapPoints = useMemo(() => ["70%"], []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableOverDrag={false}
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
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-jakarta-bold text-gray-900">
            Scan options
          </Text>
          <TouchableOpacity
            onPress={() => sheetRef.current?.dismiss()}
            activeOpacity={0.8}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 font-jakarta-semibold text-sm mb-2">
          Capture with
        </Text>
        <View className="bg-gray-50 rounded-2xl border border-gray-100 p-1 mb-4">
          {SCAN_CAPTURE_OPTIONS.map((option, i) => {
            const selected = option.mode === scanCapture;
            return (
              <TouchableOpacity
                key={option.mode}
                activeOpacity={0.8}
                onPress={() => setScanCapture(option.mode)}
                className={`flex-row items-center justify-between py-3 px-3 ${
                  i < SCAN_CAPTURE_OPTIONS.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selected ? "#2563eb" : "#6b7280"}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 font-jakarta-medium text-base">
                      {option.label}
                    </Text>
                    <Text className="text-gray-500 font-jakarta-regular text-xs">
                      {option.hint}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={selected ? "#2563eb" : "#9CA3AF"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="bg-gray-50 rounded-2xl border border-gray-100 pl-3 pr-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 mr-4">
            <Ionicons name="flash-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-gray-900 font-jakarta-medium text-base">
                Apply without review
              </Text>
              <Text className="text-gray-500 font-jakarta-regular text-xs">
                Counts go on the card right after the scan. Undo on the card
                reverses the whole scan.
              </Text>
            </View>
          </View>
          <Switch
            value={scanAutoApply}
            onValueChange={setScanAutoApply}
            trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
            thumbColor={
              Platform.OS === "ios"
                ? "#f3f4f6"
                : scanAutoApply
                ? "#2563eb"
                : "#f3f4f6"
            }
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
