import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { JSX, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SessionDropDownOption {
  label: string;
  description: string;
  value: string | number;
  leftItem?: JSX.Element;
}

export interface SessionDropDownProps {
  placeholder?: string;
  className?: string;
  value?: string | number;
  onChange: (value: string | number) => void;
}

const SESSION_OPTIONS: SessionDropDownOption[] = [
  {
    value: "first",
    label: "Huwebes Session - Mid Week",
    description: "(Wednesday/Thursday)",
  },
  {
    value: "second",
    label: "Linggo Session - Weekend",
    description: "(Saturday/Sunday)",
  },
];

export const SessionDropDown = ({
  placeholder,
  className,
  value,
  onChange,
}: SessionDropDownProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["40%"], []);
  const selectedValue = SESSION_OPTIONS.find((o) => o.value === value);

  const [, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleChevron = (open: boolean) => {
    setIsOpen(open);
    Animated.timing(rotateAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className={`w-full ${className ?? ""}`}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetRef.current?.present();
          toggleChevron(true);
        }}
        className="flex-row items-center justify-between bg-white rounded-xl px-3 py-3"
        style={{
          borderWidth: value ? 1.3 : 1,
          borderColor: value ? "#3B82F6" : "#E5E7EB",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 3,
          elevation: 1.5,
        }}
      >
        <View className="flex-row items-center flex-1 gap-2.5">
          {selectedValue?.leftItem && (
            <View className="bg-blue-50 rounded-full p-1.5">
              {selectedValue.leftItem}
            </View>
          )}

          <View className="flex-1">
            <Text
              className={`text-[16px] ${
                value
                  ? "text-gray-900 font-jakarta-semibold"
                  : "text-gray-400 font-jakarta-medium"
              }`}
              numberOfLines={1}
            >
              {value ? selectedValue?.label : placeholder ?? "Select..."}
            </Text>

            {value && selectedValue?.description && (
              <Text className="text-xs text-gray-400 mt-0.5">
                {selectedValue.description}
              </Text>
            )}
          </View>
        </View>

        <Animated.View
          style={{
            transform: [{ rotate: rotation }],
            backgroundColor: "#EEF2FF",
            borderRadius: 999,
            padding: 5,
          }}
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={value ? "#3B82F6" : "#9CA3AF"}
          />
        </Animated.View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={() => toggleChevron(false)}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
            opacity={0.5}
          />
        )}
        backgroundStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        handleIndicatorStyle={{
          backgroundColor: "#D1D5DB",
          width: 40,
        }}
      >
        <BottomSheetView className="px-5 pt-2">
          {/* Header */}
          <Text className="text-lg font-jakarta-bold text-gray-900 mb-5">
            Choose Session
          </Text>

          {/* Option List */}
          <FlatList
            data={SESSION_OPTIONS}
            keyExtractor={(item) => item.value.toString()}
            contentContainerStyle={{
              paddingBottom: bottom + 20,
              gap: 10,
            }}
            renderItem={({ item }) => {
              const isSelected = value === item.value;
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  className={`flex-row items-center rounded-2xl px-5 py-4 border ${
                    isSelected
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                  onPress={() => {
                    onChange(item.value);
                    bottomSheetRef.current?.dismiss();
                  }}
                >
                  {item?.leftItem && (
                    <View
                      className={`mr-3 rounded-full p-2 ${
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {item.leftItem}
                    </View>
                  )}

                  <View className="flex-1">
                    <Text
                      className={`text-[15px] ${
                        isSelected
                          ? "text-blue-600 font-jakarta-semibold"
                          : "text-gray-800 font-jakarta-medium"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <Animated.View
                    style={{
                      opacity: isSelected ? 1 : 0,
                      transform: [{ scale: isSelected ? 1 : 0.9 }],
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#2563EB"
                    />
                  </Animated.View>
                </TouchableOpacity>
              );
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};
