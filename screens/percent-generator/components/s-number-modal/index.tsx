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
  handleReset: () => void;
  dateRange: { startDate?: DateType; endDate?: DateType };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ startDate?: DateType; endDate?: DateType }>
  >;
}

export const SNumberModal = ({
  visible,
  onClose,
  sNumber,
  handleChange,
  handleReset,
  dateRange,
  setDateRange,
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
      {/* Main Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50 px-5 pb-10">
          <View className="bg-white/95 rounded-3xl w-full max-w-md p-6 border border-gray-100">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-gray-900">
                Enter S# for Each Group
              </Text>

              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.8}
                className="px-2 py-1.5 rounded-lg border border-red-300 bg-red-100 flex-row items-center justify-center"
              >
                <Ionicons
                  name="trash-outline"
                  size={14}
                  color="#b91c1c"
                  className="mr-1"
                />
                <Text className="text-xs text-red-700 font-medium">
                  Clear Prev
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between mb-5">
              {/* Date Range */}
              <View className="flex-1">
                <Text className="text-gray-600 font-medium mb-2 text-sm">
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
                    className={`text-gray-800 font-medium ${
                      !dateRange.startDate ? "text-gray-400" : ""
                    }`}
                  >
                    {formatRange() || "Select date range"}
                  </Text>

                  <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable List */}
            <ScrollView className="mt-2 mb-6" style={{ maxHeight: 300 }}>
              {sNumber.map((group, index) => (
                <View
                  key={group.group}
                  className="flex-row justify-between items-center mb-2.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl shadow-sm"
                >
                  <Text className="text-base font-semibold text-gray-800">
                    Group {group.group}
                  </Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={group.count === 0 ? "" : group.count.toString()}
                    onChangeText={(value) => handleChange(index, value)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 w-20 text-center text-gray-800 font-medium focus:border-blue-400"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Buttons */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.9}
                className="rounded-full overflow-hidden shadow-sm"
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="py-3.5 rounded-full items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Save
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
        <View
          className="flex-1 justify-center items-center bg-black/50 px-5"
          pointerEvents="box-none"
        >
          <View
            className="bg-white rounded-3xl p-6 w-full max-w-md"
            pointerEvents="auto"
          >
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Select Date Range
            </Text>

            <DateTimePicker
              mode="range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={({ startDate, endDate }) =>
                setDateRange({ startDate, endDate })
              }
              styles={defaultStyles}
            />

            <TouchableOpacity
              onPress={() => setDateModalVisible(false)}
              className="mt-4 bg-gray-100 py-3 rounded-full items-center border border-gray-200"
            >
              <Text className="text-gray-700 font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
