import { ActionButton } from "@/components/action-button";
import React from "react";
import { Text, View } from "react-native";

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
    <View className="w-full flex-row justify-between items-center px-6 mt-4 mb-2">
      {/* Prev Button */}
      <ActionButton
        colors={isFirst ? ["#e5e7eb", "#e5e7eb"] : ["#60a5fa", "#2563eb"]}
        label="Prev"
        onPress={handlePrev}
        icon="chevron-back-outline"
        iconPosition="left"
        disabled={isFirst}
        textColor={isFirst ? "#6b7280" : "#fff"}
        textClassName={`font-jakarta-semibold ${
          isFirst ? "text-gray-600" : "text-white"
        }`}
        style={{
          borderRadius: 999,
          width: 100,
          opacity: isFirst ? 0.6 : 1,
          flex: undefined,
        }}
      />

      {/* Progress Indicator */}
      <View className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm items-center justify-center">
        <Text className="font-jakarta-semibold text-gray-800 tracking-wide">
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* Next / Generate Button */}
      <ActionButton
        colors={isLast ? ["#22c55e", "#15803d"] : ["#60a5fa", "#2563eb"]}
        label={isLast ? "Generate" : "Next"}
        onPress={handleNext}
        icon={isLast ? "checkmark-circle-outline" : "chevron-forward-outline"}
        iconPosition="right"
        textColor="white"
        textClassName="font-jakarta-semibold text-white"
        style={{
          borderRadius: 999,
          width: 100,
          flex: undefined,
        }}
      />
    </View>
  );
};
