import { resetSessions } from "@/services/sql-lite/db";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface ResetConfirmationViewProps {
  purok: string;
  onClose: () => void;
}

export const ResetConfirmationView = ({
  purok,
  onClose,
}: ResetConfirmationViewProps) => {
  const db = useSQLiteContext();
  const { bottom } = useSafeAreaInsets();

  const onResetSessions = async () => {
    try {
      await resetSessions(purok, db);

      Toast.show({
        type: "success",
        text1: "Sessions Reset",
        text2: `All session data for Purok ${purok} has been cleared.`,
      });

      onClose();
    } catch (error) {
      console.log("onResetSessions error:", error);
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: "Something went wrong while resetting sessions.",
      });
    }
  };

  return (
    <View className="flex-1 mt-6 " style={{ marginBottom: bottom + 20 }}>
      <Text className="text-gray-900 text-2xl font-jakarta-bold mb-4">
        Reset Sessions for Purok {purok}
      </Text>

      <View className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-6 shadow-sm">
        <Text className="text-red-700 font-jakarta-bold text-lg mb-1">
          ⚠️ Warning
        </Text>
        <Text className="text-red-600 font-jakarta-regular text-sm leading-relaxed">
          This action will reset{" "}
          <Text className="font-jakarta-semibold">
            all first and second session data
          </Text>{" "}
          for users in this purok. Make sure sessions are completed before
          continuing.
        </Text>
      </View>

      <Text className="text-gray-500  font-jakarta-regular text-sm mb-6">
        You cannot undo this action. Please confirm carefully.
      </Text>

      <View className="flex-row items-center justify-between gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 rounded-full overflow-hidden shadow-md"
          onPress={onClose}
        >
          <LinearGradient
            colors={["#E5E7EB", "#D1D5DB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 items-center justify-center rounded-full"
          >
            <Text className="text-gray-800 font-jakarta-semibold">Cancel</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 rounded-full overflow-hidden shadow-md"
          onPress={onResetSessions}
        >
          <LinearGradient
            colors={["#F87171", "#B91C1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 items-center justify-center rounded-full"
          >
            <Text className="text-white font-jakarta-semibold">
              Confirm Reset
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
