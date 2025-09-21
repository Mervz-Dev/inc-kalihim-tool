import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface GrupoListProps {
  maleData: User.PurokGrupoStat[];
  femaleData: User.PurokGrupoStat[];
  onItemPress: (item: User.PurokGrupoStat, gender: User.Gender) => void;
}

export const GrupoList = ({
  maleData,
  femaleData,
  onItemPress,
}: GrupoListProps) => {
  const renderItem = (item: User.PurokGrupoStat, gender: User.Gender) => {
    const gradientColors =
      gender === "male" ? ["#3b82f6", "#2563eb"] : ["#ec4899", "#db2777"];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onItemPress(item, gender)}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 14, borderRadius: 16 }}
        >
          <View style={{ gap: 6 }}>
            <Text className="text-white text-lg font-bold tracking-wide">
              {item.purok} - {item.grupo}
            </Text>

            <View className="flex-row items-center gap-2 mt-1 bg-white/20 px-2 py-1 rounded-lg self-start">
              <Ionicons name="person" size={16} color="white" />
              <Text className="text-white font-semibold text-sm">
                {item.userCount}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 mt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mb-3">
          <Ionicons name="male" size={20} color="#2563eb" />
          <Text className="text-neutral-700 text-xl font-semibold ml-2">
            Lalaki
          </Text>
        </View>
        <View className="flex-row flex-wrap">
          {maleData.map((m, index) => (
            <View key={index} className="w-[32%] mr-[1.33%] mb-3">
              {renderItem(m, "male")}
            </View>
          ))}
        </View>

        <View className="mb-6" />

        <View className="flex-row items-center mb-3">
          <Ionicons name="female" size={20} color="#db2777" />
          <Text className="text-neutral-700 text-xl font-semibold ml-2">
            Babae
          </Text>
        </View>
        <View className="flex-row flex-wrap">
          {femaleData.map((f, index) => (
            <View key={index} className="w-[32%] mr-[1.33%] mb-3">
              {renderItem(f, "female")}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
