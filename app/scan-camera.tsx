import ScanCameraScreen from "@/screens/scan-camera";
import { Stack } from "expo-router";

/** One-tap camera for the R1-04 sheet scan; see screens/scan-camera. */
const ScanCamera = () => (
  <>
    <Stack.Screen options={{ headerShown: false, headerTitle: "Scan Camera" }} />
    <ScanCameraScreen />
  </>
);

export default ScanCamera;
