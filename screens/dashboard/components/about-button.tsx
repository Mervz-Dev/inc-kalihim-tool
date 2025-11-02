import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AboutButton = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  const handlePress = () => bottomSheetRef.current?.present();

  return (
    <>
      {/* About Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className="flex-1 rounded-full shadow-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#6366F1", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center px-6 py-3 rounded-full"
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text className="text-white font-semibold text-sm">About</Text>
        </LinearGradient>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={["85%"]}
        enableContentPanningGesture={true} // ✅ allow inner scroll
        enableHandlePanningGesture={false} // ✅ prevent expanding the sheet itself
        enablePanDownToClose={true} // ✅ allow closing by swipe down
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
          contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40 }}
        >
          {/* Header */}
          <View className="flex-1 rounded-2xl mb-6 shadow-md">
            <View className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 items-center justify-center"
              >
                <Ionicons
                  name="apps-outline"
                  size={42}
                  color="white"
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-white text-xl font-bold mb-1">About</Text>
                <Text className="text-white/90 text-sm text-center">
                  A simple automated tool that helps Kalihim organize records
                  and generate forms quickly.
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Info Cards */}
          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-outline" size={20} color="#2563eb" />
              <Text className="ml-2 text-gray-800 text-base font-semibold">
                Developer
              </Text>
            </View>
            <Text className="text-gray-600 text-sm">Mervin Narvaez</Text>
          </View>

          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
              <Text className="ml-2 text-gray-800 text-base font-semibold">
                Purpose
              </Text>
            </View>
            <Text className="text-gray-600 text-sm leading-relaxed">
              Manual input and tracking of kapatid assignments can be
              time-consuming, prone to mistakes, and difficult to organize. This
              tool helps streamline that process by automating data entry,
              tracking, and form generation — making a Kalihim’s work faster,
              more accurate, and easier to manage.
            </Text>
          </View>

          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="list-outline" size={20} color="#10b981" />
              <Text className="ml-2 text-gray-800 text-base font-semibold">
                Features
              </Text>
            </View>
            <Text className="text-gray-600 text-sm leading-relaxed">
              • Add and manage kapatid easily within your assigned purok.{"\n"}•
              Automatically generate forms such as Percent and Attendance
              Sheets.{"\n"}• Organize and review data neatly through built-in
              views and summaries.{"\n"}• View code references and local records
              for transparency and easy checking.{"\n"}• Works fully offline —
              all data is stored and processed locally on your device.{"\n\n"}
              ⚠️ <Text className="font-semibold text-gray-700">Note:</Text> Data
              is saved only for the current session and should be cleared or
              refreshed weekly to ensure accuracy and avoid mix-ups.
            </Text>
          </View>

          {/* Highlighted Personal Use Section */}
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="lock-closed-outline" size={20} color="#b91c1c" />
              <Text className="ml-2 text-red-800 text-base font-semibold">
                Personal Use Only
              </Text>
            </View>
            <Text className="text-red-700 text-sm leading-relaxed">
              This app stores all data **locally** on your device — nothing is
              uploaded or shared online.{"\n\n"}
              It is intended purely for **personal record-keeping and automated
              form generation**, not as an official system or multi-user tool.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
