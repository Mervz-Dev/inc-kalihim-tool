import { Dropdown, DropdownOption } from "@/components/dropdown";
import { AddUserForm } from "@/components/form/add-user-form";
import { Header } from "@/components/header";
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
      <Header
        title={`Purok ${purok}`}
        showBack
        buttons={[
          {
            icon: "trash-bin",
            color: "#ef4444",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            onPress: () => resetSessionBottomSheet?.current?.present(),
          },
          {
            icon: "refresh-sharp",
            color: "#f59e0b",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            onPress: initFetch,
          },
          {
            icon: "person-add",
            color: "#2563eb",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            onPress: () => addUserBottomSheet.current?.present(),
          },
        ]}
      />

      <View className="flex-row gap-2 mt-3 mb-4">
        {/* Attendance Viewer */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/attendance-viewer",
              params: { purok },
            })
          }
          className="flex-1 rounded-xl shadow-sm overflow-hidden"
        >
          <LinearGradient
            colors={["#60A5FA", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-col items-center justify-center px-2.5 py-3 rounded-xl"
          >
            <Ionicons
              name="checkmark-done-circle-outline"
              size={20}
              color="white"
            />
            <Text className="text-white font-semibold text-xs mt-1">R1-05</Text>
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
          className="flex-1 rounded-xl shadow-sm overflow-hidden"
        >
          <LinearGradient
            colors={["#FACC15", "#CA8A04"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-col items-center justify-center px-2.5 py-3 rounded-xl"
          >
            <Ionicons name="stats-chart-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-xs mt-1">R1-04</Text>
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
          className="flex-1 rounded-xl shadow-sm overflow-hidden"
        >
          <LinearGradient
            colors={["#FB7185", "#B91C1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-col items-center justify-center px-2.5 py-3 rounded-xl"
          >
            <Ionicons name="person-remove-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-xs mt-1">
              R1-02-03
            </Text>
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
