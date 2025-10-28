import { CODES } from "@/constants/percent";
import { RootStackParamList } from "@/types/navigation";
import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { CarouselControls } from "./components/carousel-controls";
import { Header } from "./components/header";
import { SNumberModal } from "./components/s-number-modal";
import { SaveFileView } from "./components/save-file-view";
import { SessionCard } from "./components/session-card";
import { usePercentGenerator } from "./usePercentGenerator";

export default function PercentGenerator() {
  const { groupCount, purok } =
    useLocalSearchParams<RootStackParamList["percent-generator"]>();

  const saveFileBottomSheet = useRef<BottomSheetModal>(null);
  const saveFileSheetPoints = useMemo(() => ["50%"], []);

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
    handleShare,
    handleLocalSave,
    handleSaveOnCache,
    currentComputedResult,
    prevComputedResult,
    setDateRange,
    dateRange,
    handleResetCache,
  } = usePercentGenerator(purok, groupCount, saveFileBottomSheet);

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);
  const { width, height } = Dimensions.get("window");

  const renderItem = useCallback(
    ({ item, index }: { item: Percent.GroupValues; index: number }) => (
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
          <View className="space-y-4 gap-3">
            <SessionCard
              title="First Session (Wed/Thu)"
              session={item.firstSession}
              letters={CODES}
              index={index}
              handleButtonPress={handleButtonPress}
            />

            <SessionCard
              title="Second Session (Sat/Sun)"
              session={item.secondSession}
              letters={CODES}
              index={index}
              handleButtonPress={handleButtonPress}
            />
          </View>
        </View>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleButtonPress]
  );

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
          windowSize={3}
          modeConfig={{ moveSize: width }}
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
        handleReset={handleResetCache}
        visible={sNumberModalVisible}
        onClose={() => setSNumberModalVisible(false)}
        setDateRange={setDateRange}
        dateRange={dateRange}
        sNumber={sNumber}
        handleChange={handleChange}
        handleSave={handleSave}
      />

      <BottomSheetModal
        index={1}
        ref={saveFileBottomSheet}
        snapPoints={saveFileSheetPoints}
        keyboardBehavior="interactive"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView className="flex-1 px-2 pb-6 pt-1">
          <SaveFileView
            currenResult={currentComputedResult}
            prevResult={prevComputedResult}
            onClose={() => saveFileBottomSheet.current?.close()}
            onSaveToCache={handleSaveOnCache}
            onSaveToDevice={handleLocalSave}
            onShareFile={handleShare}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
