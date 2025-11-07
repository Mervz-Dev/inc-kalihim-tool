import { CODES } from "@/constants/percent";
import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SessionCard } from "../session-card";

interface GroupCardProps {
  item: Percent.GroupValues;
  index: number;
  width: number;
  sNumber?: { count: number }[];
  handleButtonPress: (
    groupIndex: number,
    codeKey: keyof Percent.Session | "in" | "out",
    sessionKey: Percent.SessionKey,
    undo?: boolean
  ) => void;
  handleReset: (groupIndex: number) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  item,
  index,
  width,
  sNumber,
  handleButtonPress,
  handleReset,
}) => {
  const historyRef = useRef<
    {
      groupIndex: number;
      sessionKey: Percent.SessionKey;
      codeKey: keyof Percent.Session | "in" | "out";
    }[]
  >([]);

  const handleUndo = () => {
    const lastAction = historyRef.current.pop();
    if (!lastAction) return;

    const { groupIndex, sessionKey, codeKey } = lastAction;
    handleButtonPress(groupIndex, codeKey, sessionKey, true); // true = undo
  };

  const onSessionPress = (
    groupIndex: number,
    sessionKey: Percent.SessionKey,
    codeKey: keyof Percent.Session | "in" | "out"
  ) => {
    historyRef.current.push({ groupIndex, sessionKey, codeKey });
    handleButtonPress(groupIndex, codeKey, sessionKey);
  };

  return (
    <View style={{ width }} className="p-4 pt-2">
      <View className="bg-white rounded-3xl shadow-md p-5 border border-gray-100">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-xl font-jakarta-bold text-gray-900">
              Grupo {item.group}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="person-circle" size={16} color="#2563eb" />
              <Text className="ml-1 text-sm font-jakarta-medium text-gray-600">
                {sNumber?.[index]?.count || 0} members
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-1 gap-2">
            <TouchableOpacity
              onPress={() => {
                handleReset(index);
                historyRef.current = []; // clear history on reset
              }}
              activeOpacity={0.85}
              className="flex-row items-center px-2.5 py-1.5 rounded-xl bg-yellow-100 border border-yellow-300"
            >
              <Ionicons name="refresh" size={16} color="#854d0e" />
              <Text className="ml-1 text-yellow-900 text-xs font-jakarta-semibold">
                Reset
              </Text>
            </TouchableOpacity>
            {historyRef.current.length > 0 && (
              <TouchableOpacity
                onPress={handleUndo}
                activeOpacity={0.7}
                className="flex-row items-center px-2.5 py-1.5 rounded-xl bg-yellow-100 border border-yellow-300"
              >
                <Ionicons name="arrow-undo" size={16} color="#854d0e" />
                <Text className="ml-1 text-yellow-900 text-xs font-jakarta-semibold">
                  Undo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="h-[1px] bg-gray-100 mb-3" />

        <View className="space-y-4 gap-3">
          <SessionCard
            title="Huwebes Session (Wed/Thu)"
            session={item.firstSession}
            letters={CODES}
            sessionKey="firstSession"
            index={index}
            handleButtonPress={(i, k, s) => onSessionPress(i, s, k)}
          />
          <SessionCard
            title="Linggo Session (Sat/Sun)"
            session={item.secondSession}
            letters={CODES}
            index={index}
            sessionKey="secondSession"
            handleButtonPress={(i, k, s) => onSessionPress(i, s, k)}
          />
        </View>
      </View>
    </View>
  );
};
