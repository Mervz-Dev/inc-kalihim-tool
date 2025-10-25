import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

interface SessionCardProps {
  title: string;
  session: Percent.Session;
  letters: (keyof Percent.Codes)[];
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
  handleButtonPress,
}: SessionCardProps) => {
  const sessionType = title.includes("First")
    ? "firstSession"
    : "secondSession";

  return (
    <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-gray-800 text-base">{title}</Text>

        {/* IN / OUT Buttons */}
        <View className="flex-row gap-2">
          {/* IN Button */}
          <TouchableOpacity
            className="rounded-xl overflow-hidden shadow-sm"
            activeOpacity={0.9}
            onPress={() => handleButtonPress(index, "in", sessionType)}
          >
            <LinearGradient
              colors={
                session.in > 0 ? ["#86efac", "#22c55e"] : ["#dcfce7", "#bbf7d0"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center px-3 py-1.5 rounded-xl"
            >
              <Ionicons name="arrow-down-circle" size={18} color="#166534" />
              <Text className="ml-1 text-sm font-semibold text-green-900">
                {session.in}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* OUT Button */}
          <TouchableOpacity
            className="rounded-xl overflow-hidden shadow-sm"
            activeOpacity={0.9}
            onPress={() => handleButtonPress(index, "out", sessionType)}
          >
            <LinearGradient
              colors={
                session.out > 0
                  ? ["#fca5a5", "#ef4444"]
                  : ["#fee2e2", "#fecaca"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center px-3 py-1.5 rounded-xl"
            >
              <Ionicons name="arrow-up-circle" size={18} color="#7f1d1d" />
              <Text className="ml-1 text-sm font-semibold text-red-900">
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
            <TouchableOpacity
              key={key}
              activeOpacity={0.9}
              className={`w-[18%] p-2.5 mb-2 items-center rounded-xl border shadow-sm ${
                isActive
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
              onPress={() => handleButtonPress(index, key, sessionType)}
            >
              <Text
                className={`font-semibold text-sm ${
                  isActive ? "text-green-700" : "text-gray-700"
                }`}
              >
                {key.toUpperCase()}
              </Text>
              <Text
                className={`text-xs ${
                  isActive ? "text-green-600" : "text-gray-500"
                }`}
              >
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
