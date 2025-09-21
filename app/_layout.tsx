import { initializeDB } from "@/services/sql-lite/db";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

const DATABASE_NAME = "kapatid.db";

const RootLayout = () => {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDB}>
      <StatusBar style="dark" backgroundColor="#FFF" translucent={false} />
      <GestureHandlerRootView className="flex-1">
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <Stack initialRouteName="index">
              <Stack.Screen
                name="index"
                options={{ headerShown: false, headerTitle: "Dashboard" }}
              />
              <Stack.Screen
                name="purok"
                options={{ headerShown: false, headerTitle: "Purok" }}
              />
              <Stack.Screen
                name="absent-viewer"
                options={{ headerShown: false, headerTitle: "Absent Viewer" }}
              />
              <Stack.Screen
                name="attendance-viewer"
                options={{
                  headerShown: false,
                  headerTitle: "Attendance Viewer",
                }}
              />
            </Stack>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
        <Toast />
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
};

export default RootLayout;
