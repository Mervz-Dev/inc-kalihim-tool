import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * How the R1-04 scan button gets its picture of the attendance sheet:
 * the plain camera, the system document scanner (auto-capture, flattened and
 * cleaned page), or a photo already in the library.
 */
export type ScanCaptureMode = "camera" | "scanner" | "library";

type SettingsState = {
  distrito?: string;
  lokal?: string;
  lokalCode?: string;
  distritoCode?: string;
  biometricsEnabled: boolean;
  encryptedFileEnabled: boolean;
  setField: (
    key: keyof Omit<
      SettingsState,
      | "setField"
      | "biometricsEnabled"
      | "setBiometrics"
      | "scanCapture"
      | "setScanCapture"
      | "scanAutoApply"
      | "setScanAutoApply"
    >,
    value: string
  ) => void;
  setBiometrics: (enabled: boolean) => void;
  setEncryptedFile: (enabled: boolean) => void;
  toggleShowDetailedFullName: () => void;
  showDetailedFullName: boolean;
  scanCapture: ScanCaptureMode;
  setScanCapture: (mode: ScanCaptureMode) => void;
  /** Add a scan's counts to the card right away, skipping the review. */
  scanAutoApply: boolean;
  setScanAutoApply: (enabled: boolean) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      distrito: "",
      lokal: "",
      lokalCode: "",
      distritoCode: "",
      biometricsEnabled: false, // default value
      showDetailedFullName: false,
      encryptedFileEnabled: true,
      toggleShowDetailedFullName: () => {
        set((v) => {
          return {
            showDetailedFullName: !v.showDetailedFullName,
          };
        });
      },
      setField: (key, value) => set({ [key]: value }),
      setBiometrics: (enabled) => set({ biometricsEnabled: enabled }),
      setEncryptedFile: (enabled) => set({ encryptedFileEnabled: enabled }),
      scanCapture: "scanner",
      setScanCapture: (mode) => set({ scanCapture: mode }),
      scanAutoApply: false,
      setScanAutoApply: (enabled) => set({ scanAutoApply: enabled }),
      reset: () =>
        set({
          distrito: "",
          lokal: "",
          lokalCode: "",
          distritoCode: "",
          biometricsEnabled: false,
        }),
    }),
    {
      name: "settings-storage", // Storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
