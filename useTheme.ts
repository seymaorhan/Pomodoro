import { useState } from "react";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";

export const darkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  subtext: "#BBBBBB",
  border: "#333333",
  primary: "#4c8bf5",
};

export const lightTheme = {
  background: "#FFFFFF",
  card: "#F5F5F5",
  text: "#000000",
  subtext: "#555555",
  border: "#DDDDDD",
  primary: "#4c8bf5",
};

export function useTheme() {
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // 🔥 Tema değişiminde arka plan animasyonu
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(theme.background, { duration: 350 }),
    };
  }, [themeMode]);

  return {
    theme,
    themeMode,
    toggleTheme,
    animatedStyle, // ✅ Artık var
  };
}
