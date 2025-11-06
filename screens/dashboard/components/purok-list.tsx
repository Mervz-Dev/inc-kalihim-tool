import { ActionButton } from "@/components/action-button";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PurokListProps {
  data: User.PurokCount[];
  onItemPress: (item: User.PurokCount) => void;
  onLongItemPress: (item: User.PurokCount) => void;
  onAddPress: () => void;
  onAddDummyList: () => void;
}

export const PurokList = ({
  data,
  onItemPress,
  onAddPress,
  onAddDummyList,
  onLongItemPress,
}: PurokListProps) => {
  const renderItem: ListRenderItem<User.PurokCount> = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onItemPress(item)}
        onLongPress={() => onLongItemPress(item)}
        delayLongPress={300}
        className="mt-3 rounded-2xl shadow-md overflow-hidden"
      >
        {/* Wrap LinearGradient in a View to fix iOS alignment */}
        <View className="overflow-hidden rounded-2xl">
          <LinearGradient
            colors={["#2563eb", "#1e40af"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <View className="flex-row justify-between items-center">
              {/* Left side */}
              <View className="flex-1 justify-center">
                <Text
                  className="text-white text-2xl font-jakarta-extrabold"
                  style={{ lineHeight: 28 }}
                >
                  Purok {item.purok}
                </Text>
                <Text
                  className="text-gray-200 text-sm mt-1"
                  style={{ lineHeight: 18 }}
                >
                  {item.grupoCount} Grupo{item.grupoCount > 1 ? "s" : ""}
                </Text>
              </View>

              {/* Right side */}
              <View className="flex-col justify-center items-end">
                {/* Total Users */}
                <View
                  className="flex-row items-center rounded-full px-3 py-1"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Ionicons name="people" size={18} color="white" />
                  <Text
                    className="text-white font-jakarta-semibold ml-1"
                    style={{ lineHeight: 18 }}
                  >
                    {item.userCount}
                  </Text>
                </View>

                {/* Male/Female counts */}
                <View className="flex-row mt-2">
                  <View
                    className="flex-row items-center rounded-full px-2 py-1 mr-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="woman" size={16} color="#f472b6" />
                    <Text
                      className="text-white text-sm font-jakarta-semibold ml-1"
                      style={{ lineHeight: 16 }}
                    >
                      {item.femaleCount}
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center rounded-full px-2 py-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="man" size={16} color="#60a5fa" />
                    <Text
                      className="text-white text-sm font-jakarta-semibold ml-1"
                      style={{ lineHeight: 16 }}
                    >
                      {item.maleCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  if (data.length <= 0) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Ionicons
          name="people-outline"
          size={64}
          color="#cbd5e1"
          className="mb-6"
        />

        <Text className="text-center text-2xl font-jakarta-bold text-gray-800 mb-2">
          Walang Purok pa
        </Text>

        <Text className="text-center font-jakarta-regular text-gray-500 text-base mb-8">
          Tap a button below to add a new kapatid or generate a dummy list.
        </Text>

        <View className="w-full space-y-4 gap-3">
          {/* Add Kapatid */}
          <ActionButton
            colors={["#3B82F6", "#2563EB"]}
            label="Add Kapatid"
            onPress={onAddPress}
            textColor="white"
            iconPosition="left"
            icon="person-add"
            textClassName="ml-3 text-white font-jakarta-semibold text-lg"
            style={{
              borderRadius: 9999,
              minHeight: 50,
            }}
          />

          {/* Add Dummy List */}
          <ActionButton
            colors={["#10B981", "#059669"]}
            label="Add Dummies"
            onPress={onAddDummyList}
            textColor="white"
            iconPosition="left"
            icon="list"
            textClassName="ml-3 text-white font-jakarta-semibold text-lg"
            style={{
              borderRadius: 9999,
              minHeight: 50,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-neutral-600 text-lg font-jakarta-semibold">
          📋 List of Purok
        </Text>

        <View className="flex-row items-center space-x-2 gap-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onAddDummyList?.()}
            className="bg-green-100 p-0.5 rounded-full shadow-sm"
          >
            <Ionicons name="list-circle" size={32} color="#059669" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onAddPress()}
            className="bg-blue-100 p-0.5 rounded-full shadow-sm"
          >
            <Ionicons name="add-circle" size={30} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        renderItem={renderItem}
        data={data}
        keyExtractor={(item) => item.purok}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};
