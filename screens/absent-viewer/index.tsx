import { Header } from "@/components/header";
import { SaveFileView } from "@/components/save-file-view";
import { RootStackParamList } from "@/types/navigation";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InfoModal } from "./components/info-modal";
import { useAbsentViewer } from "./useAbsentViewer";

export default function AbsentViewer() {
  const { purok } = useLocalSearchParams<RootStackParamList["purok"]>();

  const saveFileBottomSheet = useRef<BottomSheetModal>(null);
  const saveFileSheetPoints = useMemo(() => ["40%"], []);
  const {
    sessionData,
    generateAbsenteeForm,
    infoModalVisible,
    setInfoModalVisible,
    dateRange,
    setDateRange,
    notes,
    setNotes,
    weekNumber,
    plottedExcelUri,
  } = useAbsentViewer(purok, saveFileBottomSheet);

  return (
    <SafeAreaView className="flex-1 px-4 pt-4 bg-white">
      <Header
        title="R1-02-03"
        subtitle={`Purok ${purok} | Week ${weekNumber}`}
        buttons={[
          {
            icon: "create-outline",
            color: "#2563eb",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            onPress: () => setInfoModalVisible(true),
          },
          {
            icon: "document-text-outline",
            color: "#16a34a",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            onPress: generateAbsenteeForm,
          },
        ]}
      />

      <ScrollView className="mt-2">
        {sessionData.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-12">
            <View
              className="flex-row items-center justify-between px-4 py-3 rounded-t-2xl"
              style={{
                backgroundColor: "#FEF2F2", // light red tint
                borderBottomWidth: 1,
                borderColor: "#FECACA", // subtle divider
              }}
            >
              <Text className="text-[16px] font-jakarta-semibold text-red-700 tracking-wide">
                {group.purok} - {group.grupo}
              </Text>

              <View className="flex-row items-center gap-1">
                <Text className="text-[14px] text-red-600 font-jakarta-medium">
                  Huwebes
                </Text>
              </View>
            </View>

            <View
              className="bg-white border border-red-100 rounded-b-2xl px-4 py-3 shadow-sm"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              {/* Male Users */}
              {group.firstSession.maleUsers.map((user, index) => (
                <View
                  key={`male-${index}`}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <Text className="text-gray-400 font-jakarta-semibold text-base w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-blue-700 text-[15px] font-jakarta-medium">
                    {user.fullname}
                  </Text>
                </View>
              ))}

              {/* Separator */}
              {group.firstSession.maleUsers.length > 0 &&
                group.firstSession.femaleUsers.length > 0 && (
                  <View className="my-2 border-t border-gray-100" />
                )}

              {/* Female Users */}
              {group.firstSession.femaleUsers.map((user, index) => (
                <View
                  key={`female-${index}`}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <Text className="text-gray-400 font-jakarta-semibold text-base w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-pink-700 text-[15px] font-jakarta-medium">
                    {user.fullname}
                  </Text>
                </View>
              ))}

              {/* Empty State */}
              {group.firstSession.maleUsers.length === 0 &&
                group.firstSession.femaleUsers.length === 0 && (
                  <View className="w-full items-center justify-center p-6">
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color="#9CA3AF"
                      style={{ marginBottom: 4 }}
                    />
                    <Text className="text-neutral-500 text-base italic">
                      Nakasamba po lahat
                    </Text>
                  </View>
                )}
            </View>

            <View className="h-6" />

            <View
              className="flex-row items-center justify-between px-4 py-3 rounded-t-2xl"
              style={{
                backgroundColor: "#EFF6FF", // lighter blue tint
                borderBottomWidth: 1,
                borderColor: "#DBEAFE", // subtle divider
              }}
            >
              <Text className="text-[16px] font-jakarta-semibold text-blue-700 tracking-wide">
                {group.purok} - {group.grupo}
              </Text>

              <View className="flex-row items-center gap-1">
                <Text className="text-[14px] text-blue-600 font-jakarta-medium">
                  Linggo
                </Text>
              </View>
            </View>

            <View
              className="bg-white border border-blue-100 rounded-b-2xl px-4 py-3 shadow-sm"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              {/* Male Users */}
              {group.secondSession.maleUsers.map((user, index) => (
                <View
                  key={`male-${index}`}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <Text className="text-gray-400 font-jakarta-semibold text-base w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-blue-700 text-[15px] font-jakarta-medium">
                    {user.fullname}
                  </Text>
                </View>
              ))}

              {/* Separator */}
              {group.secondSession.maleUsers.length > 0 &&
                group.secondSession.femaleUsers.length > 0 && (
                  <View className="my-2 border-t border-gray-100" />
                )}

              {/* Female Users */}
              {group.secondSession.femaleUsers.map((user, index) => (
                <View
                  key={`female-${index}`}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <Text className="text-gray-400 font-jakarta-semibold text-base w-6 text-right">
                    {index + 1}.
                  </Text>
                  <Text className="text-pink-700 text-[15px] font-jakarta-medium">
                    {user.fullname}
                  </Text>
                </View>
              ))}

              {/* Empty State */}
              {group.secondSession.maleUsers.length === 0 &&
                group.secondSession.femaleUsers.length === 0 && (
                  <View className="w-full items-center justify-center p-6">
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color="#9CA3AF"
                      style={{ marginBottom: 4 }}
                    />
                    <Text className="text-neutral-500 text-base italic">
                      Nakasamba po lahat
                    </Text>
                  </View>
                )}
            </View>
          </View>
        ))}
      </ScrollView>

      <InfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        setDateRange={setDateRange}
        dateRange={dateRange}
        notes={notes}
        setNotes={setNotes}
      />

      <BottomSheetModal
        index={1}
        ref={saveFileBottomSheet}
        snapPoints={saveFileSheetPoints}
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
        <BottomSheetView className="flex-1 px-2 pb-6 pt-1">
          <SaveFileView
            fileUri={plottedExcelUri}
            onClose={() => saveFileBottomSheet.current?.close()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
