import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Dimensions, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const items = [
  {
    id: "1",
    icon: "hand-left-outline",
    color: "#2563eb",
    bg: "rgba(219, 234, 254, 0.9)",
    border: "#3b82f6",
    title: "Welcome, Kapatid!",
    message:
      "This app is here to help you manage records and forms easily. Stay organized, keep your data safe, and enjoy a smoother Kalihim experience!",
  },

  {
    id: "2",
    icon: "lock-closed-outline",
    color: "#047857",
    bg: "rgba(209, 250, 229, 0.9)",
    border: "#10b981",
    title: "Security Reminder",
    message:
      "App is password-protected. Screen capture is blocked, and rooted or jailbroken devices are restricted to keep your data safe.",
  },
  {
    id: "3",
    icon: "information-circle-outline",
    color: "#2563eb",
    bg: "rgba(219, 234, 254, 0.9)",
    border: "#3b82f6",
    title: "Personal Use Only",
    message:
      "For personal kalihim use only. Data is stored locally, not shared online, and cleared weekly. Avoid sharing forms or records publicly.",
  },
  {
    id: "4",
    icon: "time-outline",
    color: "#b45309",
    bg: "rgba(254, 249, 195, 0.9)",
    border: "#facc15",
    title: "Weekly Reset",
    message:
      "The app requires you to clear sessions weekly, and some data is automatically updated when saving to keep your records accurate.",
  },
  {
    id: "5",
    icon: "archive-outline",
    color: "#0f766e",
    bg: "rgba(224, 247, 243, 0.95)",
    border: "#34d399",
    title: "Protected Exports",
    message:
      "Exported files are saved as password-protected ZIPs. Only this app can generate and unlock them, keeping shared files secure.",
  },
  {
    id: "6",
    icon: "finger-print-outline",
    color: "#1e3a8a",
    bg: "rgba(224, 231, 255, 0.9)",
    border: "#6366f1",
    title: "Stay Secure",
    message:
      "Enable biometrics for quick and safe access, and remember to update your password from time to time for extra protection.",
  },
  {
    id: "7",
    icon: "document-text-outline",
    color: "#065f46", // deep green for guidance
    bg: "rgba(209, 250, 229, 0.9)", // soft green background
    border: "#10b981",
    title: "Complete Your Info",
    message:
      "Fill in your local information in Settings if you haven’t yet. This helps auto-fill your forms and saves you time.",
  },
  {
    id: "8",
    icon: "people-outline",
    color: "#7c3aed",
    bg: "rgba(237, 233, 254, 0.9)",
    border: "#c4b5fd",
    title: "Help Other Puroks",
    message:
      "If you want to help other puroks with R104, start by creating a dummy list. This allows you to quickly generate purok grupos without adding each user manually.",
  },
];

export const InfoCarousel = () => {
  const carouselRef = useRef<any>(null);

  return (
    <View className="my-1">
      <Carousel
        ref={carouselRef}
        width={width}
        height={110} // ✅ fixed height
        data={items}
        autoPlay
        autoPlayInterval={12000}
        scrollAnimationDuration={800}
        loop
        pagingEnabled
        style={{ alignSelf: "center" }}
        renderItem={({ item }) => (
          <View
            className="width-full items-start justify-center"
            style={{ height: 110 }}
          >
            <View
              className="mx-auto my-1 px-3 py-3 rounded-xl flex-row items-start"
              style={{
                backgroundColor: item.bg,
                borderLeftWidth: 4,
                borderColor: item.border,
                width: width * 0.92,
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={item.color}
                style={{ marginTop: 2 }}
              />
              <View className="ml-2 flex-1">
                <Text
                  className="text-[13px] font-jakarta-semibold mb-0.5"
                  style={{ color: item.color }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
                <Text
                  className="text-gray-700 text-[12px] font-jakarta-regular leading-snug"
                  numberOfLines={3} // ✅ fits neatly in 110px height
                  ellipsizeMode="tail"
                >
                  {item.message}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};
