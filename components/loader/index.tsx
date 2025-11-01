import LottieView from "lottie-react-native";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface LoadingContextType {
  show: (label?: string) => void;
  hide: () => void;
}

export const LoadingContext = createContext<LoadingContextType>({
  show: () => {},
  hide: () => {},
});

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const show = useCallback(
    (text?: string) => {
      setLabel(text ?? "");
      setIsMounted(true);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    },
    [opacity, scale]
  );

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setIsMounted)(false);
        runOnJS(setLabel)(null);
      }
    });
    scale.value = withTiming(0.9, { duration: 200 });
  }, [opacity, scale]);

  const animatedBackdrop = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const contextValue = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <>
      <LoadingContext.Provider value={contextValue}>
        {children}
      </LoadingContext.Provider>

      {isMounted && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            },
            animatedBackdrop,
          ]}
        >
          <Animated.View
            style={{
              width: 125,
              height: 125,
              borderRadius: 24,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <LottieView
              source={require("@/assets/animations/loading.json")}
              autoPlay
              loop
              style={{ width: 110, height: 110 }}
            />

            {label && (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "#374151",
                  fontWeight: "600",
                  textAlign: "center",
                  bottom: 22,
                }}
              >
                {label}
              </Text>
            )}
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
};
