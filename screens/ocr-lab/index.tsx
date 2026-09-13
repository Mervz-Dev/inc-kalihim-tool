import { ActionButton } from "@/components/action-button";
import { Header } from "@/components/header";
import { BLANK_REASON_KEY, CODE_DEFINITION_BY_KEY } from "@/constants/codes";
import {
  isHandwritingOcrSupported,
  recognizeText,
} from "@/modules/handwriting-ocr";
import {
  readReasonCells,
} from "@/screens/percent-generator/components/scan-form/useScanForm";
import { buildRows } from "@/utils/ocr/form-rows";
import { classifyReason } from "@/utils/ocr/reason-classifier";
import {
  CodeSuggestion,
  FormLayout,
  OcrResult,
  ScannedRow,
} from "@/utils/ocr/types";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/**
 * OCR Lab — development-only.
 *
 * Runs the exact scan pipeline the R1-04 card uses over any photo and lays
 * every intermediate result bare: what the recognizer read, every alternative
 * reading per cell, which keyword the classifier matched and with what score,
 * and how long each pass took. This is where the keyword list and thresholds
 * get tuned against real sheets before a release, and where the JSON fixtures
 * for the unit tests come from ("Copy JSON").
 */

interface LabRun {
  uri: string;
  full: OcrResult;
  layout: FormLayout;
  rows: ScannedRow[];
  readings: string[][];
  suggestions: CodeSuggestion[];
  timing: { fullMs: number; cellsMs: number };
}

const codeLabel = (suggestion: CodeSuggestion) =>
  suggestion.key ? CODE_DEFINITION_BY_KEY[suggestion.key].code : "—";

export default function OcrLabScreen() {
  const [run, setRun] = useState<LabRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [enhance, setEnhance] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const analyze = async () => {
    if (!isHandwritingOcrSupported) {
      Toast.show({ type: "error", text1: "Not supported on this device" });
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
      exif: false,
      selectionLimit: 1,
    });
    if (picked.canceled) return;

    const uri = picked.assets[0].uri;
    setBusy(true);

    try {
      const t0 = Date.now();
      const full = await recognizeText(uri, { enhance });
      const t1 = Date.now();
      const { rows, layout } = buildRows(full);
      const readings = await readReasonCells(uri, rows);
      const t2 = Date.now();
      const suggestions = readings.map((r) => classifyReason(r));

      setRun({
        uri,
        full,
        layout,
        rows,
        readings,
        suggestions,
        timing: { fullMs: t1 - t0, cellsMs: t2 - t1 },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Analysis failed",
        text2: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  };

  const copyJson = async () => {
    if (!run) return;
    await Clipboard.setStringAsync(
      JSON.stringify(
        {
          full: run.full,
          layout: run.layout,
          rows: run.rows,
          readings: run.readings,
          suggestions: run.suggestions,
        },
        null,
        2
      )
    );
    Toast.show({ type: "success", text1: "Copied run as JSON" });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-4">
      <View className="px-4 mb-2">
        <Header title="OCR Lab" subtitle="Development calibration" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-jakarta-semibold text-gray-800">
              Enhance (grayscale + contrast)
            </Text>
            <Switch value={enhance} onValueChange={setEnhance} />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-jakarta-semibold text-gray-800">
              Show every reading
            </Text>
            <Switch value={showAll} onValueChange={setShowAll} />
          </View>
          <View className="flex-row gap-2">
            <ActionButton
              colors={["#60A5FA", "#2563EB"]}
              label={busy ? "Analyzing…" : "Pick photo & analyze"}
              onPress={analyze}
              disabled={busy}
              style={{ borderRadius: 999, minHeight: 46 }}
              textClassName="text-white font-jakarta-semibold"
            />
            <ActionButton
              colors={["#E5E7EB", "#D1D5DB"]}
              label="Copy JSON"
              onPress={copyJson}
              disabled={!run}
              style={{ borderRadius: 999, minHeight: 46, flex: 0.6 }}
              textClassName="text-gray-800 font-jakarta-semibold"
            />
          </View>
        </View>

        {run && (
          <>
            <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
              <Text className="text-xs font-jakarta-regular text-gray-600">
                Image {run.full.imageWidth}×{run.full.imageHeight} · full pass{" "}
                {run.timing.fullMs} ms · cells {run.timing.cellsMs} ms
              </Text>
              <Text className="text-xs font-jakarta-regular text-gray-600 mt-1">
                Layout {run.layout.fromHeaders ? "from headers" : "fallback"} ·
                reason column {run.layout.reasonLeft.toFixed(2)}–
                {run.layout.reasonRight.toFixed(2)} · {run.full.lines.length}{" "}
                observations · {run.rows.length} rows
              </Text>
            </View>

            {run.rows.map((row, i) => {
              const suggestion = run.suggestions[i];
              const top = suggestion.candidates[0];
              return (
                <View
                  key={row.blg}
                  className={`rounded-2xl p-3 mb-2 border ${
                    suggestion.key
                      ? "bg-white border-gray-100"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="w-6 text-xs font-jakarta-semibold text-gray-400">
                      {row.blg}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-sm font-jakarta-semibold text-gray-900">
                        {row.nameText || "—"}
                      </Text>
                      <Text className="text-xs font-jakarta-regular text-gray-700 mt-0.5">
                        {row.reasonText || "(nothing read on full pass)"}
                        {"  · conf "}
                        {row.reasonConfidence.toFixed(2)}
                      </Text>
                      <Text className="text-xs font-jakarta-regular text-gray-500 mt-0.5">
                        {top
                          ? `${codeLabel(suggestion)} via "${top.matched}" (${top.score.toFixed(2)})${
                              suggestion.reading ? ` from "${suggestion.reading}"` : ""
                            }`
                          : run.readings[i].length === 0
                          ? `blank cell → ${CODE_DEFINITION_BY_KEY[BLANK_REASON_KEY].code}`
                          : "no keyword matched"}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full w-10 h-10 items-center justify-center ${
                        suggestion.key ? "bg-yellow-400" : "bg-gray-200"
                      }`}
                    >
                      <Text className="font-jakarta-bold">
                        {codeLabel(suggestion)}
                      </Text>
                    </View>
                  </View>

                  {showAll && (
                    <View className="mt-2 pl-6">
                      {run.readings[i].map((reading, j) => (
                        <Text
                          key={j}
                          className="text-[11px] font-jakarta-regular text-gray-500"
                        >
                          • {reading}
                        </Text>
                      ))}
                      {suggestion.candidates.slice(1, 4).map((c) => (
                        <Text
                          key={c.key}
                          className="text-[11px] font-jakarta-regular text-gray-400"
                        >
                          {`alt ${CODE_DEFINITION_BY_KEY[c.key].code} via "${c.matched}" (${c.score.toFixed(2)})`}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {showAll && (
              <View className="bg-white rounded-2xl p-3 border border-gray-100 mt-1">
                <Text className="text-xs font-jakarta-semibold text-gray-600 mb-1">
                  Full-pass observations
                </Text>
                {run.full.lines.map((line, i) => (
                  <TouchableOpacity key={i} activeOpacity={1}>
                    <Text className="text-[11px] font-jakarta-regular text-gray-500">
                      [{line.box.x.toFixed(2)},{line.box.y.toFixed(2)}]{" "}
                      {line.text} ({line.confidence.toFixed(2)})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
