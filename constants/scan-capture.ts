import { ScanCaptureMode } from "@/stores/settingsStore";
import { Ionicons } from "@expo/vector-icons";

export interface ScanCaptureOption {
  mode: ScanCaptureMode;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/** The ways the R1-04 scan button can get a picture of the sheet. */
export const SCAN_CAPTURE_OPTIONS: ScanCaptureOption[] = [
  {
    mode: "camera",
    label: "Camera",
    hint: "Take a plain photo of the sheet",
    icon: "camera-outline",
  },
  {
    mode: "scanner",
    label: "Document scanner",
    hint: "Auto-captures the page, straightened and cleaned up",
    icon: "scan-outline",
  },
  {
    mode: "library",
    label: "Photo library",
    hint: "Choose a photo already on the phone",
    icon: "images-outline",
  },
];
