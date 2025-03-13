import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SplashScreen } from 'expo-router';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isAuthenticated: boolean | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return; // Don't redirect while checking auth

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/');
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  useFrameworkReady();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was encountered)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useProtectedRoute(isAuthenticated);

  // Show a loading state while checking authentication and loading fonts
  if (!fontsLoaded || isAuthenticated === null) {
    return null; // This keeps the splash screen visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}