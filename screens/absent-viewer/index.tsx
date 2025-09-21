import { RootStackParamList } from "@/types/navigation";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PdfViewer } from "./components/pdf-viewer";
import { useAbsentViewer } from "./useAbsentViewer";

export default function AbsentViewer() {
  const { purok } = useLocalSearchParams<RootStackParamList["purok"]>();
  const { sessionData, createSessionPdf } = useAbsentViewer(purok);

  const pdfViewerBottomSheet = useRef<BottomSheetModal>(null);
  const pdfViewerSheetPoints = useMemo(() => ["85%"], []);

  return (
    <SafeAreaView className="flex-1 px-4 pt-4 bg-white">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="p-1 rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-black text-2xl font-bold">Absent Viewer</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={createSessionPdf}
          className="p-2 rounded-full bg-blue-50"
        >
          <Ionicons name="share" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="mt-4">
        {sessionData.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-12">
            <View className="flex-row items-center justify-between bg-red-50 px-3 py-2 rounded-t-lg">
              <Text className="text-lg font-semibold text-red-600">
                {group.purok} - {group.grupo}
              </Text>
              <Text className="text-base text-neutral-600 font-medium">
                Wed/Thu
              </Text>
            </View>

            <View className="bg-white border border-red-100 rounded-b-lg px-3 py-2">
              {group.firstSession.maleUsers.map((user, index) => (
                <View
                  key={`male-${index}`}
                  className="flex-row items-center gap-2 py-1"
                >
                  <Text className="text-gray-400 font-semibold text-lg w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-blue-800 text-lg">{user.fullname}</Text>
                </View>
              ))}

              {group.firstSession.maleUsers?.length > 0 &&
                group.firstSession.femaleUsers?.length > 0 && (
                  <View className="my-2 border-t border-gray-100" />
                )}

              {group.firstSession.femaleUsers.map((user, index) => (
                <View
                  key={`female-${index}`}
                  className="flex-row items-center gap-2 py-1"
                >
                  <Text className="text-gray-400 font-semibold text-lg w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-pink-700 text-lg">{user.fullname}</Text>
                </View>
              ))}

              {group.firstSession.maleUsers?.length <= 0 &&
                group.firstSession.femaleUsers?.length <= 0 && (
                  <View className="w-full items-center justify-center p-6">
                    <Text className="text-neutral-500 text-base italic">
                      Nakasamba po lahat
                    </Text>
                  </View>
                )}
            </View>

            <View className="h-6" />

            <View className="flex-row items-center justify-between bg-blue-50 px-3 py-2 rounded-t-lg">
              <Text className="text-lg font-semibold text-blue-600">
                {group.purok} - {group.grupo}
              </Text>
              <Text className="text-base text-neutral-600 font-medium">
                Sat/Sun
              </Text>
            </View>

            <View className="bg-white border border-blue-100 rounded-b-lg px-3 py-2">
              {group.secondSession.maleUsers.map((user, index) => (
                <View
                  key={`male-${index}`}
                  className="flex-row items-center gap-2 py-1"
                >
                  <Text className="text-gray-400 font-semibold text-lg w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-blue-800 text-lg">{user.fullname}</Text>
                </View>
              ))}

              {group.secondSession.maleUsers?.length > 0 &&
                group.secondSession.femaleUsers?.length > 0 && (
                  <View className="my-2 border-t border-gray-100" />
                )}

              {group.secondSession.femaleUsers.map((user, index) => (
                <View
                  key={`female-${index}`}
                  className="flex-row items-center gap-2 py-1"
                >
                  <Text className="text-gray-400 font-semibold text-lg w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-pink-700 text-lg">{user.fullname}</Text>
                </View>
              ))}

              {group.secondSession.maleUsers?.length <= 0 &&
                group.secondSession.femaleUsers?.length <= 0 && (
                  <View className="w-full items-center justify-center p-6">
                    <Text className="text-neutral-500 text-base italic">
                      Nakasamba po lahat
                    </Text>
                  </View>
                )}
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomSheetModal
        index={1}
        ref={pdfViewerBottomSheet}
        snapPoints={pdfViewerSheetPoints}
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
        {({ data }) => (
          <BottomSheetView className="flex-1 px-6 pt-2 bg-white">
            <PdfViewer uri={data} />
          </BottomSheetView>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
