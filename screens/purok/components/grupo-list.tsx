import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GrupoListProps {
  maleData: User.PurokGrupoStat[];
  femaleData: User.PurokGrupoStat[];
  onItemPress: (item: User.PurokGrupoStat, gender: User.Gender) => void;
}

const { width } = Dimensions.get("window");

// parent horizontal padding
const PADDING_HORIZONTAL = 16; // 👈 same as your container padding
const CARD_MARGIN = 6;
const NUM_COLUMNS = 4;

// subtract left + right padding before dividing
const CARD_WIDTH =
  (width - PADDING_HORIZONTAL * 2 - CARD_MARGIN * (NUM_COLUMNS * 2)) /
  NUM_COLUMNS;

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
        activeOpacity={0.9}
        onPress={() => onItemPress(item, gender)}
        style={{
          width: CARD_WIDTH,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          margin: CARD_MARGIN,
          transform: [{ scale: 1 }],
        }}
      >
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 14,
            minHeight: 78,
            justifyContent: "center",
          }}
        >
          {/* Title */}
          <Text
            numberOfLines={1}
            style={{
              color: "white",
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 0.3,
              textAlign: "center",
            }}
          >
            {item.purok}-{item.grupo}
          </Text>

          {/* Divider line for structure */}
          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.25)",
              marginVertical: 6,
            }}
          />

          {/* Count section */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingVertical: 3,
              paddingHorizontal: 8,
              borderRadius: 20,
              alignSelf: "center",
            }}
          >
            <Ionicons name="person-outline" size={14} color="white" />
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              {item.userCount}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderSection = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    data: User.PurokGrupoStat[],
    gender: User.Gender
  ) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-2 px-1">
        <Ionicons name={icon} size={20} color={color} />
        <Text className="text-neutral-700 text-lg font-semibold ml-2">
          {title}
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => renderItem(item, gender)}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <ScrollView
      className="flex-1 mt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {maleData.length > 0 &&
        renderSection("Lalaki", "male", "#2563eb", maleData, "male")}
      {femaleData.length > 0 &&
        renderSection("Babae", "female", "#db2777", femaleData, "female")}
    </ScrollView>
  );
};
