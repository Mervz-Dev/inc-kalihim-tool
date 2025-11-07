import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LetterButton } from "../letter-button";

interface SessionCardProps {
  title: string;
  session: Percent.Session;
  letters: (keyof Percent.Codes)[];
  sessionKey: Percent.SessionKey;
  index: number;
  handleButtonPress: (
    index: number,
    key: keyof Percent.Session,
    session: "firstSession" | "secondSession"
  ) => void;
}

export const SessionCard = ({
  title,
  session,
  letters,
  index,
  sessionKey,
  handleButtonPress,
}: SessionCardProps) => {
  const handleLetterPress = useCallback(
    (code: keyof Percent.Codes) => {
      handleButtonPress(index, code, sessionKey);
    },
    [index, sessionKey, handleButtonPress]
  );

  return (
    <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 pt-2  shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-jakarta-semibold text-gray-800 text-sm">
          {title}
        </Text>

        {/* IN / OUT Buttons */}
        <View className="flex-row gap-2">
          {/* IN Button */}
          <TouchableOpacity
            className="rounded-xl overflow-hidden shadow-sm"
            activeOpacity={0.7}
            style={{ minWidth: 58 }}
            onPress={() => handleButtonPress(index, "in", sessionKey)}
          >
            <LinearGradient
              colors={
                session.in > 0 ? ["#86efac", "#22c55e"] : ["#dcfce7", "#bbf7d0"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 34,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="arrow-down-circle" size={18} color="#166534" />
              <Text className="ml-1 text-sm font-jakarta-semibold text-green-900">
                {session.in}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* OUT Button */}
          <TouchableOpacity
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ minWidth: 58 }}
            activeOpacity={0.7}
            onPress={() => handleButtonPress(index, "out", sessionKey)}
          >
            <LinearGradient
              colors={
                session.out > 0
                  ? ["#fca5a5", "#ef4444"]
                  : ["#fee2e2", "#fecaca"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 34,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="arrow-up-circle" size={18} color="#7f1d1d" />
              <Text className="ml-1 text-sm font-jakarta-semibold text-red-900">
                {session.out}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Letter Grid */}
      <View className="flex-row flex-wrap justify-between">
        {letters.map((key) => {
          const value = session[key] || 0;
          const isActive = value > 0;

          return (
            <LetterButton
              key={key}
              codeKey={key}
              value={value}
              isActive={isActive}
              onPress={handleLetterPress}
            />
          );
        })}
      </View>
    </View>
  );
};
