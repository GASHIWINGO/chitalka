import { Stack } from "expo-router";

// Основной компонент для настройки маршрутов и отображения заголовков
export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
