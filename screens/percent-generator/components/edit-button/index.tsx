import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  weekNumber: string;
  monthNumber: string;
  onPress: () => void;
}

export const EditButton = ({ weekNumber, monthNumber, onPress }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="flex-row items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-2 mx-4 self-start shadow-sm active:bg-gray-50"
  >
    <Text className="text-gray-800 font-semibold">Week {weekNumber}</Text>
    <View className="w-[1px] h-4 bg-gray-300 mx-1" />
    <Text className="text-gray-700 font-medium">Month {monthNumber}</Text>
    <Ionicons name="create-outline" size={18} color="#3b82f6" />
  </TouchableOpacity>
);
