import { DropdownField } from "@/components/fields/dropdown-field";
import { InputField } from "@/components/fields/input-field";
import schema from "@/schemas/user-form-schema";
import {
  addNewUser,
  deleteUserById,
  updateUserById,
} from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface AddUserFormProps {
  onClose: () => void;
  defaultValues?: Partial<User.UserFormData>;
  userId?: number;
}

export const AddUserForm = ({
  onClose,
  defaultValues,
  userId,
}: AddUserFormProps) => {
  const db = useSQLiteContext();
  const { bottom } = useSafeAreaInsets();
  const isEdit = userId !== undefined;

  const { control, handleSubmit, formState } = useForm<User.UserFormData>({
    defaultValues: {
      fullname: defaultValues?.fullname ?? "",
      purok: defaultValues?.purok ?? "",
      grupo: defaultValues?.grupo ?? "",
      gender: defaultValues?.gender ?? "male",
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (values: User.UserFormData) => {
    if (!formState.isValid) return;

    try {
      if (userId) await updateUserById(userId, values, db);
      else await addNewUser(values, db);

      Toast.show({
        type: "success",
        text1: `User ${isEdit ? "Updated" : "Added"} successfully`,
        text2: "Refresh the list to see the changes",
        swipeable: true,
        visibilityTime: 1500,
        topOffset: 70,
      });

      onClose();
    } catch (error) {
      console.log("Add new user error: ", error);
    }
  };

  const onDeletePress = async () => {
    if (!userId) return;
    try {
      await deleteUserById(userId, db);

      Toast.show({
        type: "success",
        text1: "User deleted successfully",
        text2: "Refresh the list to see the changes",
        swipeable: true,
        visibilityTime: 1500,
        topOffset: 70,
      });
    } catch (error) {
      console.log("onDeletePress error: ", error);
    }
  };

  return (
    <View className="flex-1 mt-2" style={{ marginBottom: bottom + 10 }}>
      <Text className="text-gray-900 text-2xl font-bold mb-6">
        {isEdit ? "Update Kapatid" : "Add New Kapatid"}
      </Text>

      <View className="space-y-4 mb-6 gap-2">
        <View className="space-y-1">
          <Text className="text-gray-800 font-medium text-base mb-2">
            Full Name
          </Text>
          <InputField
            control={control}
            name="fullname"
            placeholder="Enter Full Name"
            bottomSheetInput
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 space-y-1">
            <Text className="text-gray-800 font-medium text-base mb-2">
              Purok
            </Text>
            <InputField
              control={control}
              name="purok"
              placeholder="Enter Purok"
              keyboardType="number-pad"
              bottomSheetInput
            />
          </View>
          <View className="flex-1 space-y-1">
            <Text className="text-gray-800 font-medium text-base  mb-2">
              Grupo
            </Text>
            <InputField
              control={control}
              name="grupo"
              placeholder="Enter Grupo"
              keyboardType="number-pad"
              bottomSheetInput
            />
          </View>
        </View>

        <View className="space-y-1">
          <Text className="text-gray-800 font-medium text-base  mb-2">
            Gender
          </Text>
          <DropdownField
            control={control}
            name="gender"
            placeholder="Select Gender"
            options={[
              {
                value: "male",
                label: "Lalaki",
                leftItem: <Ionicons name="male" size={20} color="#4EA8DE" />,
              },
              {
                value: "female",
                label: "Babae",
                leftItem: <Ionicons name="female" size={20} color="#FF6B6B" />,
              },
            ]}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        {userId && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDeletePress}
            className="flex-1 overflow-hidden rounded-full shadow"
          >
            <LinearGradient
              colors={["#EF4444", "#B91C1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-4 rounded-full"
            >
              <Text className="text-white font-semibold text-center">
                Delete
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(onSubmit)}
          className="flex-1 overflow-hidden rounded-full shadow"
        >
          <LinearGradient
            colors={
              formState.isValid
                ? ["#3B82F6", "#2563EB"]
                : ["#9CA3AF", "#6B7280"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-center">
              {isEdit ? "Update" : "Add"} Now
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
