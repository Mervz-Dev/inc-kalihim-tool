import { addDummyUsers } from "@/services/sql-lite/db";
import { delay } from "@/utils/delay";
import { useLoading } from "@/utils/hooks/useLoading";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface AddDummyUsersSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  onClose: () => void;
}

export const AddDummyUsersSheet: React.FC<AddDummyUsersSheetProps> = ({
  bottomSheetRef,
  onClose,
}) => {
  const db = useSQLiteContext();
  const snapPoints = useMemo(() => ["55%"], []);
  const [purok, setPurok] = useState("");
  const [numGroups, setNumGroups] = useState("1");
  const loader = useLoading();

  const handleAddDummy = async () => {
    if (!purok) {
      Toast.show({ type: "error", text1: "Enter a Purok first!" });
      return;
    }

    loader.show("Adding Users...");
    await delay(650);

    try {
      await addDummyUsers(db, { purok, numGroups: Number(numGroups) });
      Toast.show({
        type: "success",
        text1: "Dummy users added successfully",
      });
      setPurok("");
      setNumGroups("1");
      bottomSheetRef.current?.dismiss();
    } catch (err) {
      console.error("Error adding dummy users:", err);
      Toast.show({ type: "error", text1: "Failed to add dummy users" });
    } finally {
      loader.hide();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      onDismiss={onClose}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={0.5}
        />
      )}
    >
      <BottomSheetView
        className="flex-1 p-6 pb-12 bg-white"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        {/* Header with title + close button */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-jakarta-bold text-gray-900">
            Add Dummies
          </Text>

          <TouchableOpacity
            onPress={() => bottomSheetRef?.current?.close()}
            className="p-1 rounded-full bg-gray-100"
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="mb-6 flex-row items-start bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#3B82F6"
            className="mr-2 mt-1"
          />
          <Text className="flex-1 text-blue-800 font-jakarta-regular text-sm leading-relaxed">
            This will create{" "}
            <Text className="font-jakarta-medium">
              1 male and 1 female dummy user per group
            </Text>
            . It is mostly used to quickly generate data for R1-04 form and for
            testing purposes.
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-5 gap-2">
          <View className="space-y-1">
            <Text className="text-gray-700 font-jakarta-medium mb-2">
              Purok
            </Text>
            <BottomSheetTextInput
              value={purok}
              onChangeText={setPurok}
              placeholder="Enter Purok"
              keyboardType="default"
              style={{
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#F9FAFB",
                fontSize: 16,
              }}
            />
          </View>

          <View className="space-y-1">
            <Text className="text-gray-700 font-jakarta-medium mb-2">
              Number of Groups
            </Text>
            <BottomSheetTextInput
              value={numGroups}
              onChangeText={setNumGroups}
              placeholder="Enter number of groups"
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#F9FAFB",
                fontSize: 16,
              }}
            />
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          onPress={handleAddDummy}
          className="mt-8 rounded-full shadow-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-full"
          >
            <Text className="text-white font-jakarta-semibold text-center text-lg">
              Add Dummy List
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
