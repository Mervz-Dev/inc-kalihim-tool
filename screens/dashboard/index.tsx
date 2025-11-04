import {
  deleteUsersByPurok,
  getPurokList,
  getUserAndSessionCounts,
} from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddUserForm } from "@/components/form/add-user-form";
import { router } from "expo-router";
import { AboutButton } from "./components/about-button";
import { CodesButton } from "./components/codes-button";
import { PassGetterButton } from "./components/pass-getter-button";
import { PurokList } from "./components/purok-list";
import { SearchButton } from "./components/search-button";

import { InfoCarousel } from "./components/info-carousel";

import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

import { AnimatedModal } from "@/components/animated-modal";
import { delay } from "@/utils/delay";
import { useLoading } from "@/utils/hooks/useLoading";
import { AddDummyUsersSheet } from "./components/add-dummy-users-sheet";

export default function Dashboard() {
  const [purokList, setPurokList] = useState<User.PurokCount[]>([]);
  const [selectedPurok, setSelectedPurok] = useState<string | null>(null);
  const [attendanceHealth, setAttendanceHealth] =
    useState<User.SessionAttendanceHealth>({
      totalMarkedSessions: 0,
      userTotalSessions: 0,
    });
  const db = useSQLiteContext();
  const loader = useLoading();

  const addUserSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  const dummySheetRef = useRef<BottomSheetModal | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  useEffect(() => {
    Toast.show({
      type: "success",
      text1: "Unlocked",
      text2: "Access granted",
      visibilityTime: 2000,
    });
  }, []);

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

  const onLongItemPress = (item: User.PurokCount) => {
    setSelectedPurok(item.purok);
    setShowDeleteModal(true);
  };

  const handleDeletePurok = async () => {
    try {
      setShowDeleteModal(false);
      loader.show("Deleting...");
      if (selectedPurok) {
        await delay(650);
        await deleteUsersByPurok(db, selectedPurok);
      }
      await initFetch();
    } catch (error) {
      console.log("handleDeletePurok error: ", error);
    } finally {
      loader.hide();
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 pt-4 bg-white">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center mb-3">
          <Image
            source={require("@/assets/icons/app-icon.png")}
            className="w-10 h-10 rounded-lg"
            resizeMode="cover"
          />
          <Text
            // style={{ fontFamily: "Poppins-Bold" }}
            className="text-3xl font-jakarta-bold text-gray-900 tracking-tight mt-1"
          >
            Kalihim Board
          </Text>
        </View>

        <View className="flex-row items-center space-x-3 gap-2">
          <SearchButton
            onClickUser={(user) => {
              addUserSheetRef.current?.present(user);
            }}
          />
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
        <PassGetterButton />
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
              <Text className="text-white text-xs font-jakarta-semibold">
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
        onAddDummyList={() => dummySheetRef.current?.present()}
        onLongItemPress={onLongItemPress}
      />

      <InfoCarousel />

      {/* <View
        className="mt-4 mb-5 p-2.5 border-l-4 border-blue-500 rounded-md flex-row items-start"
        style={{ backgroundColor: "rgba(219, 234, 254, 0.9)" }}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color="#2563eb"
          style={{ marginTop: 2 }}
        />
        <Text className="ml-2 text-blue-800  text-[12px] font-jakarta-regular leading-snug flex-1">
          For{" "}
          <Text className="font-jakarta-semibold">
            personal kalihim use only
          </Text>
          . Data is{" "}
          <Text className="font-jakarta-semibold">stored locally</Text>,{" "}
          <Text className="font-jakarta-semibold">not shared online</Text>, and{" "}
          <Text className="font-jakarta-semibold">cleared weekly</Text>. Use the{" "}
          <Text className="font-jakarta-semibold">same forms</Text> for
          consistency, and{" "}
          <Text className="font-jakarta-semibold text-red-600">
            please do not share data publicly
          </Text>
          .
        </Text>
      </View> */}

      <BottomSheetModal
        index={1}
        ref={addUserSheetRef}
        snapPoints={snapPoints}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
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

      <AddDummyUsersSheet
        bottomSheetRef={dummySheetRef}
        onClose={() => {
          initFetch();
        }}
      />

      <AnimatedModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <View className="items-center px-6">
          {/* Icon Section */}
          <View className="bg-red-100 p-4 rounded-full mb-4">
            <Ionicons name="trash-bin" size={36} color="#ef4444" />
          </View>

          {/* Title */}
          <Text className="text-lg font-jakarta-bold text-gray-900 mb-1 text-center">
            Delete Purok {selectedPurok}
          </Text>

          {/* Description */}
          <Text className="text-gray-500 font-jakarta-regular text-center text-sm mb-6 leading-relaxed">
            This will permanently remove all users associated with this purok.
            This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3 w-full mt-1">
            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              activeOpacity={0.9}
              className="flex-1 bg-gray-100 rounded-full py-3 items-center justify-center"
            >
              <Text className="text-gray-700 font-jakarta-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeletePurok}
              activeOpacity={0.9}
              className="flex-1 bg-red-500 rounded-full py-3 items-center justify-center shadow-sm"
            >
              <Text className="text-white font-jakarta-semibold text-base">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>

      {/* Background image at bottom 25% */}
      <Image
        source={require("@/assets/images/colors-wave.jpg")} // replace with your image
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.4,
          height: "25%", // bottom 25% of screen
          width: "120%",
          resizeMode: "cover",
          zIndex: -1, // behind content
        }}
      />
    </SafeAreaView>
  );
}
