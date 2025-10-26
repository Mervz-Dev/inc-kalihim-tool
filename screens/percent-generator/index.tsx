import { LETTER_CODES } from "@/constants/percent";
import { RootStackParamList } from "@/types/navigation";
import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { CarouselControls } from "./components/carousel-controls";
import { Header } from "./components/header";
import { SNumberModal } from "./components/s-number-modal";
import { SessionCard } from "./components/session-card";
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

  const renderItem = ({
    item,
    index,
  }: {
    item: Percent.GroupValues;
    index: number;
  }) => {
    return (
      <View style={{ width }} className="p-4 pt-2">
        {/* Card Container */}
        <View className="bg-white rounded-3xl shadow-md p-5 border border-gray-100">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Grupo {item.group}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="person-circle" size={20} color="#2563eb" />
                <Text className="ml-1 text-base font-medium text-gray-600">
                  {sNumber?.[index]?.count || 0} members
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={() => handleReset(index)}
              activeOpacity={0.85}
              className="flex-row items-center px-4 py-2 rounded-2xl bg-yellow-100 border border-yellow-300"
            >
              <Ionicons name="refresh" size={18} color="#854d0e" />
              <Text className="ml-2 text-yellow-900 text-sm font-semibold">
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100 mb-3" />

          {/* Sessions */}
          <View className="space-y-4">
            <SessionCard
              title="First Session (Wed/Thu)"
              session={item.firstSession}
              letters={LETTER_CODES}
              index={index}
              handleButtonPress={handleButtonPress}
            />

            <SessionCard
              title="Second Session (Sat/Sun)"
              session={item.secondSession}
              letters={LETTER_CODES}
              index={index}
              handleButtonPress={handleButtonPress}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 px-0 pt-4 bg-gray-50">
      <Header purok={purok} editPress={() => setSNumberModalVisible(true)} />

      {/* <EditButton
        weekNumber={weekNumber}
        monthNumber={monthNumber}
        onPress={() => setSNumberModalVisible(true)}
      /> */}

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

        <CarouselControls
          currentIndex={currentIndex}
          total={groupValues.length}
          carouselRef={carouselRef}
          onGenerate={generatePercentData}
        />
      </View>

      <SNumberModal
        visible={sNumberModalVisible}
        onClose={() => setSNumberModalVisible(false)}
        weekNumber={weekNumber}
        monthNumber={monthNumber}
        setWeekNumber={setWeekNumber}
        setMonthNumber={setMonthNumber}
        sNumber={sNumber}
        handleChange={handleChange}
        handleSave={handleSave}
      />
    </SafeAreaView>
  );
}
