import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts as usePoppins,
} from "@expo-google-fonts/poppins";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  useFonts as usePlayfair,
} from "@expo-google-fonts/playfair-display";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/identification" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/questionnaire" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/summary" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/review" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/send" options={{ headerShown: false }} />
      <Stack.Screen name="vet/login" options={{ headerShown: false }} />
      <Stack.Screen name="vet/register" options={{ headerShown: false }} />
      <Stack.Screen name="vet/menu" options={{ headerShown: false }} />
      <Stack.Screen name="vet/anamneses" options={{ headerShown: false }} />
      <Stack.Screen name="vet/notes" options={{ headerShown: false }} />
      <Stack.Screen name="vet/search" options={{ headerShown: false }} />
      <Stack.Screen name="vet/report" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [poppinsLoaded, poppinsError] = usePoppins({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [playfairLoaded, playfairError] = usePlayfair({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  const fontsLoaded = poppinsLoaded && playfairLoaded;
  const fontError = poppinsError || playfairError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
