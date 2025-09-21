import { RootStackParamList } from "@/types/navigation";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAttendanceViewer } from "./useAttendanceViewer";

export default function AbsentViewer() {
  const { purok } = useLocalSearchParams<RootStackParamList["purok"]>();
  const { attendanceData } = useAttendanceViewer(purok);

  const renderRow = (user: User.User, index: number) => {
    const attendedOnce = user.firstSession || user.secondSession;

    return (
      <View
        key={user.id || index}
        className="flex-row border-b border-gray-200 px-3 py-2 items-center"
      >
        <Text
          className={`flex-1 text-base ${
            attendedOnce ? "font-bold text-black" : "text-gray-500"
          }`}
        >
          {user.fullname}
        </Text>

        <View className="w-12 items-center border-l border-gray-200">
          {user.firstSession ? (
            <Ionicons name="close-circle" size={20} color="red" />
          ) : (
            <View style={{ width: 20, height: 20 }} />
          )}
        </View>

        <View className="w-12 items-center border-l border-gray-200">
          {user.secondSession ? (
            <Ionicons name="close-circle" size={20} color="red" />
          ) : (
            <View style={{ width: 20, height: 20 }} />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 px-4 pt-4  bg-white">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-1 rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-black text-2xl font-bold">
            Attendance Viewer
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mt-2">
        {attendanceData.map((group, groupIndex) => (
          <View
            key={`${group.purok}-${group.grupo}-${groupIndex}`}
            className="mb-6 rounded-2xl border border-gray-300 bg-white shadow"
          >
            <View className="bg-gray-100 px-4 py-3 rounded-t-2xl">
              <Text className="font-semibold text-lg">
                {`${group.purok} - ${group.grupo}`}
              </Text>
            </View>

            <View className="flex-row bg-gray-50 border-b border-gray-300 px-3 py-2">
              <Text className="flex-1 font-medium">Name</Text>
              <Text className="w-12 text-center font-medium">W/Th</Text>
              <Text className="w-12 text-center font-medium">S/S</Text>
            </View>

            {/* Male Section */}
            <View className="bg-gray-200 px-3 py-2">
              <Text className="font-semibold text-blue-500">Lalaki</Text>
            </View>
            {group.maleUsers.map(renderRow)}

            {/* Female Section */}
            <View className="bg-gray-200 px-3 py-2">
              <Text className="font-semibold text-pink-500">Babae</Text>
            </View>
            {group.femaleUsers.map(renderRow)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
