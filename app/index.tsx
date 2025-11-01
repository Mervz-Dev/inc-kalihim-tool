import { useAuth } from "@/utils/hooks/useAuth";
import { useCheckSecurity } from "@/utils/hooks/useCheckSecurity";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { checkIfPasswordExists } = useAuth();
  const { isRooted, isChecking } = useCheckSecurity();

  useEffect(() => {
    if (isChecking || isRooted) return;

    const init = async () => {
      const hasPassword = await checkIfPasswordExists();
      if (hasPassword) {
        router.replace("/auth-screen");
      } else {
        router.replace("/set-password");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, isRooted]);

  if (isRooted) {
    return (
      <LinearGradient
        colors={["#111827", "#000000"]} // gradient from gray-900 to black
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            padding: 24,
            borderRadius: 20,
            alignItems: "center",
            width: "100%",
            maxWidth: 340,
          }}
        >
          <Ionicons name="warning-outline" size={64} color="#f87171" />
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "700",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Device Compromised
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            This device appears to be rooted or jailbroken. For your safety, the
            app has been disabled.
          </Text>
        </View>

        <Text
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            textAlign: "center",
            marginTop: 32,
          }}
        >
          INC Kalihim Tool Security v1.0.0 © {new Date().getFullYear()}
        </Text>
      </LinearGradient>
    );
  }

  return null;
}
