import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useMemo, useRef } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/header";
import { ExportPromptModal } from "./components/export-prompt-modal";
import { ImportPromptModal } from "./components/import-prompt-modal";
import { useSettingsScreen } from "./useSettings";

import { ActionButton } from "@/components/action-button";
import { SaveFileView } from "@/components/save-file-view";
import { useAuthAction } from "@/utils/hooks/useAuthAction";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

export default function SettingsScreen() {
  const saveFileBottomSheet = useRef<BottomSheetModal>(null);
  const saveFileSheetPoints = useMemo(() => ["50%"], []);

  const {
    distrito,
    lokal,
    lokalCode,
    distritoCode,
    biometricsEnabled,
    showImportModal,
    setShowImportModal,
    setField,
    toggleBiometrics,
    handleReset,
    handleClearAllData,
    handleImportFile,
    exportUsersToExcel,
    showExportModal,
    setShowExportModal,
    goToPassword,
    exportFileUri,
  } = useSettingsScreen(saveFileBottomSheet);
  const { requireAuth } = useAuthAction();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <Header
        title="Settings"
        showBack
        buttons={[
          {
            icon: "cloud-upload-outline", // upload = import
            color: "#2563eb", // blue tone
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            onPress: () => setShowImportModal(true),
          },
          {
            icon: "cloud-download-outline", // download = export
            color: "#16a34a", // green tone
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            onPress: () => setShowExportModal(true),
          },
        ]}
      />

      <ScrollView
        className="flex-1 pt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Local Info Section */}
        <Text className="text-gray-500 font-jakarta-semibold text-sm mb-2">
          Local Information
        </Text>
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          {(
            [
              { label: "Distrito", value: distrito, field: "distrito" },
              { label: "Lokal", value: lokal, field: "lokal" },
              { label: "Local Code", value: lokalCode, field: "lokalCode" },
              {
                label: "District Code",
                value: distritoCode,
                field: "distritoCode",
              },
            ] as const
          ).map(({ label, value, field }, i) => (
            <View key={i}>
              <Text className="text-gray-700 font-jakarta-medium mb-1">
                {label}
              </Text>
              <TextInput
                value={value}
                onChangeText={(text) => setField(field, text)}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 font-jakarta-regular bg-gray-50 mb-2"
                placeholderClassName="font-jakarta-regular"
              />
            </View>
          ))}
        </View>

        {/* Security Section */}
        <Text className="text-gray-500 font-jakarta-semibold text-sm mb-2 mt-6">
          Security
        </Text>
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToPassword}
            className="flex-row items-center justify-between py-4 px-3 border-b border-gray-100"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="key-outline" size={20} color="#2563eb" />
              <Text className="text-gray-900 font-jakarta-medium text-base">
                Update Password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between py-4 px-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="finger-print-outline" size={20} color="#10b981" />
              <Text className="text-gray-900 font-jakarta-medium text-base">
                Enable Biometrics / Face ID
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={biometricsEnabled ? "#2563eb" : "#f3f4f6"}
            />
          </View>
        </View>

        {/* Maintenance Section */}
        <Text className="text-gray-500 font-jakarta-semibold text-sm mb-2 mt-6">
          Maintenance
        </Text>
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <ActionButton
            colors={["#F87171", "#DC2626"]}
            label="Reset Settings"
            onPress={handleReset}
            icon="refresh-outline"
            iconPosition="left"
            textColor="white"
            textClassName="text-white font-jakarta-semibold text-base"
            className="mb-3 shadow-md"
          />
          <ActionButton
            colors={["#FBBF24", "#D97706"]}
            label="Clear All Data"
            onPress={() =>
              requireAuth({
                description:
                  "For security, please enter your password before deleting all data.",
                type: "action",
                onConfirm: handleClearAllData,
              })
            }
            icon="trash-outline"
            iconPosition="left"
            textColor="white"
            textClassName="text-white font-jakarta-semibold text-base"
            className="shadow-md"
          />
        </View>

        {/* Footer */}
        <View className="items-center mt-8 opacity-60">
          <Text className="text-gray-500 text-sm">
            Version {Constants.expoConfig?.version || "1.0.0"} (
            {Constants.expoConfig?.extra?.buildNumber || "1"})
          </Text>
        </View>
      </ScrollView>

      <ImportPromptModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={() => {
          setShowImportModal(false);
          requireAuth({
            description:
              "For security, enter your password to continue importing.",
            type: "action",
            onConfirm: handleImportFile,
          });
        }}
      />

      <ExportPromptModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={() => {
          setShowExportModal(false);
          requireAuth({
            description:
              "For security, enter your password before generating the exported file.",
            type: "action",
            onConfirm: exportUsersToExcel,
          });
        }}
      />

      <BottomSheetModal
        index={1}
        ref={saveFileBottomSheet}
        snapPoints={saveFileSheetPoints}
        keyboardBehavior="interactive"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView className="flex-1 px-2 pb-6 pt-1">
          <SaveFileView
            fileUri={exportFileUri}
            onClose={() => saveFileBottomSheet.current?.close()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
