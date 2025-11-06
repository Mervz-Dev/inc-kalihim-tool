import { ActionButton } from "@/components/action-button";
import { resetSessions } from "@/services/sql-lite/db";
import { useSQLiteContext } from "expo-sqlite";
import { Text, View } from "react-native";
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
        <ActionButton
          colors={["#E5E7EB", "#D1D5DB"]}
          label="Cancel"
          onPress={onClose}
          textClassName="text-gray-800 font-jakarta-semibold"
          style={{
            borderRadius: 9999,
            minHeight: 42,
          }}
          className="flex-1 shadow-md"
        />

        <ActionButton
          colors={["#F87171", "#B91C1C"]}
          label="Confirm Reset"
          onPress={onResetSessions}
          textClassName="text-white font-jakarta-semibold"
          style={{
            borderRadius: 9999,
            minHeight: 42,
          }}
          className="flex-1 shadow-md"
        />
      </View>
    </View>
  );
};
