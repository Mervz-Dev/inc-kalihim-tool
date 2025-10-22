import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  distrito?: string;
  lokal?: string;
  lokalCode?: string;
  distritoCode?: string;
  setField: (key: keyof Omit<SettingsState, "setField">, value: string) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      distrito: "",
      lokal: "",
      lokalCode: "",
      distritoCode: "",
      setField: (key, value) => set({ [key]: value }),
      reset: () =>
        set({
          distrito: "",
          lokal: "",
          lokalCode: "",
          distritoCode: "",
        }),
    }),
    {
      name: "settings-storage", // Storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
