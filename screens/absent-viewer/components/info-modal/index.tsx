import { ActionButton } from "@/components/action-button";
import { getNumberOfWeeks, getRangeTextFormat } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from "react-native-ui-datepicker";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  dateRange: { startDate?: DateType; endDate?: DateType };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ startDate?: DateType; endDate?: DateType }>
  >;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const InfoModal = ({
  visible,
  onClose,
  dateRange,
  setDateRange,
  notes,
  setNotes,
}: InfoModalProps) => {
  const defaultStyles = useDefaultStyles();
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const formatRange = () => {
    const range = getRangeTextFormat(dateRange.startDate, dateRange.endDate);
    const week = getNumberOfWeeks(dateRange.startDate);
    return `Week ${week}  |  ${range}`;
  };

  return (
    <>
      {/* Main Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50 px-5 pb-10">
          <View className="bg-white/95 rounded-3xl w-full max-w-md p-6 border border-gray-100">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-jakarta-bold text-gray-900">
                Info Details
              </Text>
            </View>

            {/* Date Range Field */}
            <View className="mb-5">
              <Text className="text-gray-600 font-jakarta-medium mb-2 text-sm">
                Date Range
              </Text>
              <TouchableOpacity
                onPress={() => setDateModalVisible(true)}
                activeOpacity={0.8}
                className="bg-gray-50 border border-gray-200 rounded-xl flex-row justify-between items-center px-4"
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

            {/* Notes Input */}
            <View className="mb-6">
              <Text className="text-gray-600 font-jakarta-medium mb-2 text-sm">
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Enter your notes here..."
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-jakarta-regular bg-gray-50 min-h-[100px] text-base"
              />
            </View>

            {/* Save Button */}
            <ActionButton
              colors={["#3B82F6", "#2563EB"]}
              label="Save"
              onPress={onClose}
              textColor="white"
              textClassName="text-white font-jakarta-semibold text-base tracking-wide text-center"
              style={{
                borderRadius: 9999,
                minHeight: 42,
                flex: undefined,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
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
                month_label: { color: "#111827", fontWeight: "600" },
                month_selector_label: { color: "#1F2937" },
                year_selector_label: { color: "#1F2937" },
                button_prev: { backgroundColor: "#F3F4F6", borderRadius: 20 },
                button_next: { backgroundColor: "#F3F4F6", borderRadius: 20 },
                button_prev_image: { tintColor: "#3B82F6" },
                button_next_image: { tintColor: "#3B82F6" },
                range_end_label: { color: "#FFF" },
                range_start_label: { color: "#FFF" },
              }}
            />

            <TouchableOpacity
              onPress={() => setDateModalVisible(false)}
              className="mt-4 bg-gray-100 py-3 rounded-full items-center border border-gray-200"
            >
              <Text className="text-gray-700 font-jakarta-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
