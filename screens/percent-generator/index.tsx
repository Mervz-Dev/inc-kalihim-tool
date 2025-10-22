import { RootStackParamList } from "@/types/navigation";
import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePercentGenerator } from "./usePercentGenerator";

export default function PercentGenerator() {
  const { groupCount, purok } =
    useLocalSearchParams<RootStackParamList["percent-generator"]>();

  const {
    groupValues,
    sNumber,
    handleButtonPress,
    handleChange,
    handleReset,
    handleSave,
    sNumberModalVisible,
    setSNumberModalVisible,
    generatePercentData,
    weekNumber,
    setWeekNumber,
    monthNumber,
    setMonthNumber,
  } = usePercentGenerator(purok, groupCount);

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);
  const { width, height } = Dimensions.get("window");

  const letters: (keyof Percent.Codes)[] = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
  ];

  const renderItem = ({
    item,
    index,
  }: {
    item: Percent.GroupValues;
    index: number;
  }) => {
    return (
      <View style={{ width }} className="p-4">
        <View className="bg-white rounded-2xl shadow-lg p-4">
          <View className="flex-row justify-between items-center bg-white rounded-xl p-3 shadow-sm mb-3">
            {/* LEFT SIDE */}
            <View className="flex-row items-center space-x-2 gap-2">
              <Text className="text-xl font-semibold text-gray-900">
                Grupo - {item.group}
              </Text>

              <View className="flex-row items-center">
                <Ionicons name="person-circle" size={22} color="#4B5563" />
                <Text className="ml-1 text-base font-semibold text-gray-700">
                  {sNumber[index].count}
                </Text>
              </View>
            </View>

            {/* RIGHT SIDE BUTTONS */}
            <View className="flex-row items-center space-x-2 gap-2">
              {/* In */}
              <TouchableOpacity
                className={`flex-row items-center px-3.5 py-2 rounded-xl ${
                  item.in > 0 ? "bg-green-100" : "bg-green-50"
                }`}
                onPress={() => handleButtonPress(index, "in")}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-down-circle" size={22} color="#15803d" />
                <Text
                  className={`ml-1 text-base font-medium ${
                    item.in > 0 ? "text-green-800" : "text-green-700"
                  }`}
                >
                  {item.in}
                </Text>
              </TouchableOpacity>

              {/* Out */}
              <TouchableOpacity
                className={`flex-row items-center px-3.5 py-2 rounded-xl ${
                  item.out > 0 ? "bg-red-100" : "bg-red-50"
                }`}
                onPress={() => handleButtonPress(index, "out")}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-up-circle" size={22} color="#b91c1c" />
                <Text
                  className={`ml-1 text-base font-medium ${
                    item.out > 0 ? "text-red-800" : "text-red-700"
                  }`}
                >
                  {item.out}
                </Text>
              </TouchableOpacity>

              {/* Reset */}
              <TouchableOpacity
                className="flex-row items-center px-3 py-2 rounded-xl bg-gray-100"
                onPress={() => handleReset(index)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-circle" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* First Session Card */}
          <View className="bg-gray-50 rounded-xl p-3 mb-4 shadow-sm">
            <Text className="font-semibold text-gray-600 mb-2">
              First Session
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {letters.map((key) => {
                const value =
                  item.firstSession[key as keyof Percent.Session] || 0;
                return (
                  <TouchableOpacity
                    key={key}
                    className={`w-[18%] border rounded-lg p-3 mb-2 items-center shadow-sm ${
                      value > 0
                        ? "bg-green-100 border-green-400"
                        : "bg-gray-100 border-gray-200"
                    }`}
                    onPress={() =>
                      handleButtonPress(
                        index,
                        key as keyof Percent.Session,
                        "firstSession"
                      )
                    }
                  >
                    <Text className="font-semibold text-gray-700">
                      {key.toUpperCase()}
                    </Text>
                    <Text className="text-gray-500">{value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Second Session Card */}
          <View className="bg-gray-50 rounded-xl p-3 shadow-sm">
            <Text className="font-semibold text-gray-600 mb-2">
              Second Session
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {letters.map((key) => {
                const value =
                  item.secondSession[key as keyof Percent.Session] || 0;
                return (
                  <TouchableOpacity
                    key={key}
                    className={`w-[18%] border rounded-lg p-3 mb-2 items-center shadow-sm ${
                      value > 0
                        ? "bg-green-100 border-green-400"
                        : "bg-gray-100 border-gray-200"
                    }`}
                    onPress={() =>
                      handleButtonPress(
                        index,
                        key as keyof Percent.Session,
                        "secondSession"
                      )
                    }
                  >
                    <Text className="font-semibold text-gray-700">
                      {key.toUpperCase()}
                    </Text>
                    <Text className="text-gray-500">{value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // const goToIndex = (index: number) => {
  //   flatListRef.current?.scrollToIndex({ index, animated: true });
  //   setCurrentIndex(index);
  // };

  return (
    <SafeAreaView className="flex-1 px-0 pt-4 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 px-4">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-2 rounded-full bg-white shadow"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-black text-2xl font-bold">
            Percent Generator - Purok {purok}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setSNumberModalVisible(true)}
        activeOpacity={0.8}
        className="flex-row items-center gap-2 bg-gray-100 rounded-xl px-4 pt-1 border border-gray-300 active:bg-gray-200 mx-4 self-start"
      >
        <Text className="text-gray-800 font-medium">Week {weekNumber}</Text>
        <Text className="text-gray-800 font-medium">Month {monthNumber}</Text>
        <Ionicons name="create-outline" size={16} color="#6b7280" />
      </TouchableOpacity>

      <View className="flex-1 justify-center bg-gray-50">
        <Carousel
          ref={carouselRef}
          width={width}
          height={height * 0.75}
          data={groupValues}
          renderItem={({ item, index }) => renderItem({ item, index })}
          pagingEnabled
          loop={false}
          onSnapToItem={(index) => setCurrentIndex(index)}
        />

        <View className="w-full flex-row justify-between items-center px-6 mt-4">
          <TouchableOpacity
            disabled={currentIndex === 0}
            onPress={() =>
              carouselRef.current?.scrollTo({
                index: Math.max(currentIndex - 1, 0),
                animated: true,
              })
            }
            className="rounded-full overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={
                currentIndex === 0
                  ? ["#d1d5db", "#d1d5db"]
                  : ["#3b82f6", "#2563eb"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-24 rounded-full py-3 items-center shadow"
            >
              <Text
                className={`font-semibold ${
                  currentIndex === 0 ? "text-gray-600" : "text-white"
                }`}
              >
                Prev
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Page Indicator */}
          <View className="px-4 py-2 bg-white rounded-full shadow items-center justify-center">
            <Text className="font-semibold text-gray-700">
              {currentIndex + 1}/{groupValues.length}
            </Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={() => {
              if (currentIndex === groupValues.length - 1) {
                generatePercentData();
                return;
              }
              carouselRef.current?.scrollTo({
                index: Math.min(currentIndex + 1, groupValues.length - 1),
                animated: true,
              });
            }}
            className="rounded-full overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={
                currentIndex === groupValues.length - 1
                  ? ["#16a34a", "#059669"]
                  : ["#3b82f6", "#2563eb"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-24 rounded-full py-3 items-center shadow"
            >
              <Text className={`font-semibold text-white`}>
                {currentIndex === groupValues.length - 1 ? "Generate" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={sNumberModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            {/* Header */}
            <Text className="text-2xl font-bold mb-4 text-gray-800 text-center">
              Enter S# for Each Group
            </Text>

            {/* Week and Month Inputs */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 font-semibold mb-1">Week #</Text>
                <TextInput
                  placeholder="e.g. 42"
                  keyboardType="number-pad"
                  value={weekNumber?.toString() || ""}
                  onChangeText={setWeekNumber}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 font-medium"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-700 font-semibold mb-1">
                  Month #
                </Text>
                <TextInput
                  placeholder="e.g. 10"
                  keyboardType="number-pad"
                  value={monthNumber?.toString() || ""}
                  onChangeText={setMonthNumber}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 font-medium"
                />
              </View>
            </View>

            {/* Input List */}
            <ScrollView className="mb-4" style={{ maxHeight: 300 }}>
              {sNumber.map((group, index) => (
                <View
                  key={group.group}
                  className="flex-row justify-between items-center mb-3 px-2 py-1 bg-gray-50 rounded-lg shadow-sm"
                >
                  <Text className="text-lg font-semibold text-gray-700">
                    Group {group.group}
                  </Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={group.count === 0 ? "" : group.count.toString()}
                    onFocus={() => {
                      if (group.count === 0) handleChange(index, "");
                    }}
                    onChangeText={(value) => handleChange(index, value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 w-20 text-center text-gray-800 font-medium"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              className="rounded-full overflow-hidden mb-3 shadow-md"
            >
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 px-6 rounded-full items-center"
              >
                <Text className="text-white font-semibold text-lg">Save</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSNumberModalVisible(false)}
              activeOpacity={0.85}
              className="rounded-full overflow-hidden shadow-md"
            >
              <LinearGradient
                colors={["#D1D5DB", "#9CA3AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 px-6 rounded-full items-center"
              >
                <Text className="text-gray-800 font-semibold text-lg">
                  Close
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
