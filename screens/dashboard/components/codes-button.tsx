import { ActionButton } from "@/components/action-button";
import { CODE_DEFINITIONS } from "@/constants/codes";
import { CodeReason } from "@/types/code";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// The letter codes A–N as listed on the official form. R1-07 is a button on
// the R1-04 card but not a reason code, so it stays off this list.
export const CODE_DATA: CodeReason[] = CODE_DEFINITIONS.filter(
  (definition) => definition.key !== "r107"
).map(({ code, reason }) => ({ code, reason }));

export const CodesButton = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["70%", "80%"], []);

  const handlePress = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <ActionButton
        colors={["#FACC15", "#FDE047"]}
        icon="code-slash-outline"
        iconPosition="left"
        label="Codes"
        onPress={handlePress}
        textColor="black"
        textClassName="text-black font-jakarta-semibold text-base text-center"
        style={{
          flex: 1,
          borderRadius: 9999,
          minHeight: 45,
        }}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        enableOverDrag={false}
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
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-jakarta-bold text-gray-900">
              Codes
            </Text>

            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              activeOpacity={0.8}
              className="bg-gray-100 p-2 rounded-full"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {CODE_DATA.map((item) => (
            <View
              key={item.code}
              className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-100 flex-row items-center justify-between"
            >
              {/* Left side: Code in a chip */}
              <View className="bg-yellow-400 rounded-full w-12 h-12 items-center justify-center shadow-sm">
                <Text className="text-black font-jakarta-bold text-lg">
                  {item.code}
                </Text>
              </View>

              {/* Right side: Reason */}
              <Text className="flex-1 ml-4 text-gray-800 text-base font-jakarta-medium">
                {item.reason}
              </Text>
            </View>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
