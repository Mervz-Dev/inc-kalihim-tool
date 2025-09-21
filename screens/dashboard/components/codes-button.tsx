import { CodeReason } from "@/types/code";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CODE_DATA: CodeReason[] = [
  { code: "B", reason: "Kahirapan" },
  { code: "D", reason: "Nagkasakit" },
  { code: "I", reason: "Nakasamba sa ibang lokal" },
  { code: "N", reason: "Nanlalamig" },
];

export const CodesButton = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["60%"], []);

  const handlePress = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        className="flex-1 rounded-full shadow-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#FACC15", "#FDE047"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="py-3 px-6 flex-row items-center justify-center rounded-full"
        >
          <Ionicons
            name="code-slash-outline"
            size={20}
            color="black"
            style={{ marginRight: 8 }}
          />
          <Text className="text-black font-semibold text-lg">Codes</Text>
        </LinearGradient>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: bottom + 24 }}
        >
          <Text className="text-2xl font-bold text-gray-900 mb-5">Codes</Text>

          {CODE_DATA.map((item) => (
            <View
              key={item.code}
              className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-100 flex-row items-center justify-between"
            >
              {/* Left side: Code in a chip */}
              <View className="bg-yellow-400 rounded-full w-12 h-12 items-center justify-center shadow-sm">
                <Text className="text-black font-bold text-lg">
                  {item.code}
                </Text>
              </View>

              {/* Right side: Reason */}
              <Text className="flex-1 ml-4 text-gray-800 text-base font-medium">
                {item.reason}
              </Text>
            </View>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
