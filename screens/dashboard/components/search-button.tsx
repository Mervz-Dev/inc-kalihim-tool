import { searchUsersByName } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface SearchButtonProps {
  onClickUser: (user: User.User) => void;
}

export const SearchButton = ({ onClickUser }: SearchButtonProps) => {
  const searchBottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const { height } = useSafeAreaFrame();
  const searchSheetPoints = useMemo(() => ["70%"], []);
  const db = useSQLiteContext();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    searchBottomSheetRef.current?.present();
  };

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchUsersByName(text.trim(), db);
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modern Gradient Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        className="flex-1 rounded-full shadow-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#EF4444", "#F87171"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="py-3 px-6 flex-row items-center justify-center rounded-full"
        >
          <Ionicons
            name="search"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-semibold text-lg">Search</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheetModal
        maxDynamicContentSize={height * 0.9}
        ref={searchBottomSheetRef}
        index={1}
        snapPoints={searchSheetPoints}
        onDismiss={() => {
          setQuery("");
          setResults([]);
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: bottom + 24 }}
        >
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Search Kapatid
          </Text>

          {/* Search Input */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-5 shadow-sm">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="Search by name..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={handleSearch}
            />
          </View>

          {/* Loader */}
          {loading ? (
            <ActivityIndicator size="small" color="gray" />
          ) : results.length > 0 ? (
            <>
              <Text className="text-gray-500 text-sm mb-3">Results</Text>
              {results.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    searchBottomSheetRef?.current?.close();
                    onClickUser(user);
                  }}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-100"
                >
                  {/* Meta Info */}
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-400 text-sm">
                      {user.purok} • {user.grupo}
                    </Text>
                    <View className="flex-row gap-2">
                      <View
                        className={`px-3 py-1 rounded-full ${
                          user.firstSession ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">S1</Text>
                      </View>
                      <View
                        className={`px-3 py-1 rounded-full ${
                          user.secondSession ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">S2</Text>
                      </View>
                    </View>
                  </View>

                  {/* Name + Gender */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-semibold text-lg">
                      {user.fullname}
                    </Text>
                    <Ionicons
                      name={user.gender === "male" ? "male" : "female"}
                      size={20}
                      color={user.gender === "male" ? "#3B82F6" : "#EC4899"}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : query.length > 0 ? (
            <View className="flex-1 justify-center items-center mt-20">
              <Ionicons name="search-outline" size={42} color="#9CA3AF" />
              <Text className="text-gray-500 text-base mt-3">
                No results found
              </Text>
            </View>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
