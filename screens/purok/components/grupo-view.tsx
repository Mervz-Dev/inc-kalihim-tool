import { AddUserForm } from "@/components/form/add-user-form";
import {
  getUsersByPurokGrupo,
  updateSessionMark,
} from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserCard } from "./user-card";

interface GrupoViewProps {
  purok: string;
  grupo: string;
  gender: User.Gender;
  session: "first" | "second";
  onClose: () => void;
}

export const GrupoView = ({
  purok,
  grupo,
  gender,
  session,
}: GrupoViewProps) => {
  const [users, setUsers] = useState<User.User[]>([]);
  const db = useSQLiteContext();
  const { bottom } = useSafeAreaInsets();

  const editUserBottomSheet = useRef<BottomSheetModal>(null);
  const editSheetPoints = useMemo(() => ["50%"], []);

  const initFetch = async () => {
    try {
      const result = await getUsersByPurokGrupo({ purok, grupo, gender }, db);
      setUsers(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSheetChange = (index: number) => {
    if (index <= 0) {
      initFetch();
    }
  };

  useEffect(() => {
    initFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggleStatus = async (id: number) => {
    try {
      await updateSessionMark(id, session, db);

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== id) return user;

          const key = session === "first" ? "firstSession" : "secondSession";
          return { ...user, [key]: !user[key] };
        })
      );
    } catch (error) {
      console.log("onToggle error: ", error);
    }
  };

  const onOpenEditUser = (item: User.User) => {
    editUserBottomSheet.current?.present(item);
  };

  return (
    <View className="flex-1 mt-2 px-4" style={{ marginBottom: bottom + 10 }}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-900 text-2xl font-jakarta-bold">
          {gender === "male" ? "Lalaki" : "Babae"} {purok} - {grupo}
        </Text>
        <Text className="text-gray-500 font-jakarta-semibold text-base">
          {session === "first" ? "📅 Wed/Thu" : "📅 Sat/Sun"}
        </Text>
      </View>

      <View className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
        <View className="flex-row items-center mb-3">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6B7280"
          />
          <Text className="ml-2 text-gray-600 font-jakarta-regular flex-1">
            Tap to toggle Present/Absent. Long-press to Edit or Delete user.
          </Text>
        </View>
        <View className="flex-row justify-around">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-4 bg-green-500 rounded-md border border-gray-200" />
            <Text className="text-gray-700 font-jakarta-medium text-sm">
              Present
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-4 bg-red-500 rounded-md border border-gray-200" />
            <Text className="text-gray-700 font-jakarta-medium text-sm">
              Absent
            </Text>
          </View>
        </View>
      </View>

      <BottomSheetScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-2">
          {users.map((m, index) => (
            <View key={index}>
              {
                <UserCard
                  onOpenEditUser={onOpenEditUser}
                  onToggleStatus={onToggleStatus}
                  session={session}
                  user={m}
                />
              }
            </View>
          ))}
        </View>
        <View className="mb-6" />
      </BottomSheetScrollView>

      <BottomSheetModal
        index={1}
        ref={editUserBottomSheet}
        snapPoints={editSheetPoints}
        keyboardBehavior="interactive"
        onChange={handleSheetChange}
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
          <BottomSheetView className="flex-1 px-6 pt-4">
            <AddUserForm
              onClose={() => editUserBottomSheet?.current?.close()}
              defaultValues={{
                purok: data.purok,
                grupo: data.grupo,
                fullname: data.fullname,
                gender: data.gender,
              }}
              userId={data.id}
            />
          </BottomSheetView>
        )}
      </BottomSheetModal>
    </View>
  );
};
