import { searchUsersByName } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
  const searchSheetPoints = useMemo(() => ["65%"], []);
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
      {/* Search Icon Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        className="w-10 h-10 rounded-full overflow-hidden shadow-lg"
      >
        <LinearGradient
          colors={["#9CA3AF", "#6B7280"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          <Ionicons name="search-outline" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheetModal
        maxDynamicContentSize={height * 0.9}
        ref={searchBottomSheetRef}
        index={1}
        snapPoints={searchSheetPoints}
        keyboardBlurBehavior="restore"
        keyboardBehavior="interactive"
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
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-jakarta-bold text-gray-900">
              Search Kapatid
            </Text>

            <TouchableOpacity
              onPress={() => searchBottomSheetRef.current?.close()}
              activeOpacity={0.8}
              className="bg-gray-100 p-2 rounded-full"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-5 shadow-sm">
            <Ionicons name="search" size={20} color="#6B7280" />
            <BottomSheetTextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="Search by name..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={handleSearch}
              onBlur={() => searchBottomSheetRef.current?.snapToIndex(0)}
            />
          </View>

          {/* Content States */}
          {loading ? (
            <ActivityIndicator size="small" color="gray" />
          ) : query.trim().length === 0 ? (
            <View className="flex-1 h-[250px] justify-center items-center ">
              <Ionicons name="people-outline" size={50} color="#9CA3AF" />
              <Text className="text-gray-500 text-base mt-3">
                Start typing to search kapatid
              </Text>
            </View>
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
                        <Text className="text-white text-xs font-jakarta-bold">
                          S1
                        </Text>
                      </View>
                      <View
                        className={`px-3 py-1 rounded-full ${
                          user.secondSession ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        <Text className="text-white text-xs font-jakarta-bold">
                          S2
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Name + Gender */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-jakarta-semibold text-lg">
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
          ) : (
            // 🟡 No results state
            <View className="flex-1 justify-center items-center mt-20">
              <Ionicons name="search-outline" size={42} color="#9CA3AF" />
              <Text className="text-gray-500 text-base mt-3">
                No results found
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
