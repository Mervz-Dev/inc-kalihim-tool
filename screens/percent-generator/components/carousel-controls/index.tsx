import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CarouselControlsProps {
  currentIndex: number;
  total: number;
  carouselRef: React.RefObject<any>;
  onGenerate: () => void;
}

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  currentIndex,
  total,
  carouselRef,
  onGenerate,
}) => {
  const handlePrev = () => {
    if (currentIndex > 0) {
      carouselRef.current?.scrollTo({
        index: Math.max(currentIndex - 1, 0),
        animated: true,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex === total - 1) {
      onGenerate();
      return;
    }
    carouselRef.current?.scrollTo({
      index: Math.min(currentIndex + 1, total - 1),
      animated: true,
    });
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <View className="w-full flex-row justify-between items-center px-6 mt-6">
      {/* Prev Button */}
      <TouchableOpacity
        disabled={isFirst}
        onPress={handlePrev}
        activeOpacity={0.9}
        className={`rounded-2xl overflow-hidden shadow-sm ${
          isFirst ? "opacity-60" : "opacity-100"
        }`}
      >
        <LinearGradient
          colors={isFirst ? ["#e5e7eb", "#e5e7eb"] : ["#60a5fa", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-28 py-3 rounded-2xl items-center justify-center flex-row gap-1"
        >
          <Ionicons
            name="chevron-back-outline"
            size={18}
            color={isFirst ? "#6b7280" : "#fff"}
          />
          <Text
            className={`font-semibold ${
              isFirst ? "text-gray-600" : "text-white"
            }`}
          >
            Prev
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm items-center justify-center">
        <Text className="font-semibold text-gray-800 tracking-wide">
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* Next / Generate Button */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.9}
        className="rounded-2xl overflow-hidden shadow-sm"
      >
        <LinearGradient
          colors={isLast ? ["#22c55e", "#15803d"] : ["#60a5fa", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-28 py-3 rounded-2xl items-center justify-center flex-row gap-1"
        >
          <Text className="font-semibold text-white">
            {isLast ? "Generate" : "Next"}
          </Text>
          <Ionicons
            name={
              isLast ? "checkmark-circle-outline" : "chevron-forward-outline"
            }
            size={18}
            color="#fff"
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
