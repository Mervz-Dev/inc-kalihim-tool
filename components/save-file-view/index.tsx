import { delay } from "@/utils/delay";
import {
  copyExcelToDownloads,
  getFileNameWithoutExtension,
} from "@/utils/file";
import { useLoading } from "@/utils/hooks/useLoading";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React from "react";
import { ColorValue, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface SaveFileViewProps {
  fileUri?: string | null;
  resultData?: unknown;
  storageKey?: string;
  onClose?: () => void;
  onShareFile?: () => Promise<void> | void;
  onSaveToDevice?: () => Promise<void> | void;
  onSaveToCache?: () => Promise<void> | void;
  renderCenter?: React.ReactNode;
  headerTitle?: string;
  description?: string;
}

export const SaveFileView = ({
  fileUri,
  resultData,
  storageKey,
  onClose,
  onShareFile,
  onSaveToDevice,
  onSaveToCache,
  renderCenter,
  headerTitle = "Save or Share",
  description,
}: SaveFileViewProps) => {
  const { bottom } = useSafeAreaInsets();
  const loader = useLoading();

  const fileName = fileUri
    ? getFileNameWithoutExtension(fileUri)
    : "No file available";

  const handleSaveOnCache = async () => {
    try {
      loader?.show?.("Saving...");
      if (!storageKey || !resultData) {
        await delay(500);
        router.back();
        return;
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(resultData));
      await delay(500);
      router.back();
    } catch (error) {
      console.log("handleSaveOnCache error:", error);
    } finally {
      loader?.hide?.();
    }
  };

  const handleShare = async () => {
    try {
      if ((await Sharing.isAvailableAsync()) && fileUri) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Share Excel File",
          UTI: "com.microsoft.excel.xlsx",
        });

        Toast.show({
          type: "success",
          text1: "File shared successfully",
          swipeable: true,
          visibilityTime: 2000,
          topOffset: 60,
        });

        await handleSaveOnCache();
      } else {
        Toast.show({
          type: "info",
          text1: "Sharing not available",
          text2: "This device cannot share files.",
          position: "bottom",
        });
      }
    } catch (error) {
      console.log("handleShare error:", error);
      Toast.show({
        type: "error",
        text1: "Error sharing file",
        text2: "Something went wrong.",
        position: "bottom",
      });
    }
  };

  const handleLocalSave = async () => {
    try {
      if (fileUri) {
        const savedUri = await copyExcelToDownloads(
          fileUri,
          getFileNameWithoutExtension(fileUri)
        );
        if (savedUri) {
          Toast.show({
            type: "success",
            text1: "File Saved",
            text2: "Your Excel file has been saved.",
            swipeable: true,
            visibilityTime: 2000,
            topOffset: 60,
          });
          await handleSaveOnCache();
        }
      } else {
        Toast.show({
          type: "info",
          text1: "No File Found",
          text2: "Please generate a file before saving.",
        });
      }
    } catch (error) {
      console.log("handleLocalSave error:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Something went wrong while saving the file.",
      });
    }
  };

  const actions = [
    (storageKey || onSaveToCache) && {
      label: "Cache",
      icon: <Feather name="clock" size={18} color="white" />,
      colors: ["#FBBF24", "#D97706"] as [ColorValue, ColorValue],
      onPress: onSaveToCache || handleSaveOnCache,
    },
    {
      label: "Share",
      icon: <Ionicons name="share-outline" size={18} color="white" />,
      colors: ["#60A5FA", "#2563EB"] as [ColorValue, ColorValue],
      onPress: onShareFile || handleShare,
    },
    {
      label: "Save",
      icon: <Feather name="download" size={18} color="white" />,
      colors: ["#34D399", "#059669"] as [ColorValue, ColorValue],
      onPress: onSaveToDevice || handleLocalSave,
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.ReactNode;
    colors: [ColorValue, ColorValue];
    onPress: () => void;
  }[];

  return (
    <View className="flex-1 px-4 pt-2" style={{ marginBottom: bottom + 10 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-900 text-xl font-bold">{headerTitle}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          className="p-2 rounded-full bg-gray-200"
        >
          <Ionicons name="close" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {description ? (
        <Text className="text-gray-600 text-sm mb-3 leading-5">
          {description}
        </Text>
      ) : (
        <Text className="text-gray-600 text-sm mb-4 leading-5">
          Choose how to store or share generated data:
          <Text className="font-semibold text-amber-600"> Cache</Text> for prev
          data reference,{" "}
          <Text className="font-semibold text-blue-600">Share</Text> safely
          within your kalihim mates, or{" "}
          <Text className="font-semibold text-green-600">Save</Text> securely to
          your device.
        </Text>
      )}

      {renderCenter && <View className="mb-4">{renderCenter}</View>}

      {/* 🔹 File Info Card */}
      <LinearGradient
        colors={["#f9fafb", "#f3f4f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#e0f2fe",
            padding: 10,
            borderRadius: 999,
            marginRight: 12,
          }}
        >
          <Ionicons name="document-text-outline" size={20} color="#0284c7" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              color: "#111827",
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {fileName}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>Excel file</Text>
        </View>
      </LinearGradient>

      {/* 🔸 Confidentiality Card */}
      <LinearGradient
        colors={["#fff1f2", "#ffe4e6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderWidth: 1,
          borderColor: "#fecdd3",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            backgroundColor: "#fecdd3",
            padding: 8,
            borderRadius: 999,
            marginRight: 12,
          }}
        >
          <Ionicons name="lock-closed-outline" size={18} color="#b91c1c" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#991b1b",
              fontWeight: "600",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Confidentiality Notice
          </Text>
          <Text style={{ color: "#b91c1c", fontSize: 12, lineHeight: 18 }}>
            This file contains{" "}
            <Text style={{ fontWeight: "600" }}>
              confidential internal data
            </Text>
            . Do not share, upload, or transfer this file to unauthorized
            parties.
          </Text>
        </View>
      </LinearGradient>

      {/* 🔹 Actions */}
      <View
        className="flex-row items-center gap-2 mt-2"
        style={{
          justifyContent:
            actions.length === 2 ? "space-evenly" : "space-between",
        }}
      >
        {actions.map((action) => (
          <ActionButton
            key={action.label}
            label={action.label}
            icon={action.icon}
            colors={action.colors}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const ActionButton = ({
  label,
  icon,
  colors,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  colors: [ColorValue, ColorValue];
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="flex-1 rounded-xl overflow-hidden shadow"
  >
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="py-3 flex-col items-center justify-center"
    >
      {icon}
      <Text className="text-white text-sm mt-1 font-semibold text-center">
        {label}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);
