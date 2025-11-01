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

export interface DropdownOption {
  label: string;
  value: string | number;
  leftItem?: JSX.Element;
}

export interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  value?: string | number;
  onChange: (value: string | number) => void;
}

export const Dropdown = ({
  options,
  placeholder,
  className,
  value,
  onChange,
}: DropdownProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["40%"], []);
  const selectedValue = options.find((o) => o.value === value);

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
        activeOpacity={0.9}
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetRef.current?.present();
          toggleChevron(true);
        }}
        className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center flex-1 space-x-2">
          {selectedValue?.leftItem && selectedValue.leftItem}

          <View className="flex-1">
            <Text
              className={`text-sm ${
                value ? "text-gray-900 font-medium" : "text-gray-400"
              }`}
              numberOfLines={1}
            >
              {value ? selectedValue?.label : placeholder ?? "Select..."}
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            transform: [{ rotate: rotation }],
            backgroundColor: "#F3F4F6",
            borderRadius: 999,
            padding: 6,
          }}
        >
          <Ionicons name="chevron-down" size={16} color="#4B5563" />
        </Animated.View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={() => toggleChevron(false)}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView className="px-4 pt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Choose an option
          </Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value.toString()}
            contentContainerStyle={{ paddingBottom: bottom + 10 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                className={`flex-row items-center p-4 rounded-xl shadow-sm ${
                  value === item.value
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white border border-gray-100"
                }`}
                onPress={() => {
                  onChange(item.value);
                  bottomSheetRef.current?.dismiss();
                }}
              >
                {item?.leftItem && (
                  <View className="mr-3">{item.leftItem}</View>
                )}
                <Text
                  className={`flex-1 text-base ${
                    value === item.value
                      ? "text-blue-600 font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  {item.label}
                </Text>
                {value === item.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>
            )}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};
