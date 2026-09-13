import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalProps,
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

/**
 * How long to wait for the native modal to report it is on screen before
 * replacing it with a fresh one and presenting again.
 */
const PRESENT_TIMEOUT_MS = 700;
const MAX_PRESENT_ATTEMPTS = 3;

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  overlayColor = "rgba(0,0,0,0.3)",
  containerClassName = "flex-1 items-center justify-center px-6",
  contentClassName = "bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100",
  contentStyle,
  children,
  onShow,
  ...modalProps
}) => {
  const [isMounted, setIsMounted] = useState(visible);
  // Changing this key replaces the native modal host with a brand-new one.
  const [presentAttempt, setPresentAttempt] = useState(0);
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  // True once iOS/Android has actually put the modal on screen (onShow).
  const isShownRef = useRef(false);

  const animateIn = useCallback(() => {
    overlayOpacity.value = withTiming(1, { duration: 200 });
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  }, [overlayOpacity, scale]);

  const handleHidden = useCallback(() => {
    isShownRef.current = false;
    setIsMounted(false);
    setPresentAttempt(0);
  }, []);

  useEffect(() => {
    if (visible) {
      if (isShownRef.current) {
        // Re-opened before the close animation finished: it is still on
        // screen, so onShow will not fire again. Animate straight back in.
        animateIn();
        return;
      }

      // Only mount here. The fade-in starts from onShow, once the modal is
      // really on screen.
      setIsMounted(true);
      return;
    }

    if (!isShownRef.current) {
      // Closed before it was ever presented: nothing to animate out.
      overlayOpacity.value = 0;
      scale.value = 0.95;
      handleHidden();
      return;
    }

    // Animate out smoothly before unmounting
    overlayOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(handleHidden)();
    });
    scale.value = withTiming(0.95, {
      duration: 180,
      easing: Easing.in(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // On iOS (new architecture), React Native marks the modal as presented
  // *before* UIKit accepts the presentation. If UIKit refuses -- e.g. the
  // screen underneath is still being pushed, which is exactly when the S#
  // modal opens -- onShow never fires and the modal never retries on its own.
  // It stays invisible. When onShow doesn't arrive in time, swap in a fresh
  // native modal (new key) so it presents again.
  useEffect(() => {
    if (!visible || !isMounted || isShownRef.current) return;

    const timer = setTimeout(() => {
      if (isShownRef.current) return;

      if (presentAttempt + 1 < MAX_PRESENT_ATTEMPTS) {
        setPresentAttempt((attempt) => attempt + 1);
      } else {
        // Out of retries: at least never leave the content transparent.
        animateIn();
      }
    }, PRESENT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [visible, isMounted, presentAttempt, animateIn]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isMounted) return null;

  return (
    <Modal
      key={presentAttempt}
      visible
      transparent
      animationType="none"
      {...modalProps}
      onShow={(event) => {
        isShownRef.current = true;
        animateIn();
        onShow?.(event);
      }}
    >
      <Animated.View
        style={[animatedOverlayStyle, { backgroundColor: overlayColor }]}
        className={containerClassName}
      >
        {/* {onClose && (
          <Pressable
            onPress={onClose}
            className="absolute top-0 bottom-0 left-0 right-0"
          />
        )} */}

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
