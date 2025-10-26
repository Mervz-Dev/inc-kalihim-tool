import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  distrito?: string;
  lokal?: string;
  lokalCode?: string;
  distritoCode?: string;
  biometricsEnabled: boolean;
  setField: (
    key: keyof Omit<
      SettingsState,
      "setField" | "biometricsEnabled" | "setBiometrics"
    >,
    value: string
  ) => void;
  setBiometrics: (enabled: boolean) => void;
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
      setField: (key, value) => set({ [key]: value }),
      setBiometrics: (enabled) => set({ biometricsEnabled: enabled }),
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
