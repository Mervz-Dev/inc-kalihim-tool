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

export const AboutButton = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["75%"], []);

  const handlePress = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className="flex-1 rounded-full shadow-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center px-6 py-3 rounded-xl"
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text className="text-white font-semibold text-lg">About</Text>
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
          contentContainerStyle={{ padding: 20, paddingBottom: bottom + 30 }}
        >
          {/* Title */}
          <View className="items-center mb-6">
            <Ionicons
              name="apps-outline"
              size={36}
              color="#2563eb"
              style={{ marginBottom: 8 }}
            />
            <Text className="text-2xl font-bold text-gray-900">
              About This App
            </Text>
          </View>

          {/* Info cards */}
          <View className="bg-gray-50 p-4 rounded-xl mb-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-outline" size={20} color="#2563eb" />
              <Text className="ml-2 text-gray-700 text-lg font-semibold">
                Developer
              </Text>
            </View>
            <Text className="text-gray-600 text-base">Mervin Narvaez</Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-xl mb-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
              <Text className="ml-2 text-gray-700 text-lg font-semibold">
                Purpose
              </Text>
            </View>
            <Text className="text-gray-600 text-base leading-relaxed">
              This app helps you manage kapatid assignments efficiently and
              allows easy addition, tracking, and coordination within your
              purok. It’s designed to be user-friendly, fast, and accessible.
            </Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-xl mb-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="list-outline" size={20} color="#10b981" />
              <Text className="ml-2 text-gray-700 text-lg font-semibold">
                Uses
              </Text>
            </View>
            <Text className="text-gray-600 text-base leading-relaxed">
              • Quickly add and manage kapatid within your assigned purok.{"\n"}
              • Track assignments and activities locally.{"\n"}• Generate PDF
              absentee forms for printing.{"\n"}• Easy reference for kapatid
              information.
            </Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
              <Text className="ml-2 text-gray-700 text-lg font-semibold">
                Limitations
              </Text>
            </View>
            <Text className="text-gray-600 text-base leading-relaxed">
              • All data is stored locally and not sent to any server.{"\n"}•
              This is a personal tool, not an official system.{"\n"}• No
              multi-user sync or online sharing.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
