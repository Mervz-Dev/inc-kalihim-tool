import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PurokListProps {
  data: User.PurokCount[];
  onItemPress: (item: User.PurokCount) => void;
  onAddPress: () => void;
}

export const PurokList = ({
  data,
  onItemPress,
  onAddPress,
}: PurokListProps) => {
  const renderItem: ListRenderItem<User.PurokCount> = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onItemPress(item)}
        className="mt-3 rounded-2xl shadow-md overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1e40af"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 flex-row justify-between items-center"
        >
          {/* Left side */}
          <View className="flex-1">
            <Text className="text-white text-2xl font-extrabold">
              Purok {item.purok}
            </Text>
            <Text className="text-gray-200 text-sm mt-1">
              {item.grupoCount} Grupo{item.grupoCount > 1 ? "s" : ""}
            </Text>
          </View>

          {/* Right side */}
          <View className="flex-col items-end gap-3">
            {/* Total Users */}
            <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
              <Ionicons name="people" size={18} color="white" />
              <Text className="text-white font-semibold ml-1">
                {item.userCount}
              </Text>
            </View>

            {/* Male/Female counts */}
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <Ionicons name="woman" size={16} color="#f472b6" />
                <Text className="text-white text-sm font-semibold ml-1">
                  {item.femaleCount}
                </Text>
              </View>
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <Ionicons name="man" size={16} color="#60a5fa" />
                <Text className="text-white text-sm font-semibold ml-1">
                  {item.maleCount}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (data.length <= 0) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <View className="mb-6">
          <Ionicons name="people-outline" size={56} color="#9ca3af" />
        </View>

        <Text className="text-center text-2xl font-bold text-gray-800 mb-2">
          Walang Purok pa
        </Text>

        <Text className="text-center text-gray-600 text-base mb-6">
          Tap the button below to add a new kapatid under your assigned purok.
        </Text>

        <Pressable
          onPress={onAddPress}
          className="flex-row items-center bg-blue-600 px-6 py-3 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={22} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Add Kapatid
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-neutral-600 text-lg font-semibold">
          📋 List of Purok
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onAddPress()}
          className="bg-blue-100 p-0.5 rounded-full shadow-sm"
        >
          <Ionicons name="add-circle" size={30} color={"#2563eb"} />
        </TouchableOpacity>
      </View>

      <FlatList
        renderItem={renderItem}
        data={data}
        keyExtractor={(item) => item.purok}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};
