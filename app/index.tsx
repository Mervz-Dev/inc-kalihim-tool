import { useAuth } from "@/utils/hooks/useAuth"; // your logic
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { checkIfPasswordExists } = useAuth();
  useEffect(() => {
    const init = async () => {
      const hasPassword = await checkIfPasswordExists();
      if (hasPassword) {
        router.replace("/auth-screen"); // redirect to auth
      } else {
        router.replace("/set-password");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // or a splash/loading screen
}
