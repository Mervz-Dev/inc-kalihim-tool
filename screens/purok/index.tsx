import { Dropdown, DropdownOption } from "@/components/dropdown";
import { AddUserForm } from "@/components/form/add-user-form";
import { SESSION_KEY } from "@/constants/session";
import { getGrupoByPurok } from "@/services/sql-lite/db";
import { RootStackParamList } from "@/types/navigation";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaFrame } from "react-native-safe-area-context";
import { GrupoList } from "./components/grupo-list";
import { GrupoView } from "./components/grupo-view";
import { ResetConfirmationView } from "./components/reset-confirmation-view";

const SESSION_OPTIONS: DropdownOption[] = [
  {
    value: "first",
    label: "First Session (Wed/Thu)",
  },
  {
    value: "second",
    label: "Second Session (Sat/Sun)",
  },
];

type Session = "first" | "second";

export default function Purok() {
  const { purok } = useLocalSearchParams<RootStackParamList["purok"]>();

  const [sessionSelected, setSessionSelected] = useState<Session>("first");
  const [maleGrupo, setMaleGrupo] = useState<User.PurokGrupoStat[]>([]);
  const [femaleGrupo, setFemaleGrupo] = useState<User.PurokGrupoStat[]>([]);
  const db = useSQLiteContext();
  const { height } = useSafeAreaFrame();

  const groupViewBottomSheet = useRef<BottomSheetModal>(null);
  const addUserBottomSheet = useRef<BottomSheetModal>(null);
  const resetSessionBottomSheet = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["85%"], []);
  const addUserSheetPoints = useMemo(() => ["50%"], []);
  const resetSessionSheetPoints = useMemo(() => ["35%"], []);

  const initFetch = async () => {
    try {
      const maleResult = await getGrupoByPurok(purok, "male", db);
      const femaleResult = await getGrupoByPurok(purok, "female", db);

      setMaleGrupo(maleResult);
      setFemaleGrupo(femaleResult);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSession = async () => {
    try {
      const savedSession = await AsyncStorage.getItem(SESSION_KEY);
      if (savedSession) {
        setSessionSelected(savedSession as Session);
      }
    } catch (error) {
      console.error("Failed to load session", error);
    }
  };

  useEffect(() => {
    loadSession();
    initFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSessionUpdate = async (session: Session) => {
    setSessionSelected(session);
    await AsyncStorage.setItem(SESSION_KEY, session);
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-white">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <Text className="text-gray-900 text-2xl font-bold">
            Purok {purok}
          </Text>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => resetSessionBottomSheet?.current?.present()}
            className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shadow-sm"
          >
            <Ionicons name="trash-bin" size={20} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={initFetch}
            className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shadow-sm"
          >
            <Ionicons name="refresh-sharp" size={20} color="#f59e0b" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => addUserBottomSheet.current?.present()}
            className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm"
          >
            <Ionicons name="person-add" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row items-center gap-2 mt-6 mb-6">
        {/* Attendance Viewer */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/attendance-viewer",
              params: { purok },
            })
          }
          className="flex-1 rounded-full shadow-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center justify-center px-6 py-3 rounded-full"
          >
            <Ionicons
              name="checkmark-done-circle-outline"
              size={20}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text className="text-white font-bold text-sm">R1-05</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Percent Generator */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/percent-generator",
              params: { purok, groupCount: maleGrupo.length.toString() },
            })
          }
          className="flex-1 rounded-full shadow-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#FACC15", "#EAB308"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center justify-center px-6 py-3 rounded-full"
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text className="text-white font-bold text-sm">R1-04</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Absent Viewer */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/absent-viewer",
              params: { purok },
            })
          }
          className="flex-1 rounded-full shadow-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#F87171", "#B91C1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center justify-center px-6 py-3 rounded-full"
          >
            <Ionicons
              name="person-remove-outline"
              size={20}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text className="text-white font-bold text-sm">R1-02-03</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Dropdown
        options={SESSION_OPTIONS}
        value={sessionSelected}
        onChange={(value) => handleSessionUpdate(value as Session)}
      />

      <GrupoList
        maleData={maleGrupo}
        femaleData={femaleGrupo}
        onItemPress={(item, gender) => {
          groupViewBottomSheet.current?.present({ item, gender });
        }}
      />

      <BottomSheetModal
        index={1}
        maxDynamicContentSize={height * 0.9}
        ref={groupViewBottomSheet}
        snapPoints={snapPoints}
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
        {({ data }) => {
          return (
            <GrupoView
              purok={data.item.purok}
              grupo={data.item.grupo}
              gender={data.gender}
              session={sessionSelected}
              onClose={() => groupViewBottomSheet.current?.close()}
            />
          );
        }}
      </BottomSheetModal>

      <BottomSheetModal
        index={1}
        ref={addUserBottomSheet}
        snapPoints={addUserSheetPoints}
        keyboardBehavior="interactive"
        onDismiss={initFetch}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView className="flex-1 px-6 pt-2">
          <AddUserForm
            defaultValues={{ purok: purok }}
            onClose={() => addUserBottomSheet.current?.close()}
          />
        </BottomSheetView>
      </BottomSheetModal>

      <BottomSheetModal
        index={1}
        ref={resetSessionBottomSheet}
        snapPoints={resetSessionSheetPoints}
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
        <BottomSheetView className="flex-1 px-6 pt-2">
          <ResetConfirmationView
            purok={purok}
            onClose={() => resetSessionBottomSheet?.current?.close()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
