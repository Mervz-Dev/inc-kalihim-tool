import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface UserCardProps {
  user: User.User;
  session: "first" | "second";
  onToggleStatus: (id: number) => void;
  onOpenEditUser: (user: User.User) => void;
}

export const UserCard = ({
  user,
  session,
  onToggleStatus,
  onOpenEditUser,
}: UserCardProps) => {
  const isMarkedAbsent =
    session === "first" ? user.firstSession : user.secondSession;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => onToggleStatus(user.id)}
      onLongPress={() => onOpenEditUser(user)}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 12, stiffness: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      }}
    >
      <Animated.View style={animatedStyle} className="mb-0.5">
        <View className="rounded-2xl shadow-lg overflow-hidden">
          <View
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{ minHeight: 84 }}
          >
            <LinearGradient
              colors={
                isMarkedAbsent ? ["#EF4444", "#B91C1C"] : ["#10B981", "#059669"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 relative"
              style={{ minHeight: 84 }}
            >
              <View className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
                <Ionicons
                  name={isMarkedAbsent ? "sad-outline" : "happy-outline"}
                  size={24}
                  color={isMarkedAbsent ? "#EF4444" : "#10B981"}
                />
              </View>

              <View className="flex-1 items-center justify-center">
                <Text className="text-white font-jakarta-semibold text-sm">
                  {user.purok} - {user.grupo}
                </Text>
                <Text className="text-white text-xl font-jakarta-bold text-center mt-1">
                  {user.fullname}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};
