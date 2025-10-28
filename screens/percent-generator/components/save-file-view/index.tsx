import { Percent } from "@/types/percent";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PorsyentoFeedback } from "../porsyento-feedback";

interface SaveFileViewProps {
  onClose: () => void;
  onShareFile: () => void;
  onSaveToDevice: () => void;
  onSaveToCache: () => void;
  prevResult?: Percent.ComputedPercent;
  currenResult?: Percent.ComputedPercent;
}

export const SaveFileView = ({
  onClose,
  onShareFile,
  onSaveToDevice,
  onSaveToCache,
  prevResult,
  currenResult,
}: SaveFileViewProps) => {
  const { bottom } = useSafeAreaInsets();

  const prevValue = prevResult?.overAllPercentage ?? null;
  const currentValue = currenResult?.overAllPercentage ?? null;
  const diff =
    prevValue !== null && currentValue !== null
      ? currentValue - prevValue
      : null;

  const diffColor =
    diff === null
      ? "text-gray-500"
      : diff > 0
      ? "text-green-600"
      : diff < 0
      ? "text-red-600"
      : "text-gray-500";

  return (
    <View className="flex-1 px-4 pt-2" style={{ marginBottom: bottom + 10 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-900 text-xl font-bold">Save or Share</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          className="p-2 rounded-full bg-gray-200"
        >
          <Ionicons name="close" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Ways to Save Section */}
      <Text className="text-gray-600 text-sm mb-4 leading-5">
        Choose how to store or share generated data:
        <Text className="font-semibold text-amber-600"> Cache</Text> for prev
        data reference,{" "}
        <Text className="font-semibold text-blue-600">Share</Text> safely within
        your kalihim mates, or{" "}
        <Text className="font-semibold text-green-600">Save</Text> securely to
        your device.
      </Text>

      {/* Porsyento Card */}

      <PorsyentoFeedback
        prev={prevResult?.overAllPercentage}
        current={currenResult?.overAllPercentage || 0}
      />

      {/* Confidentiality Notice */}
      <LinearGradient
        colors={["#fff1f2", "#ffe4e6"]} // light red to soft rose
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
            . Do not share, upload, or transfer this file to external
            individuals, cloud services, or unapproved devices. Ensure it is
            stored only on{" "}
            <Text style={{ fontWeight: "600" }}>secured internal systems</Text>.
          </Text>
        </View>
      </LinearGradient>

      {/* Compact Button Row */}
      <View className="flex-row justify-between items-center gap-2 mt-2">
        {/* Cache */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSaveToCache}
          className="flex-1 rounded-xl overflow-hidden shadow"
        >
          <LinearGradient
            colors={["#FBBF24", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 flex-col items-center justify-center"
          >
            <Feather name="clock" size={18} color="white" />
            <Text className="text-white text-sm mt-1 font-semibold text-center">
              Cache
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onShareFile}
          className="flex-1 rounded-xl overflow-hidden shadow"
        >
          <LinearGradient
            colors={["#60A5FA", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 flex-col items-center justify-center"
          >
            <Ionicons name="share-outline" size={18} color="white" />
            <Text className="text-white text-sm mt-1 font-semibold text-center">
              Share
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSaveToDevice}
          className="flex-1 rounded-xl overflow-hidden shadow"
        >
          <LinearGradient
            colors={["#34D399", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 flex-col items-center justify-center"
          >
            <Feather name="download" size={18} color="white" />
            <Text className="text-white text-sm mt-1 font-semibold text-center">
              Save
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
