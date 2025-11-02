import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalProps,
  Pressable,
  StyleProp,
  ViewProps,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AnimatedModalProps = {
  visible: boolean;
  onClose?: () => void;
  overlayColor?: string;
  containerClassName?: string;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
} & Omit<ModalProps, "visible"> &
  ViewProps;

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  overlayColor = "rgba(0,0,0,0.3)",
  containerClassName = "flex-1 items-center justify-center px-6",
  contentClassName = "bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100",
  contentStyle,
  children,
  ...modalProps
}) => {
  const [isMounted, setIsMounted] = useState(visible);
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (visible) {
      // Mount and animate in
      setIsMounted(true);
      overlayOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Animate out smoothly before unmounting
      overlayOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      });
      scale.value = withTiming(0.95, {
        duration: 180,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isMounted) return null;

  return (
    <Modal visible transparent animationType="none" {...modalProps}>
      <Animated.View
        style={[animatedOverlayStyle, { backgroundColor: overlayColor }]}
        className={containerClassName}
      >
        {onClose && (
          <Pressable
            onPress={onClose}
            className="absolute top-0 bottom-0 left-0 right-0"
          />
        )}

        <Animated.View
          style={[animatedContentStyle, contentStyle]}
          className={contentClassName}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
