import { getPurokList, getUserAndSessionCounts } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddUserForm } from "@/components/form/add-user-form";
import { router } from "expo-router";
import { AboutButton } from "./components/about-button";
import { CodesButton } from "./components/codes-button";
import { PurokList } from "./components/purok-list";
import { SearchButton } from "./components/search-button";

import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function Dashboard() {
  const [purokList, setPurokList] = useState<User.PurokCount[]>([]);
  const [attendanceHealth, setAttendanceHealth] =
    useState<User.SessionAttendanceHealth>({
      totalMarkedSessions: 0,
      userTotalSessions: 0,
    });
  const db = useSQLiteContext();

  const addUserSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  const initFetch = async () => {
    try {
      const purokListResult = await getPurokList(db);
      const attendanceHealthResult = await getUserAndSessionCounts(db);

      setPurokList(purokListResult);

      if (attendanceHealthResult) {
        setAttendanceHealth(attendanceHealthResult);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initFetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onItemPress = (item: User.PurokCount) => {
    router.push({
      pathname: "/purok",
      params: {
        purok: item.purok,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 px-4 pt-4 bg-white">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-3xl font-extrabold text-gray-900">Dashboard</Text>

        <View className="flex-row items-center space-x-3 gap-2">
          {/* <TouchableOpacity
            activeOpacity={0.8}
            onPress={initFetch}
            className="bg-yellow-100 p-2 rounded-full shadow-sm"
          >
            <Ionicons name="refresh-outline" size={24} color={"#f59e0b"} />
          </TouchableOpacity> */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              router.push("/settings");
            }}
            className="bg-gray-100 p-2 rounded-full shadow-sm"
          >
            <Ionicons name="settings" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mt-4">
        <AboutButton />
        <CodesButton />

        <SearchButton
          onClickUser={(user) => {
            addUserSheetRef.current?.present(user);
          }}
        />
      </View>

      {purokList.length > 0 && (
        <View className="flex-row items-center gap-3 mt-4">
          {/* Progress Bar */}
          <View className="flex-1 h-5 bg-red-200 rounded-full overflow-hidden">
            <LinearGradient
              colors={["#22c55e", "#16a34a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${
                  attendanceHealth.userTotalSessions > 0
                    ? ((attendanceHealth.userTotalSessions -
                        attendanceHealth.totalMarkedSessions) /
                        attendanceHealth.userTotalSessions) *
                      100
                    : 0
                }%`,
                height: "100%",
                borderRadius: 9999,
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: 6,
              }}
            >
              <Text className="text-white text-xs font-semibold">
                {attendanceHealth.userTotalSessions > 0
                  ? `${Math.round(
                      ((attendanceHealth.userTotalSessions -
                        attendanceHealth.totalMarkedSessions) /
                        attendanceHealth.userTotalSessions) *
                        100
                    )}%`
                  : "0%"}
              </Text>
            </LinearGradient>
          </View>
        </View>
      )}

      <PurokList
        data={purokList}
        onItemPress={onItemPress}
        onAddPress={() => addUserSheetRef.current?.present()}
      />

      <BottomSheetModal
        index={1}
        ref={addUserSheetRef}
        snapPoints={snapPoints}
        keyboardBehavior="interactive"
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        onDismiss={initFetch}
      >
        {({ data }) => (
          <BottomSheetView className="flex-1 px-6 pt-2 bg-white">
            <AddUserForm
              onClose={() => addUserSheetRef.current?.close()}
              userId={data?.id}
              defaultValues={
                data
                  ? {
                      fullname: data?.fullname || "",
                      purok: data?.purok || "",
                      grupo: data?.grupo || "",
                      gender: data?.gender || "male",
                    }
                  : undefined
              }
            />
          </BottomSheetView>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
