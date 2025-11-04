import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import { Text, View } from "react-native";

export function PorsyentoFeedback({
  prev,
  current,
}: {
  prev?: number;
  current: number;
}) {
  const prevValue = prev ?? null;
  const currentValue = current ?? null;
  const diff =
    prevValue !== null && currentValue !== null
      ? currentValue - prevValue
      : null;

  const getAnimation = () => {
    if (diff === null) return require("@/assets/animations/happy.json");
    if (diff > 0) return require("@/assets/animations/cry.json");
    if (diff < 0) return require("@/assets/animations/happy.json");
    return require("@/assets/animations/happy.json");
  };

  const getMessage = () => {
    if (diff === null)
      return `📈  kasalukuyang porsyento ay ${currentValue?.toFixed(2)}%.`;
    if (diff > 0)
      return `Tumaas ng ${Math.abs(diff).toFixed(
        2
      )}% — mas madaming hindi sumamba. Pagbutihin pa natin! 🙏`;
    if (diff < 0)
      return `Bumaba ng ${Math.abs(diff).toFixed(
        2
      )}% — magandang progreso. Ipagpatuloy! 🎉`;
    return "💤 Walang pagbabago — steady lang!";
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#eef2ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderWidth: 1,
        borderColor: "#bfdbfe",
        borderRadius: 16,
        padding: 20,
        marginBottom: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-indigo-700 font-jakarta-bold text-base">
          📊 Porsyento (Kabuuang Resulta)
        </Text>

        {diff !== null && (
          <View
            className={`px-2 py-1 rounded-lg ${
              diff > 0
                ? "bg-green-100 border border-green-300"
                : diff < 0
                ? "bg-red-100 border border-red-300"
                : "bg-gray-100 border border-gray-300"
            }`}
          >
            <Text
              className={`text-xs font-jakarta-semibold ${
                diff > 0
                  ? "text-green-800"
                  : diff < 0
                  ? "text-red-800"
                  : "text-gray-700"
              }`}
            >
              {diff > 0
                ? `▲ +${Math.abs(diff).toFixed(2)}%`
                : diff < 0
                ? `▼ -${Math.abs(diff).toFixed(2)}%`
                : "Walang Pagbabago"}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-between items-center">
        {/* Previous */}
        <View>
          <Text className="text-indigo-500 text-xs font-jakarta-semibold">
            Nakaraan
          </Text>
          <Text className="text-indigo-800 font-jakarta-semibold text-base">
            {prevValue !== null ? `${prevValue.toFixed(2)}%` : "—"}
          </Text>
        </View>

        {/* Animation */}
        <LottieView
          source={getAnimation()}
          autoPlay
          loop
          style={{ width: 55, height: 55 }}
        />

        {/* Current */}
        <View className="items-end">
          <Text className="text-indigo-500 text-xs font-jakarta-semibold">
            Kasalukuyan
          </Text>
          <Text className="text-indigo-800 font-jakarta-semibold text-base">
            {currentValue?.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Message */}
      <Text className="text-sm text-gray-700 text-center font-jakarta-regular mt-3 leading-5">
        {getMessage()}
      </Text>
    </LinearGradient>
  );
}
