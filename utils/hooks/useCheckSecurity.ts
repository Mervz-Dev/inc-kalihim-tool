import * as Device from "expo-device";
import { useEffect, useState } from "react";
import { useLoading } from "./useLoading";

export const useCheckSecurity = () => {
  const [isRooted, setIsRooted] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // 🟡 loader flag

  const loader = useLoading();

  useEffect(() => {
    const checkSecurity = async () => {
      try {
        loader.show();
        const rooted = await Device.isRootedExperimentalAsync();

        if (rooted) {
          setIsRooted(true);
        }
      } catch (error) {
        console.warn("Security check failed:", error);
      } finally {
        setIsChecking(false); // ✅ always stop loading
        loader.hide();
      }
    };

    checkSecurity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isRooted, isChecking };
};
