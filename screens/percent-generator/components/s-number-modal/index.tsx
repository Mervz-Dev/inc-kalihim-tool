import { AnimatedModal } from "@/components/animated-modal";
import { getNumberOfWeeks, getRangeTextFormat } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from "react-native-ui-datepicker";

interface SNumberModalProps {
  visible: boolean;
  onClose: () => void;
  sNumber: { group: number; count: number }[];
  handleChange: (index: number, value: string) => void;
  handleSave: () => void;
  handleGeneratePrev: () => void;
  dateRange: { startDate?: DateType; endDate?: DateType };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ startDate?: DateType; endDate?: DateType }>
  >;
  isNoPrevious?: boolean;
}

export const SNumberModal = ({
  visible,
  onClose,
  sNumber,
  handleChange,
  dateRange,
  handleGeneratePrev,
  setDateRange,
  isNoPrevious,
}: SNumberModalProps) => {
  const defaultStyles = useDefaultStyles();
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const formatRange = () => {
    const range = getRangeTextFormat(dateRange.startDate, dateRange.endDate);
    const week = getNumberOfWeeks(dateRange.startDate);
    return `Week ${week}  |  ${range}`;
  };

  return (
    <>
      {!dateModalVisible && (
        <AnimatedModal visible={visible} onClose={onClose}>
          <View
            className="bg-white/95 rounded-3xl w-full max-w-md"
            style={{ flexGrow: 0, maxHeight: 480 }}
          >
            {/* Header */}
            <View className="mb-5">
              <Text className="text-xl jakarta-bold text-gray-900">
                Enter S# for Each Group
              </Text>
              {isNoPrevious && (
                <Text className="text-orange-600 text-xs jakarta-regular mt-1">
                  No previous data is available. Please fill in the S# manually
                  for each group.
                </Text>
              )}
            </View>

            {/* Date Range */}
            <View className="flex-row justify-between mb-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-jakarta-medium mb-2 text-sm">
                  Date Range
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setDateModalVisible(true);
                  }}
                  activeOpacity={0.8}
                  className="bg-gray-50 rounded-xl flex-row justify-between items-center px-4"
                  style={{
                    height: 44,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  <Text
                    className={`text-gray-800 font-jakarta-medium ${
                      !dateRange.startDate ? "text-gray-400" : ""
                    }`}
                  >
                    {formatRange() || "Select date range"}
                  </Text>

                  <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="mt-2 mb-4" style={{ maxHeight: 300 }}>
              {sNumber.map((group, index) => (
                <View
                  key={group.group}
                  className="flex-row justify-between items-center mb-2.5 px-3 py-2 bg-gray-50 rounded-xl shadow-sm"
                >
                  <Text className="text-base font-jakarta-semibold text-gray-800">
                    Group {group.group}
                  </Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={group.count === 0 ? "" : group.count.toString()}
                    onChangeText={(value) => handleChange(index, value)}
                    className="bg-white rounded-lg px-3 py-2 w-20 text-center text-gray-800 font-jakarta-medium focus:border-blue-400"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}
            </ScrollView>
            {sNumber.length > 4 && (
              <Text className="text-gray-500 font-jakarta-semibold text-xs text-center mt-1">
                (Scroll to show more)
              </Text>
            )}
            <View className="gap-4 mt-3">
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.9}
                className="rounded-full overflow-hidden shadow-md"
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="py-3.5 rounded-full items-center"
                >
                  <Text className="text-white font-jakarta-semibold text-base tracking-wide">
                    Save
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}

              {!isNoPrevious && (
                <>
                  <View className="flex-row items-center justify-center my-1">
                    <View className="h-[1px] bg-gray-200 w-1/4" />
                    <Text className="mx-2 text-xs text-gray-400">or</Text>
                    <View className="h-[1px] bg-gray-200 w-1/4" />
                  </View>

                  <View className="items-center">
                    <TouchableOpacity
                      onPress={handleGeneratePrev}
                      activeOpacity={0.9}
                      className="flex-row items-center justify-center px-4 py-2.5 rounded-full bg-green-50 border border-green-200 shadow-sm"
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color="#15803d"
                        className="mr-2"
                      />
                      <Text className="text-sm font-jakarta-semibold text-green-700">
                        Generate From Previous Data
                      </Text>
                    </TouchableOpacity>

                    <Text className="text-xs text-gray-500 text-center mt-2 max-w-xs leading-snug">
                      Quickly create form with data from your last saved
                      session.
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </AnimatedModal>
      )}

      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-3xl w-full max-w-md p-6 shadow-md border border-gray-100">
            <Text className="text-lg font-jakarta-semibold text-gray-800 mb-3">
              Select Date Range
            </Text>

            <DateTimePicker
              mode="range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={({ startDate, endDate }) =>
                setDateRange({ startDate, endDate })
              }
              styles={{
                ...defaultStyles,
                day_label: { color: "#1F2937" },
                selected: { backgroundColor: "#3B82F6" },
                selected_label: { color: "white", fontWeight: "600" },
                today: { backgroundColor: "#FBBF24", borderRadius: 8 },
                today_label: { color: "white", fontWeight: "600" },
                range_fill: { backgroundColor: "#E5E7EB" },
                range_end_label: { color: "#FFF" },
                range_start_label: { color: "#FFF" },
                month_label: { color: "#111827", fontWeight: "600" },
                month_selector_label: { color: "#1F2937" },
                year_selector_label: { color: "#1F2937" },
                button_prev: { backgroundColor: "#F3F4F6", borderRadius: 20 },
                button_next: { backgroundColor: "#F3F4F6", borderRadius: 20 },
                button_prev_image: { tintColor: "#3B82F6" },
                button_next_image: { tintColor: "#3B82F6" },
              }}
            />

            <TouchableOpacity
              onPress={() => setDateModalVisible(false)}
              className="mt-4 bg-gray-100 py-3 rounded-full items-center"
            >
              <Text className="text-gray-700 font-jakarta-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
