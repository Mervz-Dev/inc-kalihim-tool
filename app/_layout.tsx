import { LoadingProvider } from "@/components/loader";
import { DATABASE_FILE_NAME } from "@/constants/database";
import { initializeDB } from "@/services/sql-lite/db";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

const RootLayout = () => {
  usePreventScreenCapture();

  return (
    <>
      <LoadingProvider>
        <SQLiteProvider databaseName={DATABASE_FILE_NAME} onInit={initializeDB}>
          <StatusBar style="dark" backgroundColor="#FFF" translucent={false} />
          <GestureHandlerRootView className="flex-1">
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                <Stack>
                  <Stack.Screen
                    name="auth-screen"
                    options={{ headerShown: false, headerTitle: "Auth" }}
                  />
                  <Stack.Screen
                    name="set-password"
                    options={{
                      headerShown: false,
                      headerTitle: "Set Password",
                    }}
                  />
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="dashboard"
                    options={{ headerShown: false, headerTitle: "Dashboard" }}
                  />
                  <Stack.Screen
                    name="purok"
                    options={{ headerShown: false, headerTitle: "Purok" }}
                  />
                  <Stack.Screen
                    name="absent-viewer"
                    options={{
                      headerShown: false,
                      headerTitle: "Absent Viewer",
                    }}
                  />
                  <Stack.Screen
                    name="attendance-viewer"
                    options={{
                      headerShown: false,
                      headerTitle: "Attendance Viewer",
                    }}
                  />
                  <Stack.Screen
                    name="percent-generator"
                    options={{
                      headerShown: false,
                      headerTitle: "Percent Generator",
                    }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{
                      headerShown: false,
                      headerTitle: "Settings",
                    }}
                  />
                </Stack>
              </SafeAreaProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SQLiteProvider>
      </LoadingProvider>
      <Toast />
    </>
  );
};

export default RootLayout;
