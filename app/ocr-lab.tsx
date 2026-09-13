import OcrLabScreen from "@/screens/ocr-lab";
import { Stack } from "expo-router";

/** Development-only calibration screen; see screens/ocr-lab. */
const OcrLab = () => (
  <>
    <Stack.Screen options={{ headerShown: false, headerTitle: "OCR Lab" }} />
    <OcrLabScreen />
  </>
);

export default OcrLab;
