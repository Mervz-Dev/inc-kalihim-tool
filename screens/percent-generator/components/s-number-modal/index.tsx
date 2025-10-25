import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SNumberModalProps {
  visible: boolean;
  onClose: () => void;
  weekNumber: string;
  monthNumber: string;
  setWeekNumber: (val: string) => void;
  setMonthNumber: (val: string) => void;
  sNumber: { group: number; count: number }[];
  handleChange: (index: number, value: string) => void;
  handleSave: () => void;
}

export const SNumberModal = ({
  visible,
  onClose,
  weekNumber,
  monthNumber,
  setWeekNumber,
  setMonthNumber,
  sNumber,
  handleChange,
  handleSave,
}: SNumberModalProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 justify-center items-center bg-black/50 px-5 pb-10">
      <View className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100">
        {/* Header */}
        <Text className="text-2xl font-bold mb-5 text-gray-900 text-center">
          Enter S# for Each Group
        </Text>

        {/* Week / Month Inputs */}
        <View className="flex-row justify-between mb-5">
          <View className="flex-1 mr-2">
            <Text className="text-gray-600 font-medium mb-1 text-sm">
              Week #
            </Text>
            <TextInput
              placeholder="e.g. 42"
              keyboardType="number-pad"
              value={weekNumber?.toString() || ""}
              onChangeText={setWeekNumber}
              className="bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 font-semibold focus:border-blue-400"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-gray-600 font-medium mb-1 text-sm">
              Month #
            </Text>
            <TextInput
              placeholder="e.g. 10"
              keyboardType="number-pad"
              value={monthNumber?.toString() || ""}
              onChangeText={setMonthNumber}
              className="bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 font-semibold focus:border-blue-400"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Scrollable List */}
        <ScrollView className="mb-6" style={{ maxHeight: 300 }}>
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
        <View className="space-y-3 gap-2">
          <TouchableOpacity
            onPress={handleSave}
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
                Save Changes
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            className="rounded-full bg-gray-100 py-3.5 items-center border border-gray-200"
          >
            <Text className="text-gray-700 font-semibold text-base">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
