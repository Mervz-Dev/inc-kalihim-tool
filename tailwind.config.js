/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "jakarta-light": ["PlusJakartaSans-Light"],
        "jakarta-regular": ["PlusJakartaSans-Regular"],
        "jakarta-medium": ["PlusJakartaSans-Medium"],
        "jakarta-semibold": ["PlusJakartaSans-SemiBold"],
        "jakarta-bold": ["PlusJakartaSans-Bold"],
        "jakarta-extrabold": ["PlusJakartaSans-ExtraBold"],
        "jakarta-black": ["PlusJakartaSans-Black"],
        "jetbrains-regular": ["JetBrainsMono-Regular"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".jakarta-light": { fontFamily: "PlusJakartaSans-Light" },
        ".jakarta-regular": { fontFamily: "PlusJakartaSans-Regular" },
        ".jakarta-medium": { fontFamily: "PlusJakartaSans-Medium" },
        ".jakarta-semibold": { fontFamily: "PlusJakartaSans-SemiBold" },
        ".jakarta-bold": { fontFamily: "PlusJakartaSans-Bold" },
        ".jakarta-extrabold": { fontFamily: "PlusJakartaSans-ExtraBold" },
        ".jakarta-black": { fontFamily: "PlusJakartaSans-Black" },
        ".jetbrains-regular": { fontFamily: "JetBrainsMono-Regular" },
      });
    },
  ],
};
