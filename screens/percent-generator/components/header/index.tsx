import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const Header = ({ purok }: { purok: string }) => (
  <View className="flex-row items-center justify-between mb-4 px-4">
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.back()}
        className="p-2 rounded-full bg-white shadow"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text className="text-black text-2xl font-bold">
        Percent Generator - Purok {purok}
      </Text>
    </View>
  </View>
);
