import { ActionButton } from "@/components/action-button";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AboutButton = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  const handlePress = () => bottomSheetRef.current?.present();

  const handleEmailPress = () => {
    Linking.openURL("mailto:mervinnarvaez.im@gmail.com");
  };

  const handleLinkedInPress = () => {
    Linking.openURL("https://linkedin.com/in/mervin-narvaez-85b183188");
  };

  return (
    <>
      {/* About Button */}
      <ActionButton
        colors={["#6366F1", "#3B82F6"]}
        icon="information-circle-outline"
        iconPosition="left"
        label="About"
        onPress={handlePress}
        textClassName="text-white font-jakarta-semibold text-base text-center"
        style={{
          borderRadius: 9999,
          minHeight: 45,
          flex: 1,
        }}
      />

      {/* About Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={["85%"]}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={false}
        enablePanDownToClose={true}
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
                <Text className="text-white text-xl font-jakarta-bold mb-1">
                  About
                </Text>
                <Text className="text-white/90 text-sm text-center font-jakarta-regular leading-relaxed">
                  A simple automated tool that helps Kalihim organize records
                  and generate forms quickly.
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Developer */}
          <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
            {/* Title */}
            <View className="flex-row items-center mb-3">
              <Ionicons name="person-outline" size={20} color="#2563eb" />
              <Text className="ml-2 text-gray-800 text-base font-jakarta-semibold">
                Developer
              </Text>
            </View>

            {/* Name */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 text-base font-jakarta-semibold">
                Mervin Narvaez
              </Text>

              <View className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 text-xs font-jakarta-semibold">
                  Coding & Design
                </Text>
              </View>
            </View>

            {/* Contact Links */}
            <View className="space-y-2 gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEmailPress}
                className="flex-row items-center"
              >
                <View className="bg-gray-100 rounded-full p-2 mr-3">
                  <Ionicons name="mail-outline" size={16} color="#374151" />
                </View>
                <Text className="text-blue-600 text-sm font-jakarta-regular underline">
                  mervinnarvaez.im@gmail.com
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLinkedInPress}
                className="flex-row items-center"
              >
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <Ionicons name="logo-linkedin" size={16} color="#2563eb" />
                </View>
                <Text className="text-blue-600 text-sm font-jakarta-regular underline">
                  linkedin.com/in/mervin-narvaez-85b183188
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Purpose */}
          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
              <Text className="ml-2 text-gray-800 text-base font-jakarta-semibold">
                Purpose
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-jakarta-regular leading-relaxed">
              Manual input and tracking of kapatid assignments can be
              time-consuming, prone to mistakes, and difficult to organize. This
              tool helps streamline that process by automating data entry,
              tracking, and form generation — making a Kalihim’s work faster,
              more accurate, and easier to manage.
            </Text>
          </View>

          {/* Features */}
          {/* Features Section */}
          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="list-outline" size={20} color="#10b981" />
              <Text className="ml-2 text-gray-800 text-base font-jakarta-semibold">
                Features
              </Text>
            </View>

            <Text className="text-gray-600 text-sm font-jakarta-regular leading-relaxed">
              • Add and manage kapatid easily within your assigned purok.{"\n"}•
              Automatically generate forms such as Percent and Attendance
              Sheets.{"\n"}• Organize and review data neatly through built-in
              views and summaries.{"\n"}• View code references and local records
              for transparency and easy checking.{"\n"}• Works fully offline —
              all data is stored and processed locally on your device.
            </Text>
          </View>

          {/* Security Section */}
          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#2563eb"
              />
              <Text className="ml-2 text-gray-800 text-base font-jakarta-semibold">
                Security
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-jakarta-regular leading-relaxed">
              • The app is protected with a built-in{" "}
              <Text className="font-jakarta-semibold text-gray-700">
                access password
              </Text>
              .{"\n"}• Exported files are automatically{" "}
              <Text className="font-jakarta-semibold text-gray-700">
                zipped and password-protected
              </Text>{" "}
              — only this app can generate and open them securely.{"\n"}•{" "}
              <Text className="font-jakarta-semibold text-gray-700">
                Screen recording and screenshots
              </Text>{" "}
              are disabled while using the app to protect sensitive data.{"\n"}•
              Security checks help prevent usage on{" "}
              <Text className="font-jakarta-semibold text-gray-700">
                rooted or jailbroken devices
              </Text>{" "}
              for enhanced protection.{"\n\n"}
              🔒{" "}
              <Text className="font-jakarta-semibold text-gray-700">
                Data privacy matters:
              </Text>{" "}
              All information stays local to your device — nothing is{" "}
              <Text className="font-jakarta-semibold text-gray-700">
                hidden or background
              </Text>{" "}
              uploaded, shared, or sent online.
            </Text>
          </View>

          {/* Personal Use Only */}
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle-outline" size={20} color="#b91c1c" />
              <Text className="ml-2 text-red-800 text-base font-jakarta-semibold">
                Personal Use Only
              </Text>
            </View>

            <Text className="text-red-700 text-sm font-jakarta-regular leading-relaxed">
              This app is designed for{" "}
              <Text className="font-jakarta-semibold text-red-800">
                individual and local record management
              </Text>{" "}
              — it is{" "}
              <Text className="font-jakarta-semibold text-red-800">not</Text>{" "}
              intended for public distribution, organizational deployment, or
              shared multi-user systems.{"\n\n"}
              Think of it like a{" "}
              <Text className="font-jakarta-semibold text-red-800">
                calculator tool for a Kalihim
              </Text>{" "}
              — a personal assistant that helps you{" "}
              <Text className="font-jakarta-semibold text-red-800">
                work faster, stay organized, and reduce manual errors
              </Text>{" "}
              when handling assignments, records, and forms within your own area
              of responsibility.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
