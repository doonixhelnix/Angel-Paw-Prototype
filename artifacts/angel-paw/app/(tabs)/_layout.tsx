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
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

// A biblioteca interna do Expo para detectar fontes carregadas na web
// (fontfaceobserver) tem um timeout fixo de 6s. Em redes lentas (comum no
// preview do Replit), isso gera um "unhandled promise rejection" que o
// Replit exibe como um erro fatal em tela cheia — mesmo o app continuando
// funcional (com a fonte padrão do sistema até a fonte real carregar).
// Interceptamos só esse erro específico para não quebrar a experiência.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const message = event?.reason?.message ?? "";
    if (typeof message === "string" && message.includes("timeout exceeded")) {
      event.preventDefault();
    }
  });
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="tutor/identification"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="tutor/questionnaire"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="tutor/summary" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/review" options={{ headerShown: false }} />
      <Stack.Screen name="tutor/send" options={{ headerShown: false }} />
      <Stack.Screen
        name="tutor/notifications"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="vet/login" options={{ headerShown: false }} />
      <Stack.Screen name="vet/register" options={{ headerShown: false }} />
      <Stack.Screen name="vet/menu" options={{ headerShown: false }} />
      <Stack.Screen name="vet/anamneses" options={{ headerShown: false }} />
      <Stack.Screen name="vet/notes" options={{ headerShown: false }} />
      <Stack.Screen name="vet/notify" options={{ headerShown: false }} />
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

  // Rede lenta (comum no preview do Replit) pode travar o carregamento da
  // fonte sem nunca disparar erro nem sucesso. Depois de 8s, seguimos em
  // frente com a fonte padrão do sistema em vez de travar a tela.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || timedOut) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, timedOut]);

  if (!fontsLoaded && !fontError && !timedOut) return null;

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
