import { ActionButton } from "@/components/action-button";
import { CODE_DEFINITION_BY_KEY } from "@/constants/codes";
import { CODES } from "@/constants/percent";
import { Percent } from "@/types/percent";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { RefObject, useMemo, useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ReviewRow,
  ReviewState,
  isApplied,
  otherSession,
  sessionLabel,
} from "./useScanForm";

interface ScanReviewSheetProps {
  sheetRef: RefObject<BottomSheetModal | null>;
  review: ReviewState | null;
  onSetRowCode: (blg: number, key: keyof Percent.Codes | null) => void;
  onSetIncludeOtherSession: (value: boolean) => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

const codeLabel = (key: keyof Percent.Codes | null) =>
  key ? CODE_DEFINITION_BY_KEY[key].code : "—";

const CodePicker = ({
  selected,
  onSelect,
}: {
  selected: keyof Percent.Codes | null;
  onSelect: (key: keyof Percent.Codes | null) => void;
}) => (
  <View className="flex-row flex-wrap gap-1.5 mt-2">
    {CODES.map((key) => {
      const isSelected = key === selected;
      return (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect(key)}
          activeOpacity={0.8}
          className={`px-3 py-1.5 rounded-full border ${
            isSelected
              ? "bg-yellow-400 border-yellow-500"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <Text className="text-xs font-jakarta-bold text-gray-900">
            {CODE_DEFINITION_BY_KEY[key].code}
          </Text>
        </TouchableOpacity>
      );
    })}
    <TouchableOpacity
      onPress={() => onSelect(null)}
      activeOpacity={0.8}
      className={`px-3 py-1.5 rounded-full border ${
        selected === null
          ? "bg-gray-300 border-gray-400"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <Text className="text-xs font-jakarta-bold text-gray-700">Skip</Text>
    </TouchableOpacity>
  </View>
);

const Row = ({
  row,
  expanded,
  onToggle,
  onSelect,
}: {
  row: ReviewRow;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (key: keyof Percent.Codes | null) => void;
}) => {
  const tone = row.needsAttention
    ? "bg-amber-50 border-amber-200"
    : "bg-white border-gray-100";

  return (
    <View className={`rounded-2xl p-3 mb-2 border ${tone}`}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        className="flex-row items-center"
      >
        <Text className="w-6 text-xs font-jakarta-semibold text-gray-400">
          {row.blg}
        </Text>

        <View className="flex-1 mr-2">
          <View className="flex-row items-center">
            <Text
              numberOfLines={1}
              className="text-sm font-jakarta-semibold text-gray-900 flex-shrink"
            >
              {row.matchedName ?? row.nameText ?? "—"}
            </Text>
            {row.matchedName === null && row.nameText ? (
              <Ionicons
                name="help-circle"
                size={14}
                color="#d97706"
                style={{ marginLeft: 4 }}
              />
            ) : null}
          </View>
          <Text
            numberOfLines={2}
            className={`text-xs font-jakarta-regular mt-0.5 ${
              row.reasonText && !row.blankReason
                ? "text-gray-600"
                : "text-gray-400 italic"
            }`}
          >
            {row.blankReason
              ? "no reason written · counted as G"
              : row.reasonText || "unreadable"}
            {row.understoodAs ? ` → ${row.understoodAs}` : ""}
            {row.lowConfidence ? "  · unsure" : ""}
            {row.key && !isApplied(row.key) ? "  · not added to the card" : ""}
          </Text>
        </View>

        <View
          className={`rounded-full w-11 h-11 items-center justify-center ${
            isApplied(row.key)
              ? "bg-yellow-400"
              : row.key
              ? "bg-yellow-100 border border-yellow-300"
              : "bg-gray-200"
          }`}
        >
          <Text className="text-black font-jakarta-bold text-base">
            {codeLabel(row.key)}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && <CodePicker selected={row.key} onSelect={onSelect} />}
    </View>
  );
};

export const ScanReviewSheet = ({
  sheetRef,
  review,
  onSetRowCode,
  onSetIncludeOtherSession,
  onConfirm,
  onDismiss,
}: ScanReviewSheetProps) => {
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["80%"], []);
  const [expandedBlg, setExpandedBlg] = useState<number | null>(null);

  const { summary, skipped } = useMemo(() => {
    const counts = new Map<keyof Percent.Codes, number>();
    const notApplied = new Map<keyof Percent.Codes, number>();
    review?.rows.forEach((row) => {
      if (!row.key) return;
      const bucket = isApplied(row.key) ? counts : notApplied;
      bucket.set(row.key, (bucket.get(row.key) ?? 0) + 1);
    });
    const describe = (bucket: Map<keyof Percent.Codes, number>) =>
      CODES.filter((key) => bucket.has(key)).map(
        (key) => `${CODE_DEFINITION_BY_KEY[key].code} ×${bucket.get(key)}`
      );
    return { summary: describe(counts), skipped: describe(notApplied) };
  }, [review]);

  const attention = review?.rows.filter((row) => row.needsAttention).length ?? 0;
  const total = review?.rows.filter((row) => isApplied(row.key)).length ?? 0;

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableOverDrag={false}
      onDismiss={onDismiss}
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
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
      >
        {review && (
          <>
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xl font-jakarta-bold text-gray-900">
                Grupo {review.group} · {sessionLabel(review.sessionKey)}
              </Text>
              <TouchableOpacity
                onPress={onDismiss}
                activeOpacity={0.8}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-jakarta-regular text-gray-500 mb-3">
              {review.rows.length} row{review.rows.length === 1 ? "" : "s"} read
              {attention > 0
                ? ` · ${attention} to check (highlighted)`
                : " · everything looks clear"}
              . Tap a row to change its code.
            </Text>

            {review.rows.map((row) => (
              <Row
                key={row.blg}
                row={row}
                expanded={expandedBlg === row.blg}
                onToggle={() =>
                  setExpandedBlg((current) =>
                    current === row.blg ? null : row.blg
                  )
                }
                onSelect={(key) => {
                  onSetRowCode(row.blg, key);
                  setExpandedBlg(null);
                }}
              />
            ))}

            <View className="bg-gray-50 rounded-2xl p-3 mt-2 mb-3 border border-gray-100">
              <Text className="text-xs font-jakarta-semibold text-gray-500 mb-1">
                Will add
              </Text>
              <Text className="text-sm font-jakarta-semibold text-gray-900">
                {summary.length > 0 ? summary.join("   ") : "Nothing yet"}
              </Text>
              {skipped.length > 0 && (
                <Text className="text-xs font-jakarta-regular text-gray-500 mt-1">
                  Not added to the card: {skipped.join("   ")}
                </Text>
              )}

              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-sm font-jakarta-medium text-gray-700 flex-1 mr-2">
                  Also apply to {sessionLabel(otherSession(review.sessionKey))}{" "}
                  session
                </Text>
                <Switch
                  value={review.includeOtherSession}
                  onValueChange={onSetIncludeOtherSession}
                  trackColor={{ true: "#2563eb", false: "#d1d5db" }}
                />
              </View>
            </View>

            <ActionButton
              colors={total > 0 ? ["#60A5FA", "#2563EB"] : ["#E5E7EB", "#D1D5DB"]}
              label={
                total > 0
                  ? `Apply to ${sessionLabel(review.sessionKey)}${
                      review.includeOtherSession ? " and " + sessionLabel(otherSession(review.sessionKey)) : ""
                    }`
                  : "Nothing to apply"
              }
              onPress={onConfirm}
              disabled={total === 0}
              textClassName={`font-jakarta-semibold text-[16px] ${
                total > 0 ? "text-white" : "text-gray-500"
              }`}
              style={{ borderRadius: 999, flex: undefined, minHeight: 52 }}
            />
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
