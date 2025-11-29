import { Stack } from "expo-router";
import Animated from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";

export default function RootLayout() {
  const { theme, animatedStyle } = useTheme();

  return (
    <Animated.View
      style={[
        { flex: 1, backgroundColor: theme.background },
        animatedStyle,
      ]}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </Animated.View>
  );
}
