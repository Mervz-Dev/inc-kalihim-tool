import { ActionButton } from "@/components/action-button";
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

export const CODE_DATA: CodeReason[] = [
  {
    code: "A",
    reason: "Kahirapan, walang salapi, walang pamasahe, walang pang-gugol.",
  },
  {
    code: "B",
    reason: "Trabaho, duty or busy sa work, gipit sa oras dahil sa work.",
  },
  { code: "C", reason: "Pamalagiang may sakit (PMS), bed ridden." },
  {
    code: "D",
    reason:
      "May sakit, nahihilo, masakit ang ulo, may sipon at inuubo, dinala sa hospital.",
  },
  { code: "E", reason: "Hinahadlangan, inuusig, ayaw pasambahin." },
  {
    code: "F",
    reason:
      "Iba’t ibang klaseng dahilan, nag-alaga ng bata, nag-bantay ng tindahan or bahay kaya di maka-alis.",
  },
  {
    code: "G",
    reason:
      "UWP, di matagpuan, walang impormasyon, hindi maabutan sa bahay, umiiwas.",
  },
  {
    code: "H",
    reason:
      "Hindi umabot sa oras ng pagsamba, napag-sarhan ng pintuan, nahuling dumating.",
  },
  {
    code: "I",
    reason: "R1-06, nasa ibang dako o lugar, nasa ibang bayan o abroad.",
  },
  { code: "J", reason: "Wala sa lokal." },
  { code: "K", reason: "Kalamidad, binagyo, binaha, nasunugan." },
  { code: "L", reason: "Pag-aaral, may exam, busy sa school, OJT." },
  {
    code: "M",
    reason: "Sumamba, tumupad di nakapag taob ng tarheta, without R1-07.",
  },
  {
    code: "N",
    reason:
      "TS, madalang sumamba (MS), nag-wawalang bahala, tinamad, may ulat na, may pinuntahan.",
  },
];

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
        textStyle={{ fontSize: 14, fontFamily: "Jakarta-SemiBold" }}
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
