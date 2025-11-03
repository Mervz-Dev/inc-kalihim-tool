import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export function useAuthAction() {
  const requireAuth = async ({
    title,
    description,
    onConfirm,
    type,
  }: {
    title?: string;
    description?: string;
    onConfirm: () => void;
    type?: "action";
  }) => {
    await SecureStore.setItemAsync(
      "pendingAuthMeta",
      JSON.stringify({
        title,
        description,
      })
    );

    globalThis.__authCallback = onConfirm;

    router.push({
      pathname: "/auth-screen",
      params: {
        title: title || "Secure Access",
        type,
        description:
          description ||
          "Please confirm your identity before continuing this action.",
      },
    });
  };

  return { requireAuth };
}
