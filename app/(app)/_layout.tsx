import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="antrean" />
      <Stack.Screen name="history" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="e-resume" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ticket-detail" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
