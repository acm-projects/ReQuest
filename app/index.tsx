import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/welcome" />; // Automatically redirects to Welcome.tsx
}
