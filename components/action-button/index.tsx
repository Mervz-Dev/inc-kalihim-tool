import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ColorValue,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ActionButtonProps {
  colors: string[];
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "top" | "left" | "right";
  style?: StyleProp<ViewStyle>; // traditional style
  className?: string; // Tailwind / NativeWind class for outer container
  textColor?: string; // applies to both icon and label
  textStyle?: StyleProp<TextStyle>; // traditional text style
  textClassName?: string; // Tailwind / NativeWind class for Text
  disabled?: boolean; // new prop
}

export const ActionButton = ({
  colors,
  label,
  onPress,
  icon,
  iconPosition = "top",
  style,
  className,
  textColor = "white",
  textStyle,
  textClassName,
  disabled = false,
}: ActionButtonProps) => {
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const borderRadius = flattenedStyle.borderRadius ?? 12;

  let flexDirection: "row" | "column" = "column";
  let iconMarginStyle: any = { marginBottom: 3 };

  if (iconPosition === "left" || iconPosition === "right") {
    flexDirection = "row";
    iconMarginStyle =
      iconPosition === "left" ? { marginRight: 6 } : { marginLeft: 6 };
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      className={className} // NativeWind for outer container
      style={[
        {
          flex: 1,
          borderRadius,
          opacity: disabled ? 0.6 : 1,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
            },
            android: {
              elevation: 2,
            },
          }),
        },
        style,
      ]}
    >
      <View style={{ borderRadius, overflow: "hidden" }}>
        <LinearGradient
          colors={colors as [ColorValue, ColorValue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: flattenedStyle.paddingVertical ?? 10,
            paddingHorizontal: flattenedStyle.paddingHorizontal ?? 16,
            minHeight: flattenedStyle.minHeight || 48,
            height: flattenedStyle.height,
          }}
        >
          {icon && iconPosition === "top" && (
            <Ionicons
              name={icon}
              size={20}
              color={textColor}
              style={iconMarginStyle}
            />
          )}
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={20}
              color={textColor}
              style={iconMarginStyle}
            />
          )}
          <Text
            style={
              !textClassName
                ? [
                    {
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "Jakarta-SemiBold",
                      textAlign: "center",
                    },
                    textStyle,
                  ]
                : undefined
            }
            className={textClassName} // NativeWind class for Text
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={20}
              color={textColor}
              style={iconMarginStyle}
            />
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};
