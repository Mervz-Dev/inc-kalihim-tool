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
import { Keyboard, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const snapPoints = useMemo(() => ["70%"], []);
  const [purok, setPurok] = useState("");
  const [numGroups, setNumGroups] = useState("1");
  const [usersPerGroup, setUsersPerGroup] = useState("1");
  const [isUniqueNames, setIsUniqueNames] = useState(false);
  const loader = useLoading();

  const { bottom } = useSafeAreaInsets();

  const handleAddDummy = async () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.snapToIndex(0);

    if (!purok.trim()) {
      Toast.show({ type: "error", text1: "Enter a Purok first!" });
      return;
    }

    const groups = Number(numGroups);
    const users = Number(usersPerGroup);

    if (isNaN(groups) || groups < 1) {
      Toast.show({
        type: "error",
        text1: "Invalid number of groups",
        text2: "Please enter at least 1 group.",
      });
      return;
    }

    if (isNaN(users) || users < 1) {
      Toast.show({
        type: "error",
        text1: "Invalid number of users per group",
        text2: "Please enter at least 1 user per group.",
      });
      return;
    }

    loader.show("Adding Users...");
    await delay(650);

    try {
      await addDummyUsers(db, {
        purok: purok.trim(),
        numGroups: groups,
        usersPerGroup: users,
        isUniqueNames,
      });

      Toast.show({
        type: "success",
        text1: "Dummy users added successfully",
      });

      setPurok("");
      setNumGroups("1");
      setUsersPerGroup("1");
      setIsUniqueNames(false);
      bottomSheetRef.current?.dismiss();
    } catch (err) {
      console.error("Error adding dummy users:", err);
      Toast.show({
        type: "error",
        text1: "Failed to add dummy users",
        text2: "Please try again later.",
      });
    } finally {
      loader.hide();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      onDismiss={onClose}
      snapPoints={snapPoints}
      keyboardBlurBehavior="restore"
      keyboardBehavior="interactive"
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
        className="flex-1 p-6 bg-white"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <View style={{ marginBottom: bottom + 10 }}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-jakarta-bold text-gray-900">
              Add Dummies
            </Text>
            <TouchableOpacity
              onPress={() => bottomSheetRef?.current?.close()}
              className="p-2 rounded-full bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#374151" />
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
                male and female dummy users
              </Text>{" "}
              per group. It is mostly used to quickly generate data for R1-04
              form and for testing purposes.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Purok */}
            <View>
              <Text className="text-gray-700 font-jakarta-medium mb-2">
                Purok
              </Text>
              <BottomSheetTextInput
                value={purok}
                onBlur={() => bottomSheetRef.current?.snapToIndex(0)}
                onChangeText={setPurok}
                placeholder="Enter Purok"
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: "#F9FAFB",
                  fontSize: 16,
                  // color: "#111827",
                }}
              />
            </View>

            {/* Groups and Users Row */}
            <View className="flex-row gap-3 my-2">
              {/* Number of Groups */}
              <View className="flex-1">
                <Text className="text-gray-700 font-jakarta-medium mb-2">
                  No. of Groups
                </Text>
                <BottomSheetTextInput
                  onBlur={() => bottomSheetRef.current?.snapToIndex(0)}
                  value={numGroups}
                  onChangeText={setNumGroups}
                  placeholder="e.g. 3"
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

              {/* Users per Group */}
              <View className="flex-1 ">
                <Text className="text-gray-700 font-jakarta-medium mb-2">
                  Users by Gender
                </Text>
                <BottomSheetTextInput
                  onBlur={() => bottomSheetRef.current?.snapToIndex(0)}
                  value={usersPerGroup}
                  onChangeText={setUsersPerGroup}
                  placeholder="e.g. 2"
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

            {/* Toggle Unique Names */}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-gray-700 font-jakarta-medium">
                Use Unique Random Names
              </Text>
              <Switch
                value={isUniqueNames}
                onValueChange={setIsUniqueNames}
                trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
                thumbColor={isUniqueNames ? "#10B981" : "#9CA3AF"}
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
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
